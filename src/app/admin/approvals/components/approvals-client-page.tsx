"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Check, X, Loader2, CalendarHeart, Clock, ClipboardCheck } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { SubmitButton } from "@/components/ui/submit-button";

// Actions
import { updateLeaveRequestStatus } from "@/app/actions/admin";
import { updateOvertimeStatus } from "@/app/actions/overtime";
import { approveManualTimeRequest, rejectManualTimeRequest } from "@/app/actions/manual-time";

type LeaveData = any;
type OvertimeData = any;
type ManualData = any;

export function ApprovalsClientPage({ 
    leaves,
    overtime,
    manualTime
}: { 
    leaves: { pending: LeaveData[], processed: LeaveData[] },
    overtime: OvertimeData[],
    manualTime: { pending: ManualData[], processed: ManualData[] }
}) {
    const [activeTab, setActiveTab] = useState<"LEAVES" | "OVERTIME" | "MANUAL_TIME">("LEAVES");
    
    // Sub-tabs for each section
    const [leaveSubTab, setLeaveSubTab] = useState<"PENDING" | "HISTORY">("PENDING");
    const [manualSubTab, setManualSubTab] = useState<"PENDING" | "HISTORY">("PENDING");
    
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Pagination - Leaves
    const ITEMS_PER_PAGE = 20;
    const [leaveHistoryPage, setLeaveHistoryPage] = useState(1);
    const totalLeaveHistoryPages = Math.ceil(leaves.processed.length / ITEMS_PER_PAGE);
    const paginatedLeaveHistory = useMemo(() => 
        leaves.processed.slice((leaveHistoryPage - 1) * ITEMS_PER_PAGE, leaveHistoryPage * ITEMS_PER_PAGE),
    [leaves.processed, leaveHistoryPage]);

    // Pagination - Overtime
    const [overtimePage, setOvertimePage] = useState(1);
    const totalOvertimePages = Math.ceil(overtime.length / ITEMS_PER_PAGE);
    const paginatedOvertime = useMemo(() => 
        overtime.slice((overtimePage - 1) * ITEMS_PER_PAGE, overtimePage * ITEMS_PER_PAGE),
    [overtime, overtimePage]);

    // Pagination - Manual Time
    const [manualPendingPage, setManualPendingPage] = useState(1);
    const totalManualPendingPages = Math.ceil(manualTime.pending.length / ITEMS_PER_PAGE);
    const paginatedManualPending = useMemo(() => 
        manualTime.pending.slice((manualPendingPage - 1) * ITEMS_PER_PAGE, manualPendingPage * ITEMS_PER_PAGE),
    [manualTime.pending, manualPendingPage]);

    const [manualHistoryPage, setManualHistoryPage] = useState(1);
    const totalManualHistoryPages = Math.ceil(manualTime.processed.length / ITEMS_PER_PAGE);
    const paginatedManualHistory = useMemo(() => 
        manualTime.processed.slice((manualHistoryPage - 1) * ITEMS_PER_PAGE, manualHistoryPage * ITEMS_PER_PAGE),
    [manualTime.processed, manualHistoryPage]);


    // Action Handlers for Manual Time & Overtime (since they use manual loading states rather than form actions)
    const handleOvertimeAction = async (id: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !confirm("Are you sure you want to reject this request?")) return;
        setIsProcessing(id);
        try {
            const res = await updateOvertimeStatus(id, action === 'approve' ? "APPROVED" : "REJECTED");
            if (res.success) window.location.reload();
            else alert(res.error);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleManualTimeAction = async (id: string, action: 'approve' | 'reject') => {
        if (action === 'reject' && !confirm("Are you sure you want to reject this request?")) return;
        setIsProcessing(id);
        try {
            const res = action === 'approve' ? await approveManualTimeRequest(id) : await rejectManualTimeRequest(id);
            if (res.success) window.location.reload();
            else alert(res.error);
        } finally {
            setIsProcessing(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex border-b border-border mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("LEAVES")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === "LEAVES" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <CalendarHeart className="size-4" />
                        Leave Approvals
                        {leaves.pending.length > 0 && (
                            <span className="ml-1.5 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs font-bold">
                                {leaves.pending.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("OVERTIME")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === "OVERTIME" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        Overtime Approvals
                        {overtime.filter((o: any) => o.status === 'PENDING').length > 0 && (
                            <span className="ml-1.5 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs font-bold">
                                {overtime.filter((o: any) => o.status === 'PENDING').length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("MANUAL_TIME")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === "MANUAL_TIME" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <ClipboardCheck className="size-4" />
                        Manual Time Approvals
                        {manualTime.pending.length > 0 && (
                            <span className="ml-1.5 bg-primary/10 text-primary py-0.5 px-2 rounded-full text-xs font-bold">
                                {manualTime.pending.length}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* LEAVES TAB */}
            {activeTab === "LEAVES" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex gap-4 border-b">
                        <button onClick={() => setLeaveSubTab("PENDING")} className={`pb-2 text-sm font-medium border-b-2 ${leaveSubTab === "PENDING" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Pending ({leaves.pending.length})</button>
                        <button onClick={() => setLeaveSubTab("HISTORY")} className={`pb-2 text-sm font-medium border-b-2 ${leaveSubTab === "HISTORY" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>History</button>
                    </div>

                    {leaveSubTab === "PENDING" && (
                        <div>
                            {leaves.pending.length === 0 ? (
                                <div className="rounded-2xl border border-dashed bg-card/50 text-card-foreground p-12 text-center text-muted-foreground">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                                        <span className="text-primary text-xl">✨</span>
                                    </div>
                                    <p>All caught up! No pending leave requests to review.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {leaves.pending.map((request: any) => (
                                        <div key={request.id} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-bold text-lg">{request.user.name}</h3>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending</span>
                                                </div>
                                                <p className="text-muted-foreground text-sm font-medium">
                                                    <span className="capitalize text-foreground">{request.leaveType === 'LEAVE_CREDITS' ? 'PFFD Credits' : request.leaveType.toLowerCase() + ' PFFD'}</span> • {format(request.startDate, "MMM d")} to {format(request.endDate, "MMM d, yyyy")}
                                                </p>
                                                {request.reason && (
                                                    <p className="text-sm mt-3 pt-3 border-t italic text-muted-foreground max-w-2xl">"{request.reason}"</p>
                                                )}
                                            </div>

                                            <div className="flex sm:flex-col gap-2 shrink-0">
                                                <form action={updateLeaveRequestStatus.bind(null, request.id, "APPROVED")}>
                                                    <SubmitButton variant="success" className="w-full sm:w-32">Approve</SubmitButton>
                                                </form>
                                                <form action={updateLeaveRequestStatus.bind(null, request.id, "REJECTED")}>
                                                    <SubmitButton variant="outline" className="w-full sm:w-32 text-destructive border-destructive hover:bg-destructive hover:text-white">Reject</SubmitButton>
                                                </form>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {leaveSubTab === "HISTORY" && (
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Employee</th>
                                            <th className="px-6 py-4 font-semibold">Type</th>
                                            <th className="px-6 py-4 font-semibold">Duration</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {paginatedLeaveHistory.length === 0 ? (
                                            <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No processed requests found.</td></tr>
                                        ) : (
                                            paginatedLeaveHistory.map((request: any) => (
                                                <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold">{request.user.name}</td>
                                                    <td className="px-6 py-4 capitalize">{request.leaveType === 'LEAVE_CREDITS' ? 'PFFD Credits' : request.leaveType.toLowerCase()}</td>
                                                    <td className="px-6 py-4 text-muted-foreground">{format(request.startDate, "MMM d")} - {format(request.endDate, "MMM d, yyyy")}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${request.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-destructive/10 text-destructive'}`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination currentPage={leaveHistoryPage} totalPages={totalLeaveHistoryPages} onPageChange={setLeaveHistoryPage} />
                        </div>
                    )}
                </div>
            )}

            {/* OVERTIME TAB */}
            {activeTab === "OVERTIME" && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Employee</th>
                                        <th className="px-6 py-4 font-semibold">Date & Time (PHT)</th>
                                        <th className="px-6 py-4 font-semibold">Details</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {paginatedOvertime.map((req: any) => (
                                        <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-foreground">{req.employeeName}</div>
                                                <div className="text-xs text-muted-foreground">{req.employeeEmail}</div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                <div className="font-medium text-foreground">{req.dateRange}</div>
                                                <div>{req.timeRange}</div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>
                                                <div className="truncate mb-1">{req.reason}</div>
                                                {req.attachmentUrl && (
                                                    <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                                                        View Proof
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                    {req.status}
                                                </span>
                                                <div className="text-[10px] text-muted-foreground mt-1">{req.managerName}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {req.status === 'PENDING' ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleOvertimeAction(req.id, 'approve')} disabled={isProcessing === req.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                                                            {isProcessing === req.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Approve
                                                        </button>
                                                        <button onClick={() => handleOvertimeAction(req.id, 'reject')} disabled={isProcessing === req.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                                                            <X className="size-3" /> Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Processed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {paginatedOvertime.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">No overtime requests to review.</div>
                            )}
                        </div>
                        <Pagination currentPage={overtimePage} totalPages={totalOvertimePages} onPageChange={setOvertimePage} />
                    </div>
                </div>
            )}

            {/* MANUAL TIME TAB */}
            {activeTab === "MANUAL_TIME" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex gap-4 border-b">
                        <button onClick={() => setManualSubTab("PENDING")} className={`pb-2 text-sm font-medium border-b-2 ${manualSubTab === "PENDING" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Pending ({manualTime.pending.length})</button>
                        <button onClick={() => setManualSubTab("HISTORY")} className={`pb-2 text-sm font-medium border-b-2 ${manualSubTab === "HISTORY" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>History</button>
                    </div>

                    {manualSubTab === "PENDING" && (
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
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
                                        {paginatedManualPending.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-foreground">{req.employeeName}</div>
                                                    <div className="text-xs text-muted-foreground">{req.department}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{req.logType}</td>
                                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{format(new Date(req.logDateTime), "MMM d, yyyy - h:mm a")}</td>
                                                <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                                                <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">{req.submittedOn}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => handleManualTimeAction(req.id, 'approve')} disabled={isProcessing === req.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                                                            {isProcessing === req.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Approve
                                                        </button>
                                                        <button onClick={() => handleManualTimeAction(req.id, 'reject')} disabled={isProcessing === req.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
                                                            <X className="size-3" /> Reject
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {paginatedManualPending.length === 0 && (
                                    <div className="p-12 text-center">
                                        <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-4"><Check className="size-6 text-muted-foreground" /></div>
                                        <h3 className="text-lg font-semibold text-foreground mb-1">All caught up!</h3>
                                        <p className="text-muted-foreground">There are no pending manual time requests to review.</p>
                                    </div>
                                )}
                            </div>
                            <Pagination currentPage={manualPendingPage} totalPages={totalManualPendingPages} onPageChange={setManualPendingPage} />
                        </div>
                    )}

                    {manualSubTab === "HISTORY" && (
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
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
                                        {paginatedManualHistory.map((req: any) => (
                                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-foreground">{req.employeeName}</div>
                                                    <div className="text-xs text-muted-foreground">{req.department}</div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">{req.logType}</td>
                                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{format(new Date(req.logDateTime), "MMM d, yyyy - h:mm a")}</td>
                                                <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{req.status}</span>
                                                    <div className="text-[10px] text-muted-foreground mt-1">{req.managerName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">{req.submittedOn}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {paginatedManualHistory.length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground">No processed manual time requests found.</div>
                                )}
                            </div>
                            <Pagination currentPage={manualHistoryPage} totalPages={totalManualHistoryPages} onPageChange={setManualHistoryPage} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
