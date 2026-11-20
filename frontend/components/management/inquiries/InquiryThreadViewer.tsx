"use client";

import React, { useState } from "react";
import {
  Inbox,
  User,
  Building,
  Mail,
  Copy,
  Check,
  ArrowLeft,
  Shield,
  CheckCircle2,
  Clock,
  Globe,
  MessageSquare,
} from "lucide-react";
import { InquiryDetail } from "@/lib/management-inquiries";
import { cn } from "@/lib/utils";

interface InquiryThreadViewerProps {
  inquiryDetail: InquiryDetail | null;
  isLoading: boolean;
  error: string | null;
  onBackToInbox?: () => void;
  children?: React.ReactNode;
}

export function InquiryThreadViewer({
  inquiryDetail,
  isLoading,
  error,
  onBackToInbox,
  children,
}: InquiryThreadViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyRef = async (ref: string) => {
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback
    }
  };

  // 1. Loading State
  if (isLoading && !inquiryDetail) {
    return (
      <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-center items-center space-y-4 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-white/10" />
        <div className="h-5 w-48 bg-white/10 rounded" />
        <div className="h-4 w-64 bg-white/5 rounded" />
      </div>
    );
  }

  // 2. Empty Selection State
  if (!inquiryDetail) {
    return (
      <div className="h-full bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-[#CCCCD9]/40 shadow-inner">
          <Inbox className="w-8 h-8" />
        </div>
        <div className="max-w-sm space-y-1">
          <h3 className="text-base font-bold text-white">No Inquiry Selected</h3>
          <p className="text-xs text-[#CCCCD9]/60 font-light leading-relaxed">
            Select an inquiry ticket from the inbox list to inspect its chronological correspondence,
            origin metadata, and delivery logs.
          </p>
        </div>
      </div>
    );
  }

  const { inquiry, referenceCode, messages } = inquiryDetail;

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Ticket Header */}
      <div className="p-4 md:p-6 border-b border-white/10 space-y-4 shrink-0 bg-black/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onBackToInbox && (
              <button
                type="button"
                onClick={onBackToInbox}
                className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 mr-1"
                title="Back to inbox"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCopyRef(referenceCode)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#DA8CA0]/10 border border-[#DA8CA0]/30 font-mono text-xs font-extrabold text-[#DA8CA0] hover:bg-[#DA8CA0]/20 transition-all"
              title="Copy reference code"
            >
              <span>{referenceCode}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-60" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {inquiry.ipAddress && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/5 font-mono text-[10px] text-[#CCCCD9]/60">
                <Globe className="w-3 h-3 text-[#CCCCD9]/40" />
                <span>{inquiry.ipAddress}</span>
              </span>
            )}
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-mono font-bold border",
                inquiry.status === "OPEN"
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : inquiry.status === "REPLIED"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                  : "bg-slate-500/20 border-slate-500/30 text-slate-300"
              )}
            >
              {inquiry.status}
            </span>
          </div>
        </div>

        {/* Subject */}
        <h2 className="text-lg md:text-xl font-extrabold text-white leading-snug">
          {inquiry.subject || "Untitled Inquiry"}
        </h2>

        {/* Sender Meta Badges */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#CCCCD9]/80 font-light pt-1">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#DA8CA0]" />
            <strong className="text-white font-medium">{inquiry.fullName}</strong>
          </span>

          {inquiry.organization && (
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>{inquiry.organization}</span>
            </span>
          )}

          <a
            href={`mailto:${inquiry.email}`}
            className="flex items-center gap-1.5 text-emerald-400 hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{inquiry.email}</span>
          </a>

          <span className="flex items-center gap-1.5 text-[#CCCCD9]/50 font-mono text-[11px] ml-auto">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(inquiry.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </span>
        </div>
      </div>

      {/* Chronological Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 mb-2">
            {error}
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.senderType === "USER";
          return (
            <div
              key={msg.id}
              className={cn("flex flex-col max-w-[85%]", isUser ? "mr-auto items-start" : "ml-auto items-end")}
            >
              {/* Sender label and date */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[11px] font-bold text-white flex items-center gap-1">
                  {!isUser && <Shield className="w-3 h-3 text-indigo-400" />}
                  {msg.senderName || (isUser ? "Inquirer" : "Support Staff")}
                </span>
                <span className="text-[10px] text-[#CCCCD9]/50 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Message bubble */}
              <div
                className={cn(
                  "p-4 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words border",
                  isUser
                    ? "bg-black/40 border-white/10 text-[#FAFAFA]"
                    : "bg-[#231854]/80 border-indigo-500/30 text-white shadow-[0_0_20px_rgba(99,102,241,0.08)]"
                )}
              >
                {msg.body}
              </div>

              {/* Email Delivery Receipt Badge for Staff replies */}
              {!isUser && (
                <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] font-mono">
                  {msg.emailDispatched ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Email Dispatched
                    </span>
                  ) : (
                    <span className="text-amber-400/90 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Dispatch Pending / Queued
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer Slot */}
      {children && (
        <div className="p-4 md:p-6 border-t border-white/10 bg-black/30 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
