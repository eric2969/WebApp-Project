// app/api/realtime/route.ts
import { subscribe } from "@/lib/finnhub-websocket";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Holding = {
  transactionId: string;
  symbol: string;
  type: "buy" | "sell";
  amount: number;
  entryPrice: number;
  latestPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPct: number;
};

type UserSubscription = {
  holdings: Map<
    string,
    {
      // key: transactionId
      symbol: string;
      type: "buy" | "sell";
      amount: number;
      entryPrice: number;
    }
  >;
  push: (data: any) => void;
};

// 全域儲存每個使用者的 SSE controller（用於價格更新時推播）
const clients = new Map<string, UserSubscription>(); // key: userId

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }
  const userId = session.user.id;
  const stream = new ReadableStream({
    async start(controller) {
      // 先查 DB 取得該使用者所有未結交易（只查一次！）
      const openTransactions = await prisma.transaction.findMany({
        where: { userId, status: "open" },
        select: {
          id: true,
          type: true,
          amount: true,
          entryPrice: true,
          target: {
            // Nested under select
            select: {
              symbol: true,
            },
          },
        },
      });

      // 轉成 Map 快取（key: transactionId）
      const holdings = new Map(
        openTransactions.map((t) => [
          t.id,
          {
            symbol: t.target.symbol,
            type: t.type,
            amount: t.amount,
            entryPrice: t.entryPrice,
          },
        ])
      );

      // 提取所有獨一無二的 symbols，用於 subscribe
      // const symbols = [
      //   ...new Set(Array.from(holdings.values()).map((h) => h.symbol)),
      // ];
      const symbols = new Map(
        Array.from(holdings.values()).map((h) => [h.symbol, new Date(0)])
      );
      //console.log(`[API OPEN]: Subscribed Symbols: ${symbols}`);
      //   // 計算並推送 PNL 的函數（用預存 holdings 計算）
      //   const pushUpdate = async (updatedSymbols: string[] = []) => {

      //   };

      //   // 先立刻推一次目前最新 PNL
      //   await pushUpdate();
      const send = (data) => {
        //console.log(`[API OPEN]: Symbol: ${data.symbol}`);
        // console.log(
        //   `[API OPEN]: Passed time:${Date.now() - symbols.get(data.symbol)}`
        // );
        if (
          !symbols.has(data.symbol) ||
          Date.now() - symbols.get(data.symbol) < 1000
        )
          return;
        symbols.set(data.symbol, Date.now());
        // console.log(
        //   `[API OPEN]: Symbol & price: ${data.symbol}, ${data.price}`
        // );
        const holdingList: Holding[] = [];
        let totalUnrealized = 0;

        for (const [txId, h] of holdings) {
          const latest = data.price; // 預防沒價格
          const unrealized =
            h.type === "BUY"
              ? (latest - h.entryPrice) * h.amount
              : (h.entryPrice - latest) * h.amount; // 空單反向
          const pct =
            h.entryPrice !== 0
              ? (unrealized / (h.entryPrice * Math.abs(h.amount))) * 100
              : 0;

          holdingList.push({
            transactionId: txId,
            symbol: h.symbol,
            type: h.type,
            amount: h.amount,
            entryPrice: h.entryPrice,
            latestPrice: latest,
            unrealizedPnl: Number(unrealized.toFixed(2)),
            unrealizedPnlPct: Number(pct.toFixed(2)),
          });
          totalUnrealized += unrealized;
        }

        const payload = {
          holdings: holdingList,
          totalUnrealizedPnl: Number(totalUnrealized.toFixed(2)),
          updatedAt: new Date().toISOString(),
        };

        controller.enqueue(`data: ${JSON.stringify(payload)}\n\n`);
      };
      // 訂閱 Finnhub，只監聽使用者持有的 symbols
      const unsubscribe = subscribe(send);

      // 記錄到全域 clients（支援多連線共用同一 push）
      //   let userSub = clients.get(userId);
      //   if (!userSub) {
      //     userSub = { holdings, push: pushUpdate };
      //     clients.set(userId, userSub);
      //   } else {
      //     // 已存在，更新 holdings（萬一 DB 變了，但正常不會）
      //     userSub.holdings = holdings;
      //     userSub.push = pushUpdate;
      //   }

      // 連線關閉時清理
      req.signal.addEventListener("abort", () => {
        unsubscribe();
        // 如果沒有其他連線，刪除 userSub
        // （這裡簡化，假設單連線；多連線需計數）
        clients.delete(userId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
