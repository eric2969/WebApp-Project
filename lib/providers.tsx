"use client"; // 關鍵：標記為 Client Component

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { PnLProvider } from "@/lib/pnl-context";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PnLProvider>{children}</PnLProvider>
    </SessionProvider>
  );
}
