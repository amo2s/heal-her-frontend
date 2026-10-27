"use client";

import { useEffect, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function SystemPulse() {
  const [status, setStatus] = useState<"online" | "latency" | "offline">("online");

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/40 cursor-help">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse shadow-[0_0_8px] 
              ${status === 'online' ? 'bg-[#00FF00] shadow-[#00FF00]/50' : 
                status === 'latency' ? 'bg-[#FFFF00] shadow-[#FFFF00]/50' : 
                'bg-[#FF0000] shadow-[#FF0000]/50'}`} 
            />
            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">
              Pulse
            </span>
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            className="z-[100] bg-black border border-white/10 p-3 rounded-xl shadow-2xl animate-in fade-in zoom-in-95" 
            sideOffset={10}
          >
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase">System Integrity</p>
              <div className="flex justify-between gap-8 text-[9px] font-mono">
                <span className="text-gray-500">FastAPI Backend:</span>
                <span className="text-[#00FF00]">OPERATIONAL</span>
              </div>
              <div className="flex justify-between gap-8 text-[9px] font-mono">
                <span className="text-gray-500">Valkey Cache:</span>
                <span className="text-[#00FF00]">SYNCHRONIZED</span>
              </div>
            </div>
            <Tooltip.Arrow className="fill-white/10" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}