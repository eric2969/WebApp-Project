const WebSocket = require("ws");
const symbol = "ETHBTC";

const ws = new WebSocket(
  `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
);
ws.onopen = () => {
  console.log(`[WS] 連線成功，訂閱 ${symbol}`);
  ws.send(JSON.stringify({ type: "subscribe", symbol: symbol }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // 處理 trade/quote 資料
  console.log(data);
};

ws.onerror = (error) => {
  console.error(`[WS] 錯誤:`, error);
};

ws.onclose = () => {
  console.log("[WS] 連線關閉");
};

// const finnhub = require("finnhub");

// const client = new finnhub.DefaultApi(process.env.FINNHUB_API_KEY);
//   // export async function GET(req: NextRequest) {

//   //console.log(client.symbol_lookup("bitcoin"));
//   client.quote("GBTC", (err, data) => console.log(data.c || err));
