"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  InquiryDetail,
  InquiryDetailHeader,
  InquiryMessageItem,
  InquiryPagination,
  InquiryStats,
  InquirySummary,
  ManagementInquiryRole,
  fetchInquiryDetail,
  fetchInquiriesList,
  fetchInquiryStats,
} from "@/lib/management-inquiries";
import { StatsOverviewBar } from "./StatsOverviewBar";
import { InquiryInboxList } from "./InquiryInboxList";
import { InquiryThreadViewer } from "./InquiryThreadViewer";
import { ReplyAndStatusControls } from "./ReplyAndStatusControls";
import { cn } from "@/lib/utils";

interface InquiriesConsoleProps {
  userRole: ManagementInquiryRole;
}

export function InquiriesConsole({ userRole }: InquiriesConsoleProps) {
  // Statistics State
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Inbox Listing State
  const [inquiries, setInquiries] = useState<InquirySummary[]>([]);
  const [pagination, setPagination] = useState<InquiryPagination | null>(null);
  const [isInboxLoading, setIsInboxLoading] = useState(true);
  const [inboxError, setInboxError] = useState<string | null>(null);

  // Filters State
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0);

  // Detail / Thread State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inquiryDetail, setInquiryDetail] = useState<InquiryDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Mobile View Toggle ("inbox" vs "detail")
  const [mobileView, setMobileView] = useState<"inbox" | "detail">("inbox");

  // Load KPI Statistics
  const loadStats = useCallback(async () => {
    setIsStatsLoading(true);
    setStatsError(null);
    const res = await fetchInquiryStats();
    setIsStatsLoading(false);
    if (res.ok) {
      setStats(res.data);
    } else {
      setStatsError(res.error.message);
    }
  }, []);

  // Load Inbox Inquiries
  const loadInbox = useCallback(async (currentOffset = offset) => {
    setIsInboxLoading(true);
    setInboxError(null);
    const res = await fetchInquiriesList({
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      search: searchQuery.trim() !== "" ? searchQuery.trim() : undefined,
      limit: 20,
      offset: currentOffset,
    });
    setIsInboxLoading(false);

    if (res.ok) {
      setInquiries(res.data.items);
      setPagination(res.data.pagination);
    } else {
      setInboxError(res.error.message);
    }
  }, [statusFilter, searchQuery, offset]);

  // Load Single Inquiry Thread Detail
  const loadDetail = useCallback(async (id: string) => {
    setIsDetailLoading(true);
    setDetailError(null);
    const res = await fetchInquiryDetail(id);
    setIsDetailLoading(false);

    if (res.ok) {
      setInquiryDetail(res.data);
    } else {
      setDetailError(res.error.message);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadInbox(offset);
  }, [loadInbox, offset]);

  // When selected inquiry changes
  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
      setMobileView("detail");
    } else {
      setInquiryDetail(null);
    }
  }, [selectedId, loadDetail]);

  // Filter change handlers
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setOffset(0);
  };

  const handleSearchChange = (search: string) => {
    setSearchQuery(search);
    setOffset(0);
  };

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  // Callback when a staff reply is successfully created
  const handleReplySuccess = (reply: InquiryMessageItem) => {
    if (inquiryDetail) {
      // Append message to active thread
      const updatedMessages = [...inquiryDetail.messages, reply];
      const updatedInquiry = {
        ...inquiryDetail.inquiry,
        status: "REPLIED" as const,
      };
      setInquiryDetail({
        ...inquiryDetail,
        inquiry: updatedInquiry,
        messages: updatedMessages,
      });

      // Update matching card in inbox list
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === inquiryDetail.inquiry.id
            ? {
                ...item,
                status: "REPLIED",
                messageCount: item.messageCount + 1,
                staffReplyCount: item.staffReplyCount + 1,
                lastRepliedBy: reply.senderName,
                lastMessageAt: reply.createdAt,
              }
            : item
        )
      );

      // Refresh KPI statistics in background
      loadStats();
    }
  };

  // Callback when ticket status is mutated
  const handleStatusChangeSuccess = (updatedInquiry: InquiryDetailHeader) => {
    if (inquiryDetail) {
      setInquiryDetail({
        ...inquiryDetail,
        inquiry: updatedInquiry,
      });

      // Update matching card in inbox list
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === updatedInquiry.id
            ? {
                ...item,
                status: updatedInquiry.status,
                updatedAt: updatedInquiry.updatedAt,
              }
            : item
        )
      );

      // Refresh KPI statistics in background
      loadStats();
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Executive Telemetry Overview Bar */}
      <StatsOverviewBar
        stats={stats}
        isLoading={isStatsLoading}
        error={statsError}
        onRefresh={() => {
          loadStats();
          loadInbox();
          if (selectedId) loadDetail(selectedId);
        }}
      />

      {/* 2. Main Two-Pane Console Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[720px] max-h-[80vh] min-h-[580px]">
        {/* Left Pane: Inbox List */}
        <div
          className={cn(
            "md:col-span-5 lg:col-span-4 h-full",
            mobileView === "detail" ? "hidden md:block" : "block"
          )}
        >
          <InquiryInboxList
            inquiries={inquiries}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
            isLoading={isInboxLoading}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            pagination={pagination}
            onPageChange={handlePageChange}
            onRefresh={() => loadInbox()}
          />
        </div>

        {/* Right Pane: Thread Viewer & Role-Aware Action Controls */}
        <div
          className={cn(
            "md:col-span-7 lg:col-span-8 h-full",
            mobileView === "inbox" ? "hidden md:block" : "block"
          )}
        >
          <InquiryThreadViewer
            inquiryDetail={inquiryDetail}
            isLoading={isDetailLoading}
            error={detailError}
            onBackToInbox={() => setMobileView("inbox")}
          >
            {inquiryDetail && (
              <ReplyAndStatusControls
                inquiry={inquiryDetail.inquiry}
                userRole={userRole}
                onReplySuccess={handleReplySuccess}
                onStatusChangeSuccess={handleStatusChangeSuccess}
              />
            )}
          </InquiryThreadViewer>
        </div>
      </div>
    </div>
  );
}
