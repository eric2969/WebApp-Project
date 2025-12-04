// app/history/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// Client Component：用來顯示即時未實現損益
import HistoryClient from "@/components/history-client";

export const metadata = {
  title: "交易紀錄與持倉 - 價差投資 App",
};

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id as string;

  // 一次拉取：所有交易（包含已平倉 + 進行中）
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { target: true },
    orderBy: { createdAt: "desc" },
  });

  // 分類
  const openTrades = transactions.filter((t) => t.status === "OPEN");
  const closedTrades = transactions.filter((t) => t.status === "CLOSED");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">交易紀錄與持倉</h1>
          <p className="text-gray-600 mt-2">查看進行中持倉與歷史交易</p>
        </div>

        <Tabs defaultValue="open" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="open">
                進行中 ({openTrades.length})
              </TabsTrigger>
              <TabsTrigger value="closed">
                已結算 ({closedTrades.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-3">
              {/* <Button variant="outline" size="sm>
                <Download className="mr-2 h-4 w-4">
                匯出 CSV
              </Button> */}
              <Link href="/dashboard">
                <Button>返回 Dashboard</Button>
              </Link>
            </div>
          </div>

          {/* 進行中持倉（即時更新 */}
          <TabsContent value="open" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>進行中的持倉</span>
                  <RefreshCw className="h-5 w-5 text-gray-400 animate-spin" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {openTrades.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    目前沒有進行中的交易，快去開一筆吧！
                  </div>
                ) : (
                  // 這裡交給 Client Component 處理即時價格
                  <HistoryClient initialOpenTrades={openTrades} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 歷史交易 */}
          <TabsContent value="closed" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>歷史交易記錄</CardTitle>
              </CardHeader>
              <CardContent>
                {closedTrades.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    還沒有已結算的交易
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>標的</TableHead>
                          <TableHead>方向</TableHead>
                          <TableHead>金額</TableHead>
                          <TableHead>進場價</TableHead>
                          <TableHead>出場價</TableHead>
                          <TableHead>已實現盈虧</TableHead>
                          <TableHead>結算時間</TableHead>
                          <TableHead>操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {closedTrades.map((t) => (
                          <ClosedTradeRow key={t.id} transaction={t} />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 已結算交易列（純靜態）
function ClosedTradeRow({ transaction }: { transaction: any }) {
  const pnl = transaction.profitLoss || 0;
  const isProfit = pnl > 0;

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div>
          <p>{transaction.target.symbol}</p>
          <p className="text-sm text-gray-500">{transaction.target.name}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={transaction.type === "BUY" ? "default" : "destructive"}>
          {transaction.type === "BUY" ? "多單" : "空單"}
        </Badge>
      </TableCell>
      <TableCell>${Number(transaction.amount).toLocaleString()}</TableCell>
      <TableCell>${Number(transaction.entryPrice).toFixed(2)}</TableCell>
      <TableCell>${Number(transaction.exitPrice || 0).toFixed(2)}</TableCell>
      <TableCell className={isProfit ? "text-green-600" : "text-red-600"}>
        <div className="flex items-center gap-1">
          {isProfit ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          ${Math.abs(pnl).toFixed(2)}
        </div>
      </TableCell>
      <TableCell>
        {format(
          new Date(transaction.updatedAt || transaction.createdAt),
          "yyyy-MM-dd HH:mm",
          { locale: zhTW }
        )}
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
