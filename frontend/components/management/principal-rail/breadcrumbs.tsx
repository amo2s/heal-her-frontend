"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // DYNAMIC ACTION SLOT LOGIC
  // If we are in the "Kids" management section, show an "Add Kid" shortcut.
  const showAddAction = pathname.includes("/kids") || pathname.includes("/projects");

  return (
    <div className="flex items-center gap-3">
      <nav className="flex items-center gap-2 overflow-hidden">
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;

          return (
            <Fragment key={href}>
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />}
              <Link 
                href={href}
                className={`text-xs font-mono tracking-tighter uppercase transition-colors whitespace-nowrap
                  ${isLast ? "text-white font-bold" : "text-gray-500 hover:text-gray-300"}`}
              >
                {segment.replace(/-/g, " ")}
              </Link>
            </Fragment>
          );
        })}
      </nav>

      {/* THE ACTION SLOT (Contextual Utility) */}
      {showAddAction && (
        <button className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00FFFF]/10 border border-[#00FFFF]/20 text-[#00FFFF] text-[10px] font-bold uppercase tracking-widest hover:bg-[#00FFFF]/20 transition-all animate-in fade-in slide-in-from-left-2">
          <Plus className="w-3 h-3" />
          Quick Add
        </button>
      )}
    </div>
  );
}