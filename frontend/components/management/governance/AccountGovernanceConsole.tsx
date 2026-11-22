"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Trash2,
  ShieldAlert,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ManagedUserRecord,
  ManagedUsersCounts,
  GovernancePagination,
  ManagementRole,
  canApproveOrRejectTarget,
  canSuspendReactivateOrDeleteTarget,
  validateGovernanceReason,
  fetchManagedUsers,
  approveManagedUser,
  rejectManagedUser,
  suspendManagedUser,
  reactivateManagedUser,
  deleteManagedUser,
} from "@/lib/management-governance";

interface AccountGovernanceConsoleProps {
  actorRole: "admin" | "super_admin";
  actorId: string;
}

type ModalAction = "reject" | "suspend" | "delete" | null;

export function AccountGovernanceConsole({
  actorRole,
  actorId,
}: AccountGovernanceConsoleProps) {
  // State
  const [users, setUsers] = useState<ManagedUserRecord[]>([]);
  const [counts, setCounts] = useState<ManagedUsersCounts | null>(null);
  const [pagination, setPagination] = useState<GovernancePagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  // Concurrency Lock
  const [inFlightUserId, setInFlightUserId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Confirmation Modal State
  const [activeModal, setActiveModal] = useState<{
    action: ModalAction;
    targetUser: ManagedUserRecord | null;
  }>({ action: null, targetUser: null });
  const [reasonInput, setReasonInput] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const loadUsers = useCallback(
    async (currentOffset = offset, searchQuery = search) => {
      setIsLoading(true);
      setError(null);

      const res = await fetchManagedUsers({
        role: actorRole === "super_admin" && roleFilter !== "ALL" ? roleFilter : undefined,
        approvalStatus: statusFilter !== "ALL" ? statusFilter : undefined,
        includeDeleted: actorRole === "super_admin" ? includeDeleted : false,
        search: searchQuery.trim() || undefined,
        limit,
        offset: currentOffset,
      });

      setIsLoading(false);

      if (res.ok) {
        setUsers(res.data.items);
        setCounts(res.data.counts);
        setPagination(res.data.pagination);
      } else {
        setError(res.error.message || "Failed to load management directory.");
      }
    },
    [actorRole, roleFilter, statusFilter, includeDeleted, search, offset]
  );

  // Initial & Filter Change Fetch
  useEffect(() => {
    setOffset(0);
    loadUsers(0, search);
  }, [roleFilter, statusFilter, includeDeleted]);

  // Debounced Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setOffset(0);
      loadUsers(0, val);
    }, 350);
  };

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Actions
  const handleApprove = async (user: ManagedUserRecord) => {
    if (inFlightUserId) return;
    setInFlightUserId(user.id);

    try {
      const res = await approveManagedUser(user.id);
      if (res.ok) {
        showToast("success", `Approved ${user.fullName} (${user.role}).`);
        loadUsers(offset, search);
      } else {
        showToast("error", res.error.message || "Approval failed.");
      }
    } finally {
      setInFlightUserId(null);
    }
  };

  const handleOpenModal = (action: ModalAction, user: ManagedUserRecord) => {
    setReasonInput("");
    setReasonError(null);
    setActiveModal({ action, targetUser: user });
  };

  const handleCloseModal = () => {
    setActiveModal({ action: null, targetUser: null });
    setReasonInput("");
    setReasonError(null);
  };

  const handleConfirmModalAction = async () => {
    const { action, targetUser } = activeModal;
    if (!action || !targetUser || inFlightUserId) return;

    if (action === "reject" || action === "suspend") {
      const val = validateGovernanceReason(reasonInput);
      if (!val.isValid) {
        setReasonError(val.error || "Invalid reason");
        return;
      }
    }

    setInFlightUserId(targetUser.id);

    try {
      let res;
      if (action === "reject") {
        res = await rejectManagedUser(targetUser.id, reasonInput.trim() || undefined);
      } else if (action === "suspend") {
        res = await suspendManagedUser(targetUser.id, reasonInput.trim() || undefined);
      } else if (action === "delete") {
        res = await deleteManagedUser(targetUser.id);
      }

      if (res && res.ok) {
        const actionLabels = {
          reject: "Rejected registration for",
          suspend: "Suspended and revoked sessions for",
          delete: "Permanently soft-deleted",
        };
        showToast("success", `${actionLabels[action]} ${targetUser.fullName}.`);
        handleCloseModal();
        loadUsers(offset, search);
      } else {
        const errMsg = res?.error?.message || "Operation failed.";
        setReasonError(errMsg);
      }
    } finally {
      setInFlightUserId(null);
    }
  };

  const handleReactivate = async (user: ManagedUserRecord) => {
    if (inFlightUserId) return;
    setInFlightUserId(user.id);

    try {
      const res = await reactivateManagedUser(user.id);
      if (res.ok) {
        showToast("success", `Reactivated ${user.fullName}.`);
        loadUsers(offset, search);
      } else {
        showToast("error", res.error.message || "Reactivation failed.");
      }
    } finally {
      setInFlightUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
            toastMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
              : "bg-red-500/10 border-red-500/20 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/40 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* KPI SUMMARY STRIP                                                */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actorRole === "super_admin" && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold">
              Pending Admin
            </div>
            <div className="text-2xl font-bold text-white">
              {counts?.pendingAdmin ?? 0}
            </div>
            <div className="text-[10px] text-white/30">Tier 2 Applicants</div>
          </div>
        )}

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold">
            Pending Staff
          </div>
          <div className="text-2xl font-bold text-white">
            {counts?.pendingStaff ?? 0}
          </div>
          <div className="text-[10px] text-white/30">Frontline Applicants</div>
        </div>

        {actorRole === "super_admin" && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
              Active Admin
            </div>
            <div className="text-2xl font-bold text-white">
              {counts?.activeAdmin ?? 0}
            </div>
            <div className="text-[10px] text-white/30">Operational Leads</div>
          </div>
        )}

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
            Active Staff
          </div>
          <div className="text-2xl font-bold text-white">
            {counts?.activeStaff ?? 0}
          </div>
          <div className="text-[10px] text-white/30">Operational Staff</div>
        </div>

        {actorRole === "super_admin" && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">
              Suspended
            </div>
            <div className="text-2xl font-bold text-white">
              {counts?.suspendedCount ?? 0}
            </div>
            <div className="text-[10px] text-white/30">Revoked Accounts</div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* FILTER & SEARCH TOOLBAR                                          */}
      {/* ================================================================= */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full bg-black/30 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#DA8CA0]"
            />
          </div>

          {/* Refresh Button */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => loadUsers(offset, search)}
              disabled={isLoading}
              className="border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/70 text-xs py-2"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5 text-xs">
          <div className="flex items-center gap-1 text-white/40 text-[11px] mr-1">
            <Filter className="h-3 w-3" />
            <span>Status:</span>
          </div>

          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                statusFilter === st
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/40 hover:text-white bg-transparent"
              }`}
            >
              {st}
            </button>
          ))}

          {/* Super Admin Exclusive: Role Filter & Deleted Toggle */}
          {actorRole === "super_admin" && (
            <>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <div className="flex items-center gap-1 text-white/40 text-[11px] mr-1">
                <span>Role:</span>
              </div>
              {["ALL", "STAFF", "ADMIN", "SUPER_ADMIN"].map((rf) => (
                <button
                  key={rf}
                  type="button"
                  onClick={() => setRoleFilter(rf)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all ${
                    roleFilter === rf
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-white/40 hover:text-white bg-transparent"
                  }`}
                >
                  {rf === "SUPER_ADMIN" ? "Super Admin" : rf}
                </button>
              ))}

              <div className="h-4 w-px bg-white/10 mx-1" />
              <label className="flex items-center gap-1.5 cursor-pointer text-white/60 hover:text-white select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => setIncludeDeleted(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-rose-500 focus:ring-0"
                />
                <span>Include Deleted</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* DIRECTORY TABLE                                                  */}
      {/* ================================================================= */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        {isLoading && users.length === 0 ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-white/40" />
            <p className="text-xs">Loading management accounts...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-300 space-y-2">
            <AlertTriangle className="h-6 w-6 mx-auto text-red-400" />
            <p className="text-xs">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-white/30 space-y-1">
            <p className="text-sm font-semibold text-white/50">No accounts match query</p>
            <p className="text-xs text-white/30">Try clearing filters or search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/20 text-white/40 uppercase tracking-widest text-[9px]">
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => {
                  const isSelf = u.id === actorId;
                  const isSuperAdminRow = u.role === "super_admin";
                  const isPending = u.approvalStatus === "PENDING";
                  const isApproved = u.approvalStatus === "APPROVED";
                  const isDeleted = Boolean(u.deletedAt);
                  const isBusy = inFlightUserId === u.id;

                  // Capability checks
                  const canApproveReject =
                    isPending && !isDeleted && canApproveOrRejectTarget(actorRole, u.role);
                  const canSuspend =
                    isApproved &&
                    u.isActive &&
                    !isDeleted &&
                    canSuspendReactivateOrDeleteTarget(actorRole, actorId, u.role, u.id);
                  const canReactivate =
                    isApproved &&
                    !u.isActive &&
                    !isDeleted &&
                    canSuspendReactivateOrDeleteTarget(actorRole, actorId, u.role, u.id);
                  const canDelete =
                    !isDeleted &&
                    canSuspendReactivateOrDeleteTarget(actorRole, actorId, u.role, u.id, "delete");

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-white/[0.015] transition-colors ${
                        isDeleted ? "opacity-50 bg-red-950/5" : ""
                      }`}
                    >
                      {/* Operator Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{u.fullName}</span>
                          {isSelf && (
                            <span className="text-[9px] bg-white/10 text-white/70 px-1.5 py-0.2 rounded font-normal">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8F8FA3] font-mono">{u.email}</div>
                        {isDeleted && (
                          <div className="text-[9px] text-rose-400 pt-0.5">
                            Deleted {new Date(u.deletedAt!).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Role Pill */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === "super_admin"
                              ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                              : u.role === "admin"
                              ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          }`}
                        >
                          {u.role === "super_admin" ? "Super Admin" : u.role}
                        </span>
                      </td>

                      {/* Approval Status Pill */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.approvalStatus === "APPROVED"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : u.approvalStatus === "PENDING"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : "bg-red-500/10 text-red-300 border border-red-500/20"
                          }`}
                        >
                          {u.approvalStatus}
                        </span>
                      </td>

                      {/* Active State */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-medium ${
                            u.isActive ? "text-emerald-400" : "text-white/30"
                          }`}
                        >
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action Controls */}
                      <td className="py-3.5 px-4 text-right">
                        {isSuperAdminRow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/30 font-medium px-2 py-1 rounded bg-white/[0.02]">
                            <ShieldAlert className="h-3 w-3 text-white/20" />
                            <span>Protected Executive</span>
                          </span>
                        ) : isBusy ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Processing...</span>
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            {/* Approve */}
                            {canApproveReject && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(u)}
                                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] rounded-lg"
                              >
                                <Check className="h-3 w-3 mr-1" />
                                <span>Approve</span>
                              </Button>
                            )}

                            {/* Reject */}
                            {canApproveReject && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenModal("reject", u)}
                                className="h-7 px-2.5 border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-[11px] rounded-lg"
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                <span>Reject</span>
                              </Button>
                            )}

                            {/* Suspend */}
                            {canSuspend && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenModal("suspend", u)}
                                className="h-7 px-2.5 border-amber-500/20 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] rounded-lg"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                <span>Suspend</span>
                              </Button>
                            )}

                            {/* Reactivate */}
                            {canReactivate && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReactivate(u)}
                                className="h-7 px-2.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-[11px] rounded-lg"
                              >
                                <RotateCcw className="h-3 w-3 mr-1" />
                                <span>Reactivate</span>
                              </Button>
                            )}

                            {/* Soft-Delete */}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenModal("delete", u)}
                                className="h-7 px-2.5 border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-[11px] rounded-lg"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
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
              {Math.min(pagination.offset + limit, pagination.total)} of {pagination.total} accounts
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.offset === 0 || isLoading}
                onClick={() => {
                  const newOffset = Math.max(0, pagination.offset - limit);
                  setOffset(newOffset);
                  loadUsers(newOffset, search);
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
                  loadUsers(newOffset, search);
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

      {/* ================================================================= */}
      {/* CONFIRMATION / REASON MODAL                                      */}
      {/* ================================================================= */}
      {activeModal.action && activeModal.targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0D0821] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white capitalize">
                  {activeModal.action === "reject"
                    ? "Reject Account Application"
                    : activeModal.action === "suspend"
                    ? "Suspend Account & Revoke Sessions"
                    : "Permanently Soft-Delete Account"}
                </h3>
                <p className="text-xs text-[#8F8FA3]">
                  Target:{" "}
                  <span className="text-white font-medium">
                    {activeModal.targetUser.fullName}
                  </span>{" "}
                  ({activeModal.targetUser.email})
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-white/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeModal.action === "delete" ? (
              <p className="text-xs text-rose-300/90 leading-relaxed bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
                Warning: This action will permanently mark the account as deleted and immediately
                revoke all active sessions and tokens. This governance action is permanently
                logged in the immutable audit ledger.
              </p>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  Reason for {activeModal.action} (Optional, max 500 chars)
                </label>
                <textarea
                  rows={3}
                  value={reasonInput}
                  onChange={(e) => {
                    setReasonInput(e.target.value);
                    if (reasonError) setReasonError(null);
                  }}
                  placeholder="Enter reason to be recorded in the audit trail..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-white/20 outline-none focus:border-[#DA8CA0]"
                />
                {reasonError && (
                  <p className="text-[11px] text-red-400">{reasonError}</p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCloseModal}
                className="border-white/10 text-white/70"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmModalAction}
                disabled={Boolean(inFlightUserId)}
                className={`text-xs ${
                  activeModal.action === "delete"
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : activeModal.action === "suspend"
                    ? "bg-amber-600 hover:bg-amber-500 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {inFlightUserId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>
                    Confirm{" "}
                    {activeModal.action === "delete"
                      ? "Deletion"
                      : activeModal.action === "suspend"
                      ? "Suspension"
                      : "Rejection"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
