// components/history-client.tsx （Client Component）
"use client";

import { usePnL } from "@/lib/pnl-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function HistoryClient({
  initialOpenTrades,
}: {
  initialOpenTrades: any[];
}) {
  const { data: pnlData, loading } = usePnL();

  // 將 SSE 推送的即時 holdings 轉成 Map 方便查找
  const liveHoldings =
    pnlData?.holdings.reduce((map: any, h: any) => {
      map[h.transactionId] = h;
      return map;
    }, {}) || {};

  if (loading) {
    return <div className="text-center py-8">載入即時報價中...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>標的</TableHead>
            <TableHead>方向</TableHead>
            <TableHead>數量</TableHead>
            <TableHead>進場價</TableHead>
            <TableHead>現價</TableHead>
            <TableHead>未實現盈虧</TableHead>
            <TableHead>百分比</TableHead>
            <TableHead>進場時間</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialOpenTrades.map((t) => {
            const live = liveHoldings[t.id];
            const latestPrice = live?.latestPrice || t.entryPrice;
            const unrealizedPnl = live?.unrealizedPnl || 0;
            const unrealizedPct = live?.unrealizedPnlPct || 0;
            const isProfit = unrealizedPnl >= 0;

            return (
              <TableRow key={t.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{t.target.symbol}</p>
                    <p className="text-sm text-gray-500">{t.target.name}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={t.type === "BUY" ? "default" : "destructive"}>
                    {t.type === "BUY" ? "多單" : "空單"}
                  </Badge>
                </TableCell>
                <TableCell>{t.quantity || 1}</TableCell>
                <TableCell>${Number(t.entryPrice).toFixed(2)}</TableCell>
                <TableCell className="font-medium">
                  ${Number(latestPrice).toFixed(2)}
                </TableCell>
                <TableCell
                  className={isProfit ? "text-green-600" : "text-red-600"}
                >
                  <div className="flex items-center gap-1">
                    {isProfit ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    ${Math.abs(unrealizedPnl).toFixed(2)}
                  </div>
                </TableCell>
                <TableCell
                  className={isProfit ? "text-green-600" : "text-red-600"}
                >
                  {isProfit ? "+" : ""}
                  {unrealizedPct.toFixed(2)}%
                </TableCell>
                <TableCell>
                  {new Date(t.createdAt).toLocaleString("zh-TW")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
