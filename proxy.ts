// proxy.ts (根目錄，Next.js 16+ 相容，v4 NextAuth)
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "./lib/auth";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  // 注意：函式名改為 proxy
  console.log(
    `[PROXY DEBUG] 請求路徑: ${req.nextUrl.pathname}, 方法: ${req.method}`
  ); // 加 log: 檢查是否觸發

  const session = await getServerSession(authOptions);
  console.log(
    `[PROXY DEBUG] Session 狀態: ${
      session ? "已登入 (ID: " + session.user?.id + ")" : "未登入"
    }`
  ); // 加 log: session 細節

  // 保護路由：/dashboard/* 等
  console.log("[PROXY DEBUG] 檢查保護路由..."); // 加 log: 進入檢查
  if (
    !session &&
    req.nextUrl.pathname !== "/login" &&
    req.nextUrl.pathname !== "/register" &&
    req.nextUrl.pathname !== "/"
  ) {
    console.log("[PROXY DEBUG] 未登入，重定向到 /login"); // 加 log: 重定向觸發
    return NextResponse.redirect(new URL("/login", req.url));
  }
  console.log("[PROXY DEBUG] 已登入，允許存取"); // 加 log: 通過
  // 登入頁：已登入則跳 dashboard
  if (
    (req.nextUrl.pathname === "/login" ||
      req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname === "/register") &&
    session
  ) {
    console.log("[PROXY DEBUG] 已登入，跳轉到 /dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  console.log("[PROXY DEBUG] 允許繼續原路徑"); // 加 log: 正常通過
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // 匹配 dashboard 子路由
    "/profile/:path*", // 其他保護路由
    "/login", // 登入頁
    "/history",
    "/",
  ],
};
