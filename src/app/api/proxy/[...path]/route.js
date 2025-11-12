// app/api/proxy/[...path]/route.js
import { NextResponse } from "next/server"

const API_BASE = process.env.API_BASE // set this on Vercel

function upstreamUrl(req, parts) {
  const qs = req.nextUrl.search
  const base = API_BASE.replace(/\/+$/, "")
  const path = parts.join("/").replace(/^\/+/, "")
  return `${base}/${path}${qs}`
}

async function forward(req, { params }) {
  const url = upstreamUrl(req, params.path)

  // Clone the body for non-GET/HEAD
  const method = req.method.toUpperCase()
  const hasBody = !["GET", "HEAD"].includes(method)
  const body = hasBody ? await req.arrayBuffer() : undefined

  // Forward only the headers we care about
  const headers = new Headers()
  // Content-Type if present
  const ct = req.headers.get("content-type")
  if (ct) headers.set("content-type", ct)
  // Auth
  const auth = req.headers.get("authorization")
  if (auth) headers.set("authorization", auth)
  // If you need cookies later for HttpOnly-cookie auth, uncomment:
  // const cookie = req.headers.get("cookie")
  // if (cookie) headers.set("cookie", cookie)

  const upstream = await fetch(url, {
    method,
    body,
    headers,
    cache: "no-store",
    // If you need to forward cookies to a different origin, you’ll also
    // need proper CORS on the backend and possibly: credentials: "include",
  })

  // Pass-through response, removing hop-by-hop headers
  const buf = await upstream.arrayBuffer()
  const respHeaders = new Headers(upstream.headers)
  respHeaders.delete("content-encoding")
  respHeaders.delete("content-length")
  respHeaders.delete("transfer-encoding")
  respHeaders.delete("connection")

  // Ensure a content-type is present (helpful for empty bodies)
  if (!respHeaders.get("content-type")) {
    respHeaders.set("content-type", "application/json")
  }

  return new NextResponse(buf, { status: upstream.status, headers: respHeaders })
}

export async function GET(req, ctx)    { return forward(req, ctx) }
export async function POST(req, ctx)   { return forward(req, ctx) }
export async function PUT(req, ctx)    { return forward(req, ctx) }
export async function PATCH(req, ctx)  { return forward(req, ctx) }
export async function DELETE(req, ctx) { return forward(req, ctx) }

// Handle CORS preflight if your frontend calls this route cross-origin
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  })
}
