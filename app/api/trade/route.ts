// app/api/trade/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { fetchLatestPrice } from "@/lib/finnhub-websocket";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const { symbol, action, amount } = await req.json();
  try {
    // 獲取最新價格 (從 Finnhub 或 DB)
    const priceData = await fetchLatestPrice(symbol); // 假函式
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        targetId: symbol, // 查 ID
        type: action,
        amount,
        entryPrice: priceData.price,
        status: "OPEN",
      },
    });

    return NextResponse.json({ message: "交易成功", transaction });
  } catch (error) {
    return NextResponse.json({ error: "交易失敗" }, { status: 500 });
  }
}
