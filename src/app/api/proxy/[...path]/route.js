// app/api/proxy/[...path]/route.js
import { NextResponse } from "next/server"

const API_BASE = process.env.API_BASE // make sure this is set on Vercel

function upstreamUrl(req, parts) {
  const qs = req.nextUrl.search
  const base = API_BASE.replace(/\/+$/, "")
  const path = parts.join("/").replace(/^\/+/, "")
  return `${base}/${path}${qs}`
}

async function passThrough(up) {
  const buf = await up.arrayBuffer()
  const headers = new Headers(up.headers)
  headers.delete("content-encoding")
  headers.delete("content-length")
  headers.delete("transfer-encoding")
  headers.delete("connection")
  if (!headers.get("content-type")) {
    headers.set("content-type", "application/json")
  }
  return new NextResponse(buf, { status: up.status, headers })
}

export async function GET(req, { params }) {
  const url = upstreamUrl(req, params.path)

  const r = await fetch(url, {
    cache: "no-store",
    headers: {
      // ✅ forward Authorization to FastAPI
      Authorization: req.headers.get("authorization") || "",
    },
  })

  return passThrough(r)
}

export async function POST(req, { params }) {
  const url = upstreamUrl(req, params.path)
  const textBody = await req.text()

  const r = await fetch(url, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
      // ✅ forward Authorization here too
      Authorization: req.headers.get("authorization") || "",
    },
    body: textBody,
  })

  return passThrough(r)
}

export async function PATCH(req, { params }) {
  const url = upstreamUrl(req, params.path)
  const body = await req.text()

  const r = await fetch(url, {
    method: "PATCH",
    cache: "no-store",
    headers: {
      ...Object.fromEntries(req.headers),
    },
    body,
    cache: "no-store",
  })

  return passThrough(r)
}

export async function DELETE(req, { params }) {
  const url = upstreamUrl(req, params.path)

  const r = await fetch(url, {
    method: "DELETE",
    cache: "no-store",
    headers: {
      Authorization: req.headers.get("authorization") || "",
    },
  })

  return passThrough(r)
}
