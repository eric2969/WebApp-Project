"use client";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

// Client 子組件：單一標的卡片 (用 SSE 訂閱即時價格)
export function MarketCard({ target }: { target: any }) {
  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState<number | string>(1);

  useEffect(() => {
    const eventSource = new EventSource(
      `/api/realtime?symbol=${target.symbol}`
    );

    eventSource.onopen = () => {
      setIsLoading(false);
      console.log(`[SSE] ${target.symbol} 連線成功`);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.symbol === target.symbol) {
        setPrice(data.price);
        setChange(data.volume);
      }
    };

    eventSource.onerror = (error) => {
      toast.error(`即時價格更新失敗: ${target.symbol}`);
      eventSource.close();
      setIsLoading(false);
    };

    return () => {
      eventSource.close();
    };
  }, [target.symbol]);

  const handleTrade = async (action: "BUY" | "SELL") => {
    try {
      const response = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: target.symbol,
          action,
          quantity: qty, // 傳送使用者輸入的數量
          price: price, // (選用) 可以傳送當前看到的價格給後端驗證
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "交易失敗",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "交易成功",
        description: `${action} ${target.symbol} 已執行`,
      });
    } catch (error) {
      toast({
        title: "錯誤",
        description: "網路問題，請重試",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">{target.name}</CardTitle>
        <CardDescription>{target.symbol}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">即時價格</span>
            {isLoading ? (
              <span className="text-sm text-gray-400">載入中...</span>
            ) : (
              <span className="font-bold text-lg">
                {price > 0 ? `$${price.toFixed(2)}` : "N/A"}
              </span>
            )}
          </div>
          {/* <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">漲跌幅</span>
            {isLoading ? (
              <span className="text-sm text-gray-400">載入中...</span>
            ) : (
              <Badge variant={change > 0 ? "default" : "destructive"}>
                {change > 0 ? "+" : ""}
                {change.toFixed(2)}%
              </Badge>
            )}
          </div> */}
          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium whitespace-nowrap">
                數量:
              </span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="h-9"
              />
            </div>
            {/* 顯示預估總價 (提升使用者體驗) */}
            <div className="text-right text-xs text-gray-500">
              預估總額: ${(Number(quantity) * price).toFixed(2)}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => handleTrade("BUY")}
              disabled={isLoading || quantity == 0}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              買入
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => handleTrade("SELL")}
              disabled={isLoading || quantity == 0}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              賣出
            </Button>
          </div>
          <Link href={`/target/${target.id}`}>
            <Button variant="outline" className="w-full mt-2">
              查看詳情 <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
