import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { AuthOptions } from "next-auth";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

export async function GET(req: Request) {
  // Check for malformed query string (multiple '?')
  const urlParts = req.url.split("?");
  if (urlParts.length > 2) {
    return NextResponse.json(
      {
        error:
          "Malformed query string. Use only one '?' and separate parameters with '&'. Example: ?username=helloooo&email=aa@aa.com",
      },
      { status: 400 }
    );
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection("users");

  // Default values
  let username = "admin";
  let email = "admin@confession.com";

  // Parse query params
  const { searchParams } = new URL(req.url);
  const qUsername = searchParams.get("username");
  const qEmail = searchParams.get("email");
  if (qUsername) username = qUsername;
  if (qEmail) email = qEmail;

  // Check session for admin role (optional: restrict to admins)
  // const session = await getServerSession(authOptions);
  // if (session?.user?.role !== "admin") {
  //   await client.close();
  //   return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  // }

  // Check if user with the requested username or email already exists
  const existingUser = await users.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    await client.close();
    return NextResponse.json({
      status: "exists",
      message: "User already exists.",
    });
  }

  // Generate a random 12-character password
  const password =
    Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-4);
  const finalPassword = password.slice(0, 12);
  const hashedPassword = await bcrypt.hash(finalPassword, 12);

  await users.insertOne({
    username,
    email,
    password: hashedPassword,
    role: "admin", // Add role
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("Admin user created:");
  console.log("Username:", username);
  console.log("Password:", finalPassword);

  await client.close();
  return NextResponse.json({
    status: "created",
    message: "Admin user created.",
  });
}
