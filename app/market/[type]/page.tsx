// app/market/[type]/page.tsx (Next.js App Router, NextAuth v4 相容)
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { MarketCard } from "@/components/marketPage";
//import { formatCurrency } from "@/lib/utils"; // 假設工具函式格式化價格

// 市場類型映射 (用於顯示中文)
const marketTypes = {
  crypto: "加密",
  commodities: "商品",
  stocks: "股票",
  etf: "ETF",
  forex: "外匯",
};

export default async function MarketPage({
  params,
}: {
  params: { type: string };
}) {
  const { type } = await params;
  const displayType = marketTypes[type as keyof typeof marketTypes] || type;

  // 從 Prisma 拉取同一類型標的
  const targets = await prisma.investmentTarget.findMany({
    where: { type }, // 過濾 type
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-white shadow-lg mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">
                  {displayType}市場
                </CardTitle>
                <CardDescription>
                  瀏覽{displayType}的投資標的與即時價格
                </CardDescription>
              </div>
              <Link href="/dashboard">
                <Button>返回 Dashboard</Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {targets.length === 0 ? (
          <Card className="bg-white shadow-lg">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">暫無 {displayType} 標的</p>
              <Link href="/dashboard">
                <Button variant="outline">開始投資</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targets.map((target) => (
              <MarketCard key={target.id} target={target} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
