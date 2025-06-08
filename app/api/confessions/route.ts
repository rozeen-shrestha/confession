import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import moment from "moment-timezone"
import { getToken } from "next-auth/jwt"

const uri = process.env.MONGODB_URI as string
const dbName = process.env.MONGODB_DB as string

let cachedClient: MongoClient | null = null

async function getClient() {
  if (cachedClient) return cachedClient
  const client = new MongoClient(uri)
  await client.connect()
  cachedClient = client
  return client
}

async function getNextAnonymousName(db: any) {
  const counter = await db.collection("counters").findOneAndUpdate(
    { _id: "confession" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  )
  let seq = counter.value?.seq
  if (seq == null) {
    const doc = await db.collection("counters").findOne({ _id: "confession" })
    seq = doc?.seq ?? 1
  }
  return `anonymous${seq}`
}

const rateLimitWindowMs = 60 * 1000
const rateLimitMax = 3
const rateLimitMap = new Map<string, { count: number; last: number }>()

function isRateLimited(ip: string | null): boolean {
  if (!ip) return false
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.last > rateLimitWindowMs) {
    rateLimitMap.set(ip, { count: 1, last: now })
    return false
  }
  if (entry.count >= rateLimitMax) {
    return true
  }
  entry.count += 1
  entry.last = now
  rateLimitMap.set(ip, entry)
  return false
}

async function getUserFromToken(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set")
  const token = await getToken({ req, secret })
  if (!token || !token.id) return null
  const client = await getClient()
  const db = client.db(dbName)
  let userId
  try {
    userId = new ObjectId(String(token.id))
  } catch {
    return null
  }
  const user = await db.collection("users").findOne({ _id: userId })
  return user
}

export async function GET(req: NextRequest) {
  // Only allow admin
  const user = await getUserFromToken(req)
  // Logging: who requested GET
  console.log("[GET /api/confessions] Request by user:", user ? { id: user._id?.toString?.(), username: user.username, role: user.role } : null)
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const client = await getClient()
  const db = client.db(dbName)
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1", 10)
  const perPage = parseInt(searchParams.get("perPage") || "40", 10)
  const skip = (page - 1) * perPage
  const total = await db.collection("confessions").countDocuments()
  const confessions = await db
    .collection("confessions")
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .toArray()
  // Logging: how many confessions returned
  console.log(`[GET /api/confessions] Returned ${confessions.length} confessions for user:`, user ? user.username : null)
  return NextResponse.json({
    confessions: confessions.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      text: c.text,
      createdAt: moment.tz(new Date(c.createdAt).getTime(), "UTC").tz("Asia/Kathmandu").toISOString(),
      ip: c.ip,
      userAgent: c.userAgent,
      forwardedFor: c.forwardedFor,
    })),
    total,
    totalPages: Math.ceil(total / perPage),
    page,
    perPage,
  })
}

export async function POST(req: NextRequest) {
  const client = await getClient()
  const db = client.db(dbName)
  const body = await req.json()
  const text = (body.text || "").toString().slice(0, 1000)
  if (!text.trim()) {
    return NextResponse.json({ error: "Text required" }, { status: 400 })
  }

  // Safely extract IP and forwarded headers
  const xForwardedFor = req.headers.get("x-forwarded-for")
  let ip: string | null = null
  if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
    ip = xForwardedFor.split(",")[0]?.trim() || null
  }

  const userAgent = req.headers.get("user-agent") || null
  const forwardedFor = xForwardedFor || null

  // Logging: POST attempt
  console.log("[POST /api/confessions] Attempt from IP:", ip, "User-Agent:", userAgent)

  if (isRateLimited(ip)) {
    // Logging: rate limit hit
    console.warn("[POST /api/confessions] Rate limit exceeded for IP:", ip)
    return NextResponse.json(
      { error: "Too many submissions. Please wait a minute before trying again." },
      { status: 429 }
    )
  }
  const name = await getNextAnonymousName(db)
  const createdAt = moment().tz("Asia/Kathmandu").toDate()
  const confession = {
    name,
    text,
    createdAt,
    ip,
    userAgent,
    forwardedFor,
  }
  const result = await db.collection("confessions").insertOne(confession)
  // Logging: confession created
  console.log("[POST /api/confessions] Created confession:", { id: result.insertedId.toString(), ip, userAgent })
  return NextResponse.json({
    confession: {
      id: result.insertedId.toString(),
      ...confession,
    },
  })
}
