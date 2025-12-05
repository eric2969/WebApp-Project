// lib/auth.ts (v4 配置，帶 debug log)
import NextAuth, { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter"; // v4 adapter
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 自訂 verifyPassword 函式 (加 log)
async function verifyPassword(plainPassword: string, hashedPassword: string) {
  console.log("[AUTH DEBUG] 開始驗證密碼... Plain: [隱藏], Hashed: [隱藏]");
  const isValid = await bcrypt.compare(plainPassword, hashedPassword);
  console.log(`[AUTH DEBUG] 密碼驗證結果: ${isValid ? "成功" : "失敗"}`);
  return isValid;
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH DEBUG] authorize 函式觸發！憑證: ", {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH DEBUG] 缺少憑證，拋出錯誤");
          throw new Error("Missing credentials");
        }

        try {
          // 查詢使用者
          console.log(`[AUTH DEBUG] 查詢使用者: ${credentials.email}`);
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log("[AUTH DEBUG] 使用者不存在");
            throw new Error("No user found");
          }

          console.log(
            `[AUTH DEBUG] 使用者找到: ID=${user.id}, Name=${user.name}, Role=${user.role}, Balance=${user.balance}`
          );
          if (!user.hashedPassword) {
            console.log("[AUTH DEBUG] 使用者無 hashedPassword");
            throw new Error("No password set");
          }

          // 驗證密碼
          const isValid = await verifyPassword(
            credentials.password as string,
            user.hashedPassword
          );
          if (!isValid) {
            console.log("[AUTH DEBUG] 密碼驗證失敗");
            throw new Error("Invalid password");
          }

          // 返回使用者 (加 log)
          console.log("[AUTH DEBUG] authorize 成功，返回使用者資料");
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            balance: user.balance,
          };
        } catch (error) {
          console.error("[AUTH DEBUG] authorize 錯誤: ", error);
          throw error; // 拋出給 NextAuth 處理
        }
      },
    }),
    // 加其他 providers 如 Google...
  ],
  secret:  process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      console.log("[AUTH DEBUG] JWT callback 觸發", { userExists: !!user });
      if (user) {
        token.role = user.role;
        token.balance = user.balance;
        console.log(
          "[AUTH DEBUG] JWT 注入自訂資料: role=",
          user.role,
          "balance=",
          user.balance
        );
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[AUTH DEBUG] Session callback 觸發");
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.balance = token.balance as number;
        session.user.purchasedSymbols = token.purchasedSymbols as string[];
        console.log(
          "[AUTH DEBUG] Session 注入: role=",
          session.user.role,
          "balance=",
          session.user.balance
        );
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development", // 啟用內建 debug (印更多 log)
};

export default NextAuth(authOptions); // v4: 返回單一 handler
