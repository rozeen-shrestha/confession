import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

async function connectToDatabase() {
  const client = new MongoClient(uri);
  await client.connect();
  return client;
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"username" | "password", string> | undefined): Promise<any> {
        const client = await connectToDatabase();
        const db = client.db(dbName);
        const user = await db.collection("users").findOne({ username: credentials?.username });

        if (!user) {
          await client.close();
          return null;
        }

        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) {
          await client.close();
          return null;
        }

        // Don't close client here to avoid issues with NextAuth session callbacks
        return {
          id: user._id.toString(),
          name: user.username,
          email: user.email,
          role: user.role || "user", // Add role
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user"; // Add role to token
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role || "user"; // Add role to session
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
