// app/api/realtime/route.ts
import { subscribe } from "@/lib/finnhub-websocket";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 支援兩種寫法：
  // 1. ?symbols=AAPL,TSLA,GOOGL
  // 2. ?symbol=AAPL&symbol=TSLA&symbol=GOOGL
  const symbolsParam = searchParams.get("symbols");
  const symbolParams = searchParams.getAll("symbol");
  let targetSymbols = [] as string[];
  if (symbolsParam) {
    targetSymbols = symbolsParam
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
  } else if (symbolParams.length > 0) {
    targetSymbols = symbolParams
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
  }

  // 如果完全沒傳 symbol，就訂閱全部（或依你原本邏輯決定要不要允許）
  if (targetSymbols.length === 0) {
    return new Response("請提供至少一個 symbol，例如 ?symbols=AAPL,TSLA", {
      status: 400,
    });
  }

  const stream = new ReadableStream({
    start(controller) {
      //console.log(`[REALTIME API]: Symbol: ${symbol}`);
      const send = (data: any) => {
        //console.log(`[REALTIME API]: Symbol: ${data.symbol}`);

        if (targetSymbols.length === 0 || targetSymbols.includes(data.symbol)) {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        }
      };

      const unsubscribe = subscribe(send);

      req.signal.addEventListener("abort", () => {
        unsubscribe();
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
