// components/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, ChevronDown } from "lucide-react";
import { usePnL } from "@/lib/pnl-context";
//import { useEmblaCarousel } from "embla-carousel-react"; // 可選：如果要做跑馬燈
import { useEffect, useState, useMemo } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { data: pnlData, loading: pnlLoading } = usePnL();

  // 初始餘額來自 session，之後會被即時 PnL 覆蓋
  const initialBalance = session?.user?.balance ?? "Loading...";

  // 即時帳戶權益 = 原始餘額 + 未實現損益 ＋ 已實現損益（這裡簡化只算未實現）
  const [equity, setEquity] = useState<number>(initialBalance);

  // 計算即時權益（避免無限迴圈）
  useEffect(() => {
    if (pnlLoading || !pnlData) return;

    const unrealizedPnl = pnlData.totalUnrealizedPnl || 0;
    const newEquity = initialBalance + unrealizedPnl;

    setEquity(Math.round(newEquity * 100) / 100); // 保留兩位小數
  }, [pnlData, pnlLoading, initialBalance]);

  // 顯示的顏色：賺錢綠、虧錢紅、持平灰
  const pnlColor = useMemo(() => {
    if (pnlLoading || !pnlData) return "text-gray-500";
    const pnl = pnlData.totalUnrealizedPnl;
    return pnl > 0
      ? "text-green-600"
      : pnl < 0
      ? "text-red-600"
      : "text-gray-600";
  }, [pnlData, pnlLoading]);

  // 顯示的 PnL 文字（+123.45 或 -45.67）
  const pnlText = useMemo(() => {
    if (pnlLoading || !pnlData) return "";
    const pnl = pnlData.totalUnrealizedPnl;
    return pnl >= 0 ? `+${pnl.toFixed(2)}` : pnl.toFixed(2);
  }, [pnlData, pnlLoading]);

  if (status === "loading") {
    return <div className="bg-white shadow-sm border-b h-16" />;
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              價差投資 App
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            {/* <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900"
            >
              主頁面
            </Link> */}

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-gray-600 hover:text-gray-900">
                市場 <ChevronDown className="ml-1 h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["crypto", "commodities", "stocks", "etf", "forex"].map(
                  (m) => (
                    <DropdownMenuItem key={m}>
                      <Link href={`/market/${m}`} className="w-full">
                        {m === "crypto" && "加密貨幣"}
                        {m === "commodities" && "商品期貨"}
                        {m === "stocks" && "股票"}
                        {m === "etf" && "ETF"}
                        {m === "forex" && "外匯"}
                      </Link>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              關於我們
            </Link>

            {session ? (
              <div className="flex items-center space-x-6">
                {/* 即時權益 + 損益顯示 */}
                <div className="text-right">
                  <div className="text-xs text-gray-500">帳戶權益</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold">
                      ${toLocaleString(equity)}
                    </span>
                    <span className={`text-sm font-medium ${pnlColor}`}>
                      ({pnlText})
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-300" />

                <span className="text-sm text-gray-600">
                  Hi, {session.user?.name || "Trader"}
                </span>

                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  登出
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">登入</Button>
                </Link>
                <Link href="/register">
                  <Button variant="destructive">註冊</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

// 工具：數字千分位 + 固定兩位小數
function toLocaleString(num: number): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
