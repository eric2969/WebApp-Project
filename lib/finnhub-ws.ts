// lib/finnhub-websocket.ts
import { WebSocket } from "ws"; // Node.js 原生 WebSocket
import { prisma } from "@/lib/prisma";

// 用來儲存當前正在進行的 1m K 棒（symbol → candle）
interface CurrentCandle {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  minuteStart: number; // 當前分鐘的起始時間戳 (ms)
}

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
      exitPrice: number;
    }
  >;
  push: (data: any) => void;
};

// 全域儲存每個使用者的 SSE controller（用於價格更新時推播）
// key: userId
// 全局變數（伺服器只會有一份）
declare global {
  var currentCandles: Map<string, CurrentCandle>;
  var subscribers: Set<(data: any) => void>; // SSE 客戶端訂閱者
  var ws: WebSocket | null;
  var latestPrices: Map<
    string,
    { price: number; volume: number; timeStamp: Date }
  >; // 全局快取
  const clients: Map<string, UserSubscription>;
}
if (process.env.NODE_ENV !== "production") {
  global.currentCandles = new Map<string, CurrentCandle>();
  global.subscribers = new Set<(data: any) => void>(); // SSE 客戶端訂閱者
  global.latestPrices = new Map<
    string,
    { price: number; volume: number; timeStamp: Date }
  >();
}

// let currentCandles = global.currentCandles || new Map<string, CurrentCandle>();
// const subscribers = global.subscribers || new Set<(data: any) => void>(); // SSE 客戶端訂閱者
// const latestPrices =
//   global.latestPrices || new Map<string, { price: number; volume: number }>(); // 全局快取

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function random(min: number, max: number) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 最大值和最小值都包含
}

function connectWebSocket() {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    console.error("FINNHUB_API_KEY 未設定");
    return;
  }
  delay(random(0, 1000));
  if (global.ws) return;
  global.ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

  global.ws.on("open", async () => {
    console.log("Finnhub WebSocket 連線成功（唯一連線）");

    try {
      // 1. 從資料庫抓出所有要監聽的 symbol
      const selectSymbols = await prisma.investmentTarget.findMany({
        select: {
          symbol: true,
        },
      });

      // 2. 取出純字串陣列
      const symbols: string[] = selectSymbols.map((item) => item.symbol);

      // 3. 訂閱每個 symbol
      symbols.forEach((symbol) => {
        global.ws!.send(
          JSON.stringify({
            type: "subscribe",
            symbol,
          })
        );
        console.log(`已訂閱 ${symbol}`);
      });

      //   // 先查 DB 取得該使用者所有未結交易（只查一次！）
      // const openTransactions = await prisma.transaction.findMany({
      //   where: { userId, status: "open" },
      //   select: {
      //     id: true,
      //     type: true,
      //     amount: true,
      //     entryPrice: true,
      //     target: {
      //       // Nested under select
      //       select: {
      //         symbol: true,
      //       },
      //     },
      //   },
      // });

      // // 轉成 Map 快取（key: transactionId）
      // const holdings = new Map(
      //   openTransactions.map((t) => [
      //     t.id,
      //     {
      //       symbol: t.target.symbol,
      //       type: t.type,
      //       amount: t.amount,
      //       entryPrice: t.entryPrice,
      //     },
      //   ])
      // );

      // // 提取所有獨一無二的 symbols，用於 subscribe
      // // const symbols = [
      // //   ...new Set(Array.from(holdings.values()).map((h) => h.symbol)),
      // // ];
      // const symbols = new Map(
      //   Array.from(holdings.values()).map((h) => [h.symbol, new Date(0)])
      // );
      // //console.log(`[API OPEN]: Subscribed Symbols: ${symbols}`);
      // //   // 計算並推送 PNL 的函數（用預存 holdings 計算）
      // //   const pushUpdate = async (updatedSymbols: string[] = []) => {

      // //   };

      // //   // 先立刻推一次目前最新 PNL
      // //   await pushUpdate();
      // const send = (data) => {
      //   //console.log(`[API OPEN]: Symbol: ${data.symbol}`);
      //   // console.log(
      //   //   `[API OPEN]: Passed time:${Date.now() - symbols.get(data.symbol)}`
      //   // );
      //   if (
      //     !symbols.has(data.symbol) ||
      //     Date.now() - symbols.get(data.symbol) < 1000
      //   )
      //     return;
      //   symbols.set(data.symbol, Date.now());
      //   // console.log(
      //   //   `[API OPEN]: Symbol & price: ${data.symbol}, ${data.price}`
      //   // );
      //   const holdingList: Holding[] = [];
      //   let totalUnrealized = 0;

      //   for (const [txId, h] of holdings) {
      //     const latest = data.price; // 預防沒價格
      //     const unrealized =
      //       h.type === "BUY"
      //         ? (latest - h.entryPrice) * h.amount
      //         : (h.entryPrice - latest) * h.amount; // 空單反向
      //     const pct =
      //       h.entryPrice !== 0
      //         ? (unrealized / (h.entryPrice * Math.abs(h.amount))) * 100
      //         : 0;

      //     holdingList.push({
      //       transactionId: txId,
      //       symbol: h.symbol,
      //       type: h.type,
      //       amount: h.amount,
      //       entryPrice: h.entryPrice,
      //       latestPrice: latest,
      //       unrealizedPnl: Number(unrealized.toFixed(2)),
      //       unrealizedPnlPct: Number(pct.toFixed(2)),
      //     });
      //     totalUnrealized += unrealized;
      //   }

      //   const payload = {
      //     holdings: holdingList,
      //     totalUnrealizedPnl: Number(totalUnrealized.toFixed(2)),
      //     updatedAt: new Date().toISOString(),
      //   };

      // });
    } catch (error) {
      console.error("訂閱 symbol 失敗:", error);
      global.ws.close();
      global.ws = null;
      setTimeout(connectWebSocket, 5000);
      return;
    }
  });

  global.ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());

    if (msg.type === "trade") {
      msg.data.forEach((trade: any) => {
        handleTrade(trade);
        // 更新即時價格快取
        global.latestPrices.set(trade.s, {
          price: trade.p,
          volume: trade.v, // 計算 change (需存 previous)
          timeStamp: new Date(trade.t),
        });
        broadcastToClients(trade.s);
      });
    }
  });

  global.ws.on("close", () => {
    console.log("Finnhub WebSocket 斷線，5 秒後重連...");
    global.ws.terminate();
    global.ws = null;
    setTimeout(connectWebSocket, 5000);
    return;
  });

  global.ws.on("error", (err) => {
    console.error("Finnhub WebSocket 錯誤:", err);
  });
}

// 處理每一筆成交
function handleTrade(trade: any) {
  const symbol = trade.s;
  const price = trade.p;
  const volume = trade.v || 0;
  const timestamp = trade.t; // ms

  const minuteStart = Math.floor(timestamp / 60000) * 60000; // 當前分鐘起始

  let candle = global.currentCandles.get(symbol);

  if (!candle || candle.minuteStart !== minuteStart) {
    // 新的一分鐘：先把上一根存 DB
    if (candle) {
      saveCandleToDB(candle);
      //broadcastToClients(candle); // 推給 SSE 客戶端
    }

    // 建立新 candle
    candle = {
      symbol,
      open: price,
      high: price,
      low: price,
      close: price,
      volume,
      minuteStart,
    };
    global.currentCandles.set(symbol, candle);
  } else {
    // 更新當前 candle
    candle.high = Math.max(candle.high, price);
    candle.low = Math.min(candle.low, price);
    candle.close = price;
    candle.volume += volume;
  }
}

// 存入資料庫
async function saveCandleToDB(candle: CurrentCandle) {
  try {
    await prisma.kLineData.upsert({
      where: {
        symbol_timestamp: {
          symbol: candle.symbol,
          timestamp: new Date(candle.minuteStart),
        },
      },
      update: {
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      },
      create: {
        symbol: candle.symbol,
        timeframe: "1m",
        timestamp: new Date(candle.minuteStart),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume,
      },
    });
  } catch (err) {
    console.error("寫入 K 線失敗:", err);
  }
}

// 推播給所有 SSE 客戶端
function broadcastToClients(symbol: string) {
  //candle: CurrentCandle) {
  // const payload = {
  //   symbol: candle.symbol,
  //   timeframe: "1m",
  //   timestamp: candle.minuteStart,
  //   o: candle.open,
  //   h: candle.high,
  //   l: candle.low,
  //   c: candle.close,
  //   v: candle.volume,
  // };
  const latest = global.latestPrices.get(symbol);
  //console.log(
  //  `[WEBSOCKET]: latest:${symbol}, ${latest.price}, ${latest.volume}`
  //);
  const payload = {
    symbol: symbol,
    price: latest?.price,
    volume: latest?.volume,
    timeStamp: latest?.timeStamp,
  };
  //console.log(`[BROADCAST] subscribers: ${subscribers.size}`);
  global.subscribers.forEach((cb) => {
    try {
      cb(payload);
      //console.log("trying to do callbacks");
    } catch (error) {
      console.error(`[WEBSOCKET] ${symbol} 錯誤:`, error);
    }
  });
}

// 修改 fetchLatestPrice 從快取讀 (即時)
export async function fetchLatestPrice(
  symbol: string
): Promise<{ price: number; volume: number }> {
  const latest = global.latestPrices.get(symbol);
  console.log(`[FETCH LATEST ENTRY PRICE]: ${latest?.price}`);
  if (latest) {
    return latest; // WebSocket 即時
  }

  // 拉舊資料
  try {
    // 先從 DB 拉最新 1m (如果 WebSocket 已入庫)
    const latest = await prisma.kLineData.findFirst({
      where: { symbol },
      orderBy: { timestamp: "desc" },
    });
    console.log(`[FUCKING DATABASE]: ${latest.close}`);
    return {
      price: latest.close,
      volume: latest.volume || 0,
    };
  } catch (error) {
    console.error(`[FETCH PRICE] ${symbol} 錯誤:`, error);
    return { price: -1, volume: -1 };
  }
}

// 提供給 SSE API 註冊客戶端
export function subscribe(callback: (data: any) => void) {
  global.subscribers.add(callback);
  //console.log(`[SUBSCRIBE] subscribers: ${subscribers.size}`);
  return () => global.subscribers.delete(callback);
}

// 啟動（只需執行一次）
connectWebSocket();

// 匯出讓其他地方可以 import 觸發啟動
//export default connectWebSocket();
