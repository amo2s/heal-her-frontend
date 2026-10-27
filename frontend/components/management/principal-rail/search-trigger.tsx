"use client";

import { useEffect, useState } from "react";
import { Search, Command } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-[#00FFFF]/30 transition-all group"
      >
        <Search className="w-4 h-4 text-gray-500 group-hover:text-[#00FFFF] transition-colors" />
        <span className="text-sm text-gray-400 flex-1 text-left">Search...</span>
        <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-500">
          <Command className="w-3 h-3" />
          <span>K</span>
        </kbd>
      </button>

      {/* Simple Modal - Can be expanded with kbar or cmdk */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-black border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search commands, pages, or files..."
                className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-sm"
                autoFocus
              />
              <kbd className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-mono text-gray-500">
                ESC
              </kbd>
            </div>
            <div className="p-4">
              <p className="text-xs text-gray-500 text-center">
                Start typing to search across the management dashboard...
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
