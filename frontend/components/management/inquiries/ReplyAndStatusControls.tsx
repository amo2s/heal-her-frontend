"use client";

import React, { useState, useRef } from "react";
import {
  Send,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
} from "lucide-react";
import {
  InquiryDetailHeader,
  InquiryMessageItem,
  InquiryStatus,
  ManagementInquiryRole,
  canPerformInquiryActions,
  countManagementRunes,
  sendInquiryReply,
  updateInquiryStatus,
  validateStaffReplyBody,
} from "@/lib/management-inquiries";
import { cn } from "@/lib/utils";

interface ReplyAndStatusControlsProps {
  inquiry: InquiryDetailHeader;
  userRole: ManagementInquiryRole;
  onReplySuccess: (reply: InquiryMessageItem) => void;
  onStatusChangeSuccess: (updatedInquiry: InquiryDetailHeader) => void;
}

const STATUS_OPTIONS: InquiryStatus[] = ["OPEN", "REPLIED", "CLOSED"];

export function ReplyAndStatusControls({
  inquiry,
  userRole,
  onReplySuccess,
  onStatusChangeSuccess,
}: ReplyAndStatusControlsProps) {
  const [replyBody, setReplyBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const inFlightRef = useRef(false);

  const canAct = canPerformInquiryActions(userRole);
  const isClosed = inquiry.status === "CLOSED";
  const runes = countManagementRunes(replyBody);
  const maxRunes = 10000;

  // Handle Status Update
  const handleStatusChange = async (targetStatus: InquiryStatus) => {
    if (!canAct || isUpdatingStatus || targetStatus === inquiry.status) return;

    setIsUpdatingStatus(true);
    setErrorMessage(null);

    const res = await updateInquiryStatus(inquiry.id, targetStatus);
    setIsUpdatingStatus(false);

    if (res.ok) {
      onStatusChangeSuccess(res.data);
      setSuccessToast(`Ticket status updated to ${targetStatus}`);
      setTimeout(() => setSuccessToast(null), 3000);
    } else {
      setErrorMessage(res.error.message);
    }
  };

  // Handle Staff Reply Submission
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAct || inFlightRef.current || isSending || isClosed) {
      return;
    }

    // Client-side pre-flight validation
    const { isValid, sanitized, error } = validateStaffReplyBody(replyBody);
    if (!isValid) {
      setErrorMessage(error || "Staff reply body must be between 2 and 10,000 characters.");
      return;
    }

    inFlightRef.current = true;
    setIsSending(true);
    setErrorMessage(null);

    const res = await sendInquiryReply(inquiry.id, sanitized);

    setIsSending(false);
    inFlightRef.current = false;

    if (res.ok) {
      onReplySuccess(res.data);
      setReplyBody("");
      setSuccessToast("Staff reply recorded and queued for email delivery.");
      setTimeout(() => setSuccessToast(null), 3500);
    } else {
      setErrorMessage(res.error.message);
    }
  };

  // 1. TIER 1: SUPER ADMIN EXECUTIVE READ-ONLY OVERSIGHT BANNER
  if (!canAct) {
    return (
      <div className="p-4 md:p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs md:text-sm font-bold text-white flex items-center gap-2">
            Executive Oversight Clearance (Read-Only)
          </h4>
          <p className="text-xs text-indigo-200/80 leading-relaxed font-light">
            Your Super Admin role holds full audit oversight across all correspondence. Direct ticket
            replies and status transitions are restricted to operational staff and administrators per
            Separation of Duties governance.
          </p>
        </div>
      </div>
    );
  }

  // 2. TIER 2: OPERATIONAL STAFF & ADMIN CONTROLS
  return (
    <div className="space-y-4 pt-2">
      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-[#CCCCD9]/60">
            Ticket Status:
          </span>
          <span className="text-xs font-bold font-mono text-white">{inquiry.status}</span>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-center">
          <span className="text-[10px] text-[#CCCCD9]/50 uppercase tracking-wider mr-1">
            Change To:
          </span>
          {STATUS_OPTIONS.map((st) => {
            const isCurrent = inquiry.status === st;
            return (
              <button
                key={st}
                type="button"
                disabled={isCurrent || isUpdatingStatus}
                onClick={() => handleStatusChange(st)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all",
                  isCurrent
                    ? "bg-white/10 text-white border border-white/20 opacity-90 cursor-default"
                    : "bg-white/5 text-[#CCCCD9] hover:bg-white/15 hover:text-white border border-white/5 disabled:opacity-40"
                )}
              >
                {isUpdatingStatus && !isCurrent ? (
                  <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
                ) : null}
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Closed Ticket Guard */}
      {isClosed ? (
        <div className="p-4 md:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs md:text-sm font-bold text-white">This Ticket is Closed</p>
              <p className="text-xs text-amber-200/80 font-light mt-0.5 leading-relaxed">
                Direct staff replies are locked on closed tickets to prevent accidental dispatches.
                Reopen the ticket to resume correspondence.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isUpdatingStatus}
            onClick={() => handleStatusChange("OPEN")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold text-amber-300 transition-all shrink-0 self-start sm:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reopen Ticket</span>
          </button>
        </div>
      ) : (
        /* Direct Reply Composer */
        <form onSubmit={handleSendReply} className="space-y-3">
          <div className="relative">
            <textarea
              rows={4}
              required
              disabled={isSending}
              placeholder="Type your official response to this inquiry. When sent, this reply is persisted to Supabase and automatically relayed to the inquirer's email address..."
              value={replyBody}
              onChange={(e) => {
                setReplyBody(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full bg-[#1C1246]/60 border border-white/10 rounded-2xl p-4 text-xs md:text-sm text-white placeholder:text-[#CCCCD9]/40 outline-none focus:border-[#DA8CA0]/60 focus:ring-1 focus:ring-[#DA8CA0]/40 transition-all resize-none disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-[10px] md:text-xs font-mono transition-colors",
                runes > maxRunes
                  ? "text-rose-400 font-bold"
                  : runes > maxRunes * 0.9
                  ? "text-amber-400"
                  : "text-[#CCCCD9]/50"
              )}
            >
              {runes.toLocaleString()} / {maxRunes.toLocaleString()} chars
            </span>

            <button
              type="submit"
              disabled={isSending || runes < 2 || runes > maxRunes}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#DA8CA0] to-[#b86981] text-[#1C1246] text-xs font-extrabold hover:shadow-[0_0_20px_rgba(218,140,160,0.4)] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Relaying Reply...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Reply</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
