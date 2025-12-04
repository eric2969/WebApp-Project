// app/api/auth/[...nextauth]/route.ts (v4 App Router 相容)
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // 匯入 config

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // v4 語法：單一 handler 作為 GET/POST
