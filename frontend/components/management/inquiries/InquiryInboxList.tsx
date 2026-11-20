"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  Building,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { InquiryPagination, InquiryStatus, InquirySummary } from "@/lib/management-inquiries";
import { cn } from "@/lib/utils";

interface InquiryInboxListProps {
  inquiries: InquirySummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  searchQuery: string;
  onSearchChange: (search: string) => void;
  pagination: InquiryPagination | null;
  onPageChange: (newOffset: number) => void;
  onRefresh: () => void;
}

const STATUS_FILTERS = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Replied", value: "REPLIED" },
  { label: "Closed", value: "CLOSED" },
];

export function InquiryInboxList({
  inquiries,
  selectedId,
  onSelect,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  pagination,
  onPageChange,
  onRefresh,
}: InquiryInboxListProps) {
  // Local state for debounced search input
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [localSearch, searchQuery, onSearchChange]);

  const offset = pagination?.offset ?? 0;
  const limit = pagination?.limit ?? 20;
  const total = pagination?.total ?? 0;
  const hasMore = pagination?.hasMore ?? false;
  const canGoPrev = offset > 0;
  const canGoNext = hasMore;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const formatStatusPill = (status: InquiryStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
            OPEN
          </span>
        );
      case "REPLIED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            REPLIED
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-500/20 border border-slate-500/30 text-slate-400">
            CLOSED
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-white/10 space-y-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#CCCCD9]/50 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search sender, org, email, topic..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-[#1C1246]/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#CCCCD9]/40 outline-none focus:border-[#DA8CA0]/60 focus:ring-1 focus:ring-[#DA8CA0]/40 transition-all"
            />
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={onRefresh}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[#CCCCD9] hover:text-white transition-all disabled:opacity-50 shrink-0"
            title="Refresh inbox"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#DA8CA0]")} />
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <Filter className="w-3.5 h-3.5 text-[#CCCCD9]/50 shrink-0 mr-1" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onStatusFilterChange(f.value)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                statusFilter === f.value
                  ? "bg-[#DA8CA0] text-[#1C1246] shadow-[0_0_12px_rgba(218,140,160,0.3)] font-bold"
                  : "bg-white/5 text-[#CCCCD9]/80 hover:bg-white/10 hover:text-white border border-white/5"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiry Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 custom-scrollbar min-h-[300px]">
        {isLoading && inquiries.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-white/10 rounded" />
                  <div className="h-4 w-14 bg-white/10 rounded-full" />
                </div>
                <div className="h-5 w-3/4 bg-white/10 rounded" />
                <div className="h-3 w-1/2 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9]/50">
              <Inbox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">No inquiries found</p>
              <p className="text-xs text-[#CCCCD9]/60 font-light mt-1">
                {searchQuery || statusFilter !== "ALL"
                  ? "No tickets match your active filter or search query."
                  : "New public inquiries will appear here automatically."}
              </p>
            </div>
            {(searchQuery || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  onStatusFilterChange("ALL");
                  onSearchChange("");
                }}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#DA8CA0] border border-white/10"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          inquiries.map((inq) => {
            const isSelected = inq.id === selectedId;
            return (
              <div
                key={inq.id}
                onClick={() => onSelect(inq.id)}
                className={cn(
                  "p-4 cursor-pointer transition-all border-l-4",
                  isSelected
                    ? "bg-[#231854]/70 border-l-[#DA8CA0] shadow-[inset_0_0_20px_rgba(218,140,160,0.08)]"
                    : "border-l-transparent hover:bg-white/[0.04]"
                )}
              >
                {/* Header row: Reference ID + Status */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-extrabold text-[#DA8CA0] tracking-wider">
                    {inq.referenceCode}
                  </span>
                  {formatStatusPill(inq.status)}
                </div>

                {/* Subject */}
                <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                  {inq.subject || "Untitled Inquiry"}
                </h3>

                {/* Sender & Org */}
                <div className="flex items-center gap-3 text-xs text-[#CCCCD9]/70 mb-2">
                  <span className="flex items-center gap-1 truncate max-w-[140px]">
                    <User className="w-3 h-3 text-[#CCCCD9]/40 shrink-0" />
                    <span className="truncate">{inq.fullName}</span>
                  </span>
                  {inq.organization && (
                    <span className="flex items-center gap-1 truncate max-w-[140px]">
                      <Building className="w-3 h-3 text-[#CCCCD9]/40 shrink-0" />
                      <span className="truncate">{inq.organization}</span>
                    </span>
                  )}
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-between text-[10px] text-[#CCCCD9]/50 font-mono pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-indigo-400/80" />
                    <span>{inq.messageCount} {inq.messageCount === 1 ? "msg" : "msgs"}</span>
                    {inq.staffReplyCount > 0 && (
                      <span className="text-emerald-400/80 font-bold ml-1">
                        ({inq.staffReplyCount} replied)
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {inq.lastMessageAt || inq.updatedAt
                        ? new Date(inq.lastMessageAt || inq.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })
                        : ""}
                    </span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-[#CCCCD9]/60 shrink-0 bg-black/20">
        <span className="font-mono text-[11px]">
          {total > 0 ? (
            <>
              Page <strong className="text-white">{currentPage}</strong> of {totalPages}{" "}
              <span className="text-[#CCCCD9]/40">({total} total)</span>
            </>
          ) : (
            "0 tickets"
          )}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={!canGoPrev || isLoading}
            onClick={() => onPageChange(Math.max(0, offset - limit))}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={!canGoNext || isLoading}
            onClick={() => onPageChange(offset + limit)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
