# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests, os, time, re
from pathlib import Path
from dotenv import load_dotenv
from typing import List, Dict, Any
#Call link i was testing with
#https://drive.google.com/uc?export=download&id=1YDr9U9qBr9Aogi93t1FwBotxWUMd0wKT

# Load .env file (local dev only)
ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

app = FastAPI()

# Read from env, fallback to localhost
origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranscribeIn(BaseModel):
    downloadUri: str

@app.get("/ping")
def ping():
    return {
        "ok": True,
        "env": {
            "tokenSet": bool(os.getenv("ELEVATEAI_API_TOKEN")),
            "baseUrlSet": bool(os.getenv("ELEVATEAI_BASE_URL")),
        },
    }
# ----------------------------
# Clean-transcript extractor
# ----------------------------
SPEAKER_PREFIX_RE = re.compile(
    r"^(Dispatcher|Caller|Agent|Operator|Customer|Caller\s*\d+|Participant\s*One|Participant\s*Two)\s*[:\-]\s*",
    re.IGNORECASE,
)

def _normalize_spaces(s: str) -> str:
    # remove spaces before punctuation, collapse multiple spaces
    s = re.sub(r"\s+([,.;:!?])", r"\1", s)
    s = re.sub(r"\(\s+", "(", s)
    s = re.sub(r"\s+\)", ")", s)
    s = re.sub(r"\s{2,}", " ", s).strip()
    return s

def _tokens_from_any_shape(t_json: dict) -> List[Dict[str, Any]]:
    """
    Return a chronological list of tokens with time:
    [{start, text}], independent of participant structure.
    """
    if not isinstance(t_json, dict):
        return []
    # normalize keys
    j = {(k.lower() if isinstance(k, str) else k): v for k, v in t_json.items()}
    out: List[Dict[str, Any]] = []

    def collect(part_obj: dict):
        if not isinstance(part_obj, dict):
            return
        phrases = part_obj.get("phrases") or []
        segs = part_obj.get("phrasesegments") or part_obj.get("phraseSegments") or []
        if not isinstance(phrases, list) or not isinstance(segs, list):
            return
        for seg in segs:
            if not isinstance(seg, dict):
                continue
            idx = seg.get("phraseindex", seg.get("phraseIndex"))
            try:
                idx = int(idx)
            except (TypeError, ValueError):
                continue
            if 0 <= idx < len(phrases):
                text = str(phrases[idx]).strip()
                # strip inline speaker prefixes if present
                text = SPEAKER_PREFIX_RE.sub("", text).strip()
                start = seg.get("starttimeoffset") or seg.get("startTimeOffset") or 0
                out.append({"start": start, "text": text})

    # Prefer diarized participants if present — but we will NOT keep speaker labels
    if "participantone" in j or "participanttwo" in j:
        collect(j.get("participantone", {}))
        collect(j.get("participanttwo", {}))
    # allParticipants fallback
    if "allparticipants" in j:
        collect(j.get("allparticipants", {}))
    # channels/results fallback
    if "channels" in j and isinstance(j["channels"], list):
        for ch in j["channels"]:
            if not isinstance(ch, dict):
                continue
            for seg in ch.get("results", []):
                if isinstance(seg, dict) and seg.get("text"):
                    text = SPEAKER_PREFIX_RE.sub("", str(seg["text"]).strip())
                    out.append({"start": seg.get("start") or 0, "text": text})
    # plain transcript fallback
    if isinstance(j.get("transcript"), str) and not out:
        out.append({"start": 0, "text": j["transcript"].strip()})

    # sort chronologically
    out.sort(key=lambda r: (r.get("start") or 0))
    return out

def _extract_clean_lines(t_json: dict) -> List[str]:
    """
    Build a clean, single-speaker transcript as readable sentences/lines.
    We:
      - gather tokens from any response shape,
      - join them into sentences using punctuation as boundaries,
      - tidy spacing around punctuation.
    """
    toks = _tokens_from_any_shape(t_json)
    if not toks:
        return []

    lines: List[str] = []
    buf: List[str] = []

    def push_line():
        nonlocal buf
        if not buf:
            return
        text = " ".join(buf)
        text = _normalize_spaces(text)
        if text:
            lines.append(text)
        buf = []

    # treat these tokens as sentence terminators
    SENT_END = re.compile(r"[.!?][\"')\]]*$")

    for t in toks:
        tok = t["text"].strip()
        if not tok:
            continue
        buf.append(tok)
        if SENT_END.search(tok):
            push_line()

    # flush remaining
    push_line()

    # if we somehow ended up with no lines but had tokens, just return one joined line
    if not lines and toks:
        text = _normalize_spaces(" ".join(tt["text"] for tt in toks))
        if text:
            lines = [text]

    return lines


@app.post("/transcribe")
def transcribe(body: TranscribeIn):
    token = os.getenv("ELEVATEAI_API_TOKEN")
    base = (os.getenv("ELEVATEAI_BASE_URL") or "").rstrip("/")
    if not token or not base:
        raise HTTPException(status_code=500, detail="Missing ElevateAI env vars.")

    headers = {
        "X-API-Token": token,
        "Accept": "application/json",
    }

    # 1) Declare interaction
    declare_url = f"{base}/interactions"
    payload = {
        "type": "audio",
        "model": "echo",          # keep echo; we'll render as single-speaker
        "languageTag": "en-us",
        "downloadUri": body.downloadUri,
    }

    try:
        resp = requests.post(
            declare_url,
            json=payload,
            headers={**headers, "Content-Type": "application/json"},
            timeout=30,
        )
    except requests.RequestException as e:
        raise HTTPException(status_code=502, detail=f"Declare request error: {e}")

    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=f"Declare failed: {resp.text}")

    decl = resp.json()
    interaction_id = decl.get("interactionIdentifier") or decl.get("id")
    if not interaction_id:
        raise HTTPException(status_code=500, detail="No interaction ID returned")

    # 2) Poll for processing
    status_url = f"{base}/interactions/{interaction_id}/status"
    t_json = None
    max_retries = 30
    sleep_secs = 5

    for i in range(max_retries):
        try:
            s_resp = requests.get(status_url, headers=headers, timeout=30)
        except requests.RequestException as e:
            raise HTTPException(status_code=502, detail=f"Status request error: {e}")

        if not s_resp.ok:
            raise HTTPException(status_code=s_resp.status_code, detail=f"Status HTTP error: {s_resp.text}")

        status = str((s_resp.json() or {}).get("status", "")).lower()
        print(f"[poll {i}] status = {status}")

        if status == "processed":
            trans_url = f"{base}/interactions/{interaction_id}/transcript"
            try:
                t_resp = requests.get(trans_url, headers=headers, timeout=30)
            except requests.RequestException as e:
                raise HTTPException(status_code=502, detail=f"Transcript request error: {e}")

            if not t_resp.ok:
                raise HTTPException(status_code=t_resp.status_code, detail=f"Transcript fetch error: {t_resp.text}")

            t_json = t_resp.json()
            print("==== RAW TRANSCRIPT JSON ====")
            print(t_json)
            print("=============================")
            break
        elif status in ["processingfailed", "error", "failed"]:
            raise HTTPException(status_code=500, detail=f"Processing failed: {s_resp.text}")

        time.sleep(sleep_secs)

    if t_json is None:
        raise HTTPException(status_code=504, detail="Timed out waiting for transcript")

    # Build clean, single-speaker lines
    lines = _extract_clean_lines(t_json)

    # Keep backward-compatible "transcript" shape for your UI: one speaker label "Transcript"
    transcript_for_ui = [{"speaker": "Transcript", "text": line} for line in lines]

    return {
        "interaction_id": interaction_id,
        "transcript_lines": lines,     # string[]
        "transcript": transcript_for_ui,  # [{speaker:"Transcript", text:"..."}]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)