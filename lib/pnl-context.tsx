// lib/pnl-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type PnLData = {
  holdings: any[];
  totalUnrealizedPnl: number;
  updatedAt: string;
};

const PnLContext = createContext<{
  data: PnLData | null;
  loading: boolean;
}>({
  data: null,
  loading: true,
});

export function PnLProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const evtSource = new EventSource("/api/realtime/open");
    let timeStamp = 0;
    evtSource.onmessage = (e) => {
      const parsed = JSON.parse(e.data);
      setData(parsed);
      console.log(
        `[PNL PROVIDER]: Subscribed data: ${parsed.totalUnrealizedPnl}`
      );
      setLoading(false);
    };

    evtSource.onerror = () => {
      evtSource.close();
      // 3秒後自動重連
      // setTimeout(() => {
      //   window.location.reload(); // 最簡單，或自己再 new 一次
      // }, 3000);
    };

    return () => {
      evtSource.close();
    };
  }, []); // 只建立一次！

  return (
    <PnLContext.Provider value={{ data, loading }}>
      {children}
    </PnLContext.Provider>
  );
}

export const usePnL = () => useContext(PnLContext);
