"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Clock,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GovernanceAuditLogItem,
  GovernancePagination,
  fetchGovernanceAuditLogs,
  isValidGovernanceUuid,
} from "@/lib/management-governance";

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<GovernanceAuditLogItem[]>([]);
  const [pagination, setPagination] = useState<GovernancePagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [actionFilter, setActionFilter] = useState("ALL");
  const [actorIdInput, setActorIdInput] = useState("");
  const [targetUserIdInput, setTargetUserIdInput] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 25;

  // Expanded metadata row IDs
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  const loadLogs = useCallback(
    async (currentOffset = offset) => {
      setIsLoading(true);
      setError(null);

      const trimmedActor = actorIdInput.trim();
      const trimmedTarget = targetUserIdInput.trim();

      const res = await fetchGovernanceAuditLogs({
        action: actionFilter !== "ALL" ? actionFilter : undefined,
        actorId: isValidGovernanceUuid(trimmedActor) ? trimmedActor : undefined,
        targetUserId: isValidGovernanceUuid(trimmedTarget) ? trimmedTarget : undefined,
        limit,
        offset: currentOffset,
      });

      setIsLoading(false);

      if (res.ok) {
        setLogs(res.data.items);
        setPagination(res.data.pagination);
      } else {
        setError(res.error.message || "Failed to load governance audit logs.");
      }
    },
    [actionFilter, actorIdInput, targetUserIdInput, offset]
  );

  useEffect(() => {
    setOffset(0);
    loadLogs(0);
  }, [actionFilter]);

  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ACCOUNT_APPROVED":
        return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
      case "ACCOUNT_REJECTED":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      case "ACCOUNT_SUSPENDED":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "ACCOUNT_REACTIVATED":
        return "bg-sky-500/10 text-sky-300 border-sky-500/20";
      case "ACCOUNT_DELETED":
        return "bg-rose-500/10 text-rose-300 border-rose-500/20";
      case "MANAGEMENT_SIGNUP":
        return "bg-indigo-500/10 text-indigo-300 border-indigo-500/20";
      case "MANAGEMENT_PASSWORD_RESET":
        return "bg-cyan-500/10 text-cyan-300 border-cyan-500/20";
      default:
        return "bg-white/10 text-white/70 border-white/15";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">Governance Audit Trail</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-[#8F8FA3]">
            Cryptographically sealed, immutable record of all administrative account signups,
            approvals, rejections, suspensions, soft-deletions, and self-service password resets.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => loadLogs(offset)}
          disabled={isLoading}
          className="border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/70 text-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Ledger</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
        {/* Action Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-white/40 text-[11px] mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Action:</span>
          </span>

          {[
            { id: "ALL", label: "All Actions" },
            { id: "ACCOUNT_APPROVED", label: "Approved" },
            { id: "ACCOUNT_REJECTED", label: "Rejected" },
            { id: "ACCOUNT_SUSPENDED", label: "Suspended" },
            { id: "ACCOUNT_REACTIVATED", label: "Reactivated" },
            { id: "ACCOUNT_DELETED", label: "Deleted" },
            { id: "MANAGEMENT_SIGNUP", label: "Signup" },
            { id: "MANAGEMENT_PASSWORD_RESET", label: "Password Reset" },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setActionFilter(act.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                actionFilter === act.id
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/40 hover:text-white bg-transparent"
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>

        {/* UUID Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div>
            <input
              type="text"
              placeholder="Filter by Actor UUID..."
              value={actorIdInput}
              onChange={(e) => setActorIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOffset(0);
                  loadLogs(0);
                }
              }}
              className="w-full bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#DA8CA0]"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Filter by Target User UUID..."
              value={targetUserIdInput}
              onChange={(e) => setTargetUserIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOffset(0);
                  loadLogs(0);
                }
              }}
              className="w-full bg-black/30 border border-white/5 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#DA8CA0]"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {isLoading && logs.length === 0 ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
            <p className="text-xs">Loading audit ledger...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-300 space-y-2">
            <AlertCircle className="h-6 w-6 mx-auto text-red-400" />
            <p className="text-xs">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-white/30 space-y-1">
            <p className="text-sm font-semibold text-white/50">No audit records found</p>
            <p className="text-xs text-white/30">Try clearing filters or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-white/40 uppercase tracking-widest text-[9px]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target User</th>
                  <th className="py-3 px-4">Origin IP</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {logs.map((log) => {
                  const isExpanded = expandedLogIds.has(log.id);
                  const hasMetadata =
                    log.metadata && Object.keys(log.metadata).length > 0;

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-white/[0.015] transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 text-white/60 whitespace-nowrap text-[11px]">
                          <div className="flex items-center gap-1.5 font-sans">
                            <Clock className="h-3 w-3 text-white/30 shrink-0" />
                            <span>{new Date(log.createdAt).toLocaleString()}</span>
                          </div>
                        </td>

                        {/* Action Pill */}
                        <td className="py-3 px-4 font-sans">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.action === "MANAGEMENT_PASSWORD_RESET"
                              ? "PASSWORD RESET"
                              : log.action.replace("ACCOUNT_", "").replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Actor */}
                        <td className="py-3 px-4 font-sans">
                          <div className="font-medium text-white truncate max-w-[160px]">
                            {log.actorName || log.actorRole}
                          </div>
                          {log.actorEmail && (
                            <div className="text-[10px] text-[#8F8FA3] font-mono truncate max-w-[160px]">
                              {log.actorEmail}
                            </div>
                          )}
                        </td>

                        {/* Target User */}
                        <td className="py-3 px-4 font-sans">
                          {log.targetName || log.targetEmail ? (
                            <>
                              <div className="font-medium text-white truncate max-w-[160px]">
                                {log.targetName || log.targetUserId}
                              </div>
                              {log.targetEmail && (
                                <div className="text-[10px] text-[#8F8FA3] font-mono truncate max-w-[160px]">
                                  {log.targetEmail}
                                </div>
                              )}
                            </>
                          ) : log.targetUserId ? (
                            <span className="text-[11px] text-white/50 font-mono">
                              {log.targetUserId.substring(0, 8)}...
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.ipAddress ? (
                            <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/5 text-[10px] text-white/70">
                              {log.ipAddress}
                            </span>
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>

                        {/* Expand Details */}
                        <td className="py-3 px-4 text-right font-sans">
                          {hasMetadata ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(log.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-white/40 hover:text-white px-2 py-1 rounded bg-white/[0.02] hover:bg-white/5 transition-colors"
                            >
                              <Terminal className="h-3 w-3" />
                              <span>{isExpanded ? "Hide" : "Inspect"}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          ) : (
                            <span className="text-white/20 text-[10px]">—</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable Metadata Pre Block */}
                      {isExpanded && hasMetadata && (
                        <tr className="bg-black/40">
                          <td colSpan={6} className="p-4 border-t border-b border-white/10">
                            <div className="space-y-1.5">
                              <div className="text-[10px] text-white/40 font-bold uppercase tracking-wider font-sans">
                                Audit Event Payload & Metadata
                              </div>
                              <pre className="overflow-x-auto text-[11px] font-mono text-white/80 p-3 bg-black/60 rounded-xl border border-white/5 max-h-48 leading-relaxed">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Strip */}
        {pagination && pagination.total > limit && (
          <div className="p-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50 bg-black/10">
            <div>
              Showing {pagination.offset + 1} to{" "}
              {Math.min(pagination.offset + limit, pagination.total)} of {pagination.total} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.offset === 0 || isLoading}
                onClick={() => {
                  const newOffset = Math.max(0, pagination.offset - limit);
                  setOffset(newOffset);
                  loadLogs(newOffset);
                }}
                className="h-7 px-2 border-white/10 text-white/70"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.hasMore || isLoading}
                onClick={() => {
                  const newOffset = pagination.offset + limit;
                  setOffset(newOffset);
                  loadLogs(newOffset);
                }}
                className="h-7 px-2 border-white/10 text-white/70"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
