"use client";

import { useState, useMemo } from "react";
import { Check, X, Loader2, Clock } from "lucide-react";
import { approveManualTimeRequest, rejectManualTimeRequest } from "@/app/actions/manual-time";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";

type PendingRequest = {
    id: string;
    employeeName: string;
    department: string;
    logType: string;
    logDateTime: Date;
    reason: string;
    submittedOn: string;
};

type ProcessedRequest = PendingRequest & {
    status: string;
    managerName: string;
};

export function ManualTimeClientPage({ 
    pendingRequests,
    processedRequests
}: { 
    pendingRequests: PendingRequest[],
    processedRequests: ProcessedRequest[]
}) {
    const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Pagination
    const [pendingPage, setPendingPage] = useState(1);
    const [historyPage, setHistoryPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const totalPendingPages = Math.ceil(pendingRequests.length / ITEMS_PER_PAGE);
    const paginatedPending = useMemo(() => 
        pendingRequests.slice((pendingPage - 1) * ITEMS_PER_PAGE, pendingPage * ITEMS_PER_PAGE),
    [pendingRequests, pendingPage]);

    const totalHistoryPages = Math.ceil(processedRequests.length / ITEMS_PER_PAGE);
    const paginatedHistory = useMemo(() => 
        processedRequests.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE),
    [processedRequests, historyPage]);

    const handleApprove = async (id: string) => {
        setIsProcessing(id);
        try {
            const res = await approveManualTimeRequest(id);
            if (res.success) {
                window.location.reload();
            } else {
                alert(res.error);
            }
        } finally {
            setIsProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this request?")) return;
        setIsProcessing(id);
        try {
            const res = await rejectManualTimeRequest(id);
            if (res.success) {
                window.location.reload();
            } else {
                alert(res.error);
            }
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab("PENDING")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === "PENDING" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        Pending Approvals
                        {pendingRequests.length > 0 && (
                            <span className="ml-1.5 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs font-bold">
                                {pendingRequests.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("HISTORY")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === "HISTORY" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    Request History
                </button>
            </div>

            {activeTab === "PENDING" && (
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Employee</th>
                                    <th className="px-6 py-4 font-semibold">Log Type</th>
                                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-right">Submitted</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedPending.map((req) => (
                                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{req.employeeName}</div>
                                            <div className="text-xs text-muted-foreground">{req.department}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                            {req.logType}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {format(new Date(req.logDateTime), "MMM d, yyyy - h:mm a")}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                                            {req.submittedOn}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={isProcessing === req.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    {isProcessing === req.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(req.id)}
                                                    disabled={isProcessing === req.id}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                                                >
                                                    <X className="size-3" />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {paginatedPending.length === 0 && (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-4">
                                    <Check className="size-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">All caught up!</h3>
                                <p className="text-muted-foreground">There are no pending manual time requests to review.</p>
                            </div>
                        )}
                    </div>
                    <Pagination 
                        currentPage={pendingPage}
                        totalPages={totalPendingPages}
                        onPageChange={setPendingPage}
                    />
                </div>
            )}

            {activeTab === "HISTORY" && (
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Employee</th>
                                    <th className="px-6 py-4 font-semibold">Log Type</th>
                                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold">Reason</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paginatedHistory.map((req) => (
                                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-foreground">{req.employeeName}</div>
                                            <div className="text-xs text-muted-foreground">{req.department}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                            {req.logType}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {format(new Date(req.logDateTime), "MMM d, yyyy - h:mm a")}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>
                                            {req.reason}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                                {req.status}
                                            </span>
                                            <div className="text-[10px] text-muted-foreground mt-1">
                                                {req.managerName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                                            {req.submittedOn}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {paginatedHistory.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground">
                                No processed manual time requests found.
                            </div>
                        )}
                    </div>
                    <Pagination 
                        currentPage={historyPage}
                        totalPages={totalHistoryPages}
                        onPageChange={setHistoryPage}
                    />
                </div>
            )}
        </div>
    );
}
