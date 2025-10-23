import { NextResponse } from "next/server";

const API_BASE = process.env.API_BASE;

function upstreamUrl(req, parts) {
  const qs = req.nextUrl.search;
  const base = API_BASE.replace(/\/+$/, "");
  const path = parts.join("/").replace(/^\/+/, "");
  return `${base}/${path}${qs}`;
}

async function passThrough(up) {
  const buf = await up.arrayBuffer();
  const headers = new Headers(up.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.delete("connection");
  if (!headers.get("content-type")) headers.set("content-type", "application/json");
  return new NextResponse(buf, { status: up.status, headers });
}

export async function GET(req, { params }) {
  const url = upstreamUrl(req, params.path);
  const r = await fetch(url, { cache: "no-store" });
  return passThrough(r);
}

export async function POST(req, { params }) {
  const url = upstreamUrl(req, params.path);
  const body = await req.arrayBuffer();
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": req.headers.get("content-type") ?? "application/json" },
    body,
    cache: "no-store",
  });
  return passThrough(r);
}