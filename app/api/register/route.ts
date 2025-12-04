// app/api/register/route.ts (v4 相容，帶 debug log)
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log("[REGISTER DEBUG] 註冊請求收到");
    const { name, email, password } = await req.json();

    console.log(
      `[REGISTER DEBUG] 資料: name=${name}, email=${email}, password length=${
        password?.length || 0
      }`
    );
    //console.log("[REGISTER DEBUG] 連線至資料庫");
    //await prisma.$connect();
    // 檢查 Email 是否存在
    console.log(`[REGISTER DEBUG] 查詢 Email: ${email}`);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("[REGISTER DEBUG] Email 已存在");
      return NextResponse.json({ message: "Email 已註冊" }, { status: 400 });
    }

    // 哈希密碼
    console.log("[REGISTER DEBUG] 開始哈希密碼...");
    const hashedPassword = await hash(password, 12);
    console.log("[REGISTER DEBUG] 哈希完成");

    // 建立使用者
    console.log("[REGISTER DEBUG] 建立使用者...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword, // 確保 schema 有此欄位
        balance: 10000,
        role: "USER",
      },
    });

    console.log(`[REGISTER DEBUG] 使用者建立成功: ID=${user.id}`);
    return NextResponse.json({ message: "註冊成功", userId: user.id });
  } catch (error) {
    console.error("[REGISTER DEBUG] 註冊錯誤: ", error); // 印完整錯誤
    return NextResponse.json(
      { message: "伺服器錯誤: " + (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // 關閉連線
  }
}
