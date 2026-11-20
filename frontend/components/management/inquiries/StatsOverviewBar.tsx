"use client";

import React, { useState } from "react";
import {
  Inbox,
  Clock,
  CheckCircle2,
  Archive,
  MailCheck,
  AlertTriangle,
  Users,
  ChevronDown,
  RefreshCw,
  Activity,
} from "lucide-react";
import { InquiryStats } from "@/lib/management-inquiries";
import { cn } from "@/lib/utils";

interface StatsOverviewBarProps {
  stats: InquiryStats | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function StatsOverviewBar({
  stats,
  isLoading,
  error,
  onRefresh,
}: StatsOverviewBarProps) {
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const totalInquiries = stats?.totalInquiries ?? 0;
  const openCount = stats?.byStatus?.open ?? 0;
  const repliedCount = stats?.byStatus?.replied ?? 0;
  const closedCount = stats?.byStatus?.closed ?? 0;
  const emailsDispatched = stats?.emailsDispatched ?? 0;
  const emailsPending = stats?.emailsPendingOrFailed ?? 0;
  const staffActivity = stats?.staffActivity ?? [];

  return (
    <div className="space-y-4">
      {/* Top Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-widest uppercase text-[#DA8CA0] mb-2">
            <Activity className="w-3 h-3 text-emerald-400" /> Executive Helpdesk Telemetry
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Inquiries & Correspondence Console
          </h1>
          <p className="text-xs md:text-sm text-[#CCCCD9]/70 font-light mt-0.5">
            Public intake monitoring, two-tier ticket resolution, and delivery audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {staffActivity.length > 0 && (
            <button
              type="button"
              onClick={() => setIsActivityOpen(!isActivityOpen)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                isActivityOpen
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "bg-white/5 text-[#CCCCD9] border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Responders ({staffActivity.length})</span>
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-300",
                  isActivityOpen && "rotate-180"
                )}
              />
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all disabled:opacity-50"
            title="Refresh inquiry statistics"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-[#DA8CA0]")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Total Inquiries */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#CCCCD9]/60">
              Total Inquiries
            </span>
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Inbox className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          {isLoading && !stats ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div>
              <span className="text-2xl md:text-3xl font-black text-white">{totalInquiries}</span>
              <p className="text-[10px] text-[#CCCCD9]/60 font-mono mt-1">
                {stats?.totalMessages ?? 0} total msgs
              </p>
            </div>
          )}
        </div>

        {/* Open Tickets */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#CCCCD9]/60">
              Open Tickets
            </span>
            <div className="p-2 bg-amber-500/20 rounded-xl border border-amber-500/30">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          {isLoading && !stats ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl md:text-3xl font-black",
                  openCount > 0 ? "text-amber-400" : "text-white"
                )}
              >
                {openCount}
              </span>
              {openCount > 0 && (
                <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/20">
                  Needs Action
                </span>
              )}
            </div>
          )}
        </div>

        {/* Replied Tickets */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#CCCCD9]/60">
              Replied
            </span>
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          {isLoading && !stats ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div>
              <span className="text-2xl md:text-3xl font-black text-emerald-400">
                {repliedCount}
              </span>
              <p className="text-[10px] text-emerald-400/70 font-mono mt-1">
                {stats?.staffReplies ?? 0} staff replies
              </p>
            </div>
          )}
        </div>

        {/* Closed Tickets */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#CCCCD9]/60">
              Closed
            </span>
            <div className="p-2 bg-slate-500/20 rounded-xl border border-slate-500/30">
              <Archive className="w-4 h-4 text-slate-300" />
            </div>
          </div>
          {isLoading && !stats ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div>
              <span className="text-2xl md:text-3xl font-black text-slate-300">
                {closedCount}
              </span>
              <p className="text-[10px] text-[#CCCCD9]/60 font-mono mt-1">Resolved tickets</p>
            </div>
          )}
        </div>

        {/* Relay Health */}
        <div className="col-span-2 lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-xl hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#CCCCD9]/60">
              Mailer Delivery
            </span>
            <div
              className={cn(
                "p-2 rounded-xl border",
                emailsPending > 0
                  ? "bg-rose-500/20 border-rose-500/30"
                  : "bg-emerald-500/20 border-emerald-500/30"
              )}
            >
              {emailsPending > 0 ? (
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              ) : (
                <MailCheck className="w-4 h-4 text-emerald-400" />
              )}
            </div>
          </div>
          {isLoading && !stats ? (
            <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
          ) : (
            <div>
              <span className="text-2xl md:text-3xl font-black text-white">
                {emailsDispatched}
              </span>
              <p
                className={cn(
                  "text-[10px] font-mono mt-1",
                  emailsPending > 0 ? "text-rose-400 font-bold" : "text-emerald-400/80"
                )}
              >
                {emailsPending > 0 ? `${emailsPending} pending/dropped` : "100% relay delivery"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Responder Activity Drawer */}
      {isActivityOpen && staffActivity.length > 0 && (
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Staff Responder Activity
            </h4>
            <span className="text-[10px] font-mono text-[#CCCCD9]/60">
              Sorted by reply volume
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {staffActivity.map((responder, idx) => (
              <div
                key={responder.senderId || idx}
                className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold text-white truncate">{responder.senderName}</p>
                  <p className="text-[10px] text-[#CCCCD9]/60 font-mono truncate">
                    {responder.lastReplyAt
                      ? new Date(responder.lastReplyAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "No recent replies"}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-extrabold text-xs shrink-0">
                  {responder.replyCount} {responder.replyCount === 1 ? "reply" : "replies"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-blocking Stats Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
          <span>Failed to load latest telemetry: {error}</span>
          <button
            type="button"
            onClick={onRefresh}
            className="underline font-bold hover:text-white ml-2"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
