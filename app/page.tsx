// app/dashboard/page.tsx (Next.js App Router, NextAuth v4 相容)
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Shadcn/ui
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User, ChevronDown } from "lucide-react";
import Providers from "@/lib/providers"; // 您的 Client Providers (包含 SessionProvider)
import { useState } from "react";

// 假資料：投資標的 (未來從 Prisma 拉)
const investmentTargets = [
  { id: "1", symbol: "BTC-USDT", name: "Bitcoin Spread", price: 65000 },
  { id: "2", symbol: "ETH-USDT", name: "Ethereum Spread", price: 3200 },
  { id: "3", symbol: "AAPL", name: "Apple Stock Spread", price: 230 },
  // 加更多...
];

function DashboardPage() {
  return (
    <Providers>
      <DashboardContent />
    </Providers>
  );
}

export default function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg">載入中...</div>
      </div>
    );
  }

  // 未登入：引導介面
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* 英雄區塊：邀請註冊/登入 */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              歡迎來到價差投資世界
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              模擬真實價差合約交易，學習投資策略，無風險起步！
            </p>
            <div className="space-y-4">
              {/* 醒目註冊 CTA */}
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  註冊免費帳戶，開始你的投資之旅
                </Button>
              </Link>
              <p className="text-gray-500">已有帳戶？</p>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-2 border-gray-300"
                >
                  登入
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-sm text-gray-400">
              <p>為什麼選擇我們？安全模擬、無限練習、專業 K 線圖工具。</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
