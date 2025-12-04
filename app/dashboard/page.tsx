// app/dashboard/page.tsx (Next.js App Router, NextAuth v4 相容，使用 Server Component 檢查 session)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 您的 auth 配置
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// 假資料：投資標的 (未來從 Prisma 拉)
const investmentTargets = [
  { id: "1", symbol: "BTC-USDT", name: "Bitcoin Spread", price: 65000 },
  { id: "2", symbol: "ETH-USDT", name: "Ethereum Spread", price: 3200 },
  { id: "3", symbol: "AAPL", name: "Apple Stock Spread", price: 230 },
];

export default async function DashboardPage() {
  // 伺服器端檢查 session
  const session = await getServerSession(authOptions);

  // 未登入：伺服器端重定向到 login
  if (!session) {
    redirect("/login");
  }

  // 已登入：渲染 dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard 內容 */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            {/* 標題 (左側) */}
            <h1 className="text-3xl font-bold text-gray-900">
              您的投資 Dashboard
            </h1>
            {/* 餘額卡片 (右側) - 調整 Card 寬度，避免佔滿 */}
            <Card className="bg-white shadow rounded-lg w-full max-w-xs">
              <CardContent className="p-4 flex flex-col">
                <CardHeader className="p-0 pb-1">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    帳戶餘額
                  </CardTitle>
                </CardHeader>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${session.user?.balance || 10000}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 投資標的列表 */}
            {investmentTargets.map((target) => (
              <Card
                key={target.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <CardContent className="p-6">
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {target.name}
                    </CardTitle>
                  </CardHeader>
                  <p className="text-xl font-bold text-gray-900">
                    {target.symbol}
                  </p>
                  <p className="text-lg text-green-600">${target.price}</p>
                  <Button className="mt-4 w-full" asChild>
                    <Link href={`/target/${target.id}`}>查看詳情</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* 交易歷史連結 */}
          <div className="mt-8">
            <Link href="/history">
              <Button variant="outline">查看交易歷史</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
