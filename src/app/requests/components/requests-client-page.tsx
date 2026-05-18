"use client";

import { useState } from "react";
import { Plus, Clock, ExternalLink, Loader2, CalendarHeart } from "lucide-react";
import { submitOvertime } from "@/app/actions/overtime";
import { submitLeaveRequest } from "@/app/actions/leaves";
import { SubmitButton } from "@/components/ui/submit-button";
import { format } from "date-fns";

type OvertimeRequestData = {
    id: string;
    dateRange: string;
    timeRange: string;
    reason: string;
    status: string;
    managerName: string;
    attachmentUrl: string | null;
    submittedOn: string;
};

type LeaveRequestData = {
    id: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    status: string;
    createdAt: Date;
};

type LeaveBalanceData = {
    id: string;
    leaveType: string;
    balance: number;
};

export function RequestsClientPage({ 
    overtimeRequests, 
    leaveRequests, 
    balances 
}: { 
    overtimeRequests: OvertimeRequestData[], 
    leaveRequests: LeaveRequestData[], 
    balances: LeaveBalanceData[] 
}) {
    const [activeTab, setActiveTab] = useState<"PFFD" | "OVERTIME">("PFFD");
    
    // Overtime Form State
    const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [reason, setReason] = useState("");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [isSubmittingOvertime, setIsSubmittingOvertime] = useState(false);

    const handleOvertimeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingOvertime(true);
        try {
            const formData = new FormData();
            formData.append("startDate", startDate);
            formData.append("endDate", endDate);
            formData.append("startTime", startTime);
            formData.append("endTime", endTime);
            formData.append("reason", reason);
            formData.append("attachmentUrl", attachmentUrl);
            
            const res = await submitOvertime(formData);
            if (res.success) {
                setIsOvertimeModalOpen(false);
                setStartDate(""); setEndDate(""); setStartTime(""); setEndTime(""); setReason(""); setAttachmentUrl("");
                window.location.reload(); // Quick refresh to show new data
            } else {
                alert(res.error);
            }
        } finally {
            setIsSubmittingOvertime(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex border-b border-border mb-6">
                <button
                    onClick={() => setActiveTab("PFFD")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === "PFFD" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <CalendarHeart className="size-4" />
                        PFFD Requests
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("OVERTIME")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                        activeTab === "OVERTIME" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        Overtime
                    </div>
                </button>
            </div>

            {/* PFFD Tab Content */}
            {activeTab === "PFFD" && (
                <div className="grid lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="lg:col-span-1 space-y-6">
                        {/* Balances */}
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 bg-gradient-to-br from-primary/5 to-transparent">
                            <h2 className="font-semibold text-lg mb-4 text-primary">Your Balances</h2>
                            <div className="space-y-4">
                                {balances.map((balance: any) => (
                                    <div key={balance.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 backdrop-blur border">
                                        <div>
                                            <p className="font-medium text-sm capitalize">{balance.leaveType === 'PFFD' ? 'PFFD Credits' : balance.leaveType.toLowerCase()}</p>
                                            <p className="text-xs text-muted-foreground">Available</p>
                                        </div>
                                        <div className="text-xl font-bold text-primary">{balance.balance}</div>
                                    </div>
                                ))}
                                {balances.length === 0 && (
                                    <div className="text-sm text-muted-foreground">No balances found.</div>
                                )}
                            </div>
                        </div>

                        {/* Request Form */}
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
                            <h2 className="font-semibold text-lg mb-4">New Request</h2>
                            <form action={async (formData) => {
                                await submitLeaveRequest(formData);
                            }} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block" htmlFor="leaveType">Time-Off Type</label>
                                    <input type="hidden" name="leaveType" value="LEAVE_CREDITS" id="leaveType" />
                                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground items-center">
                                        PFFD Credits
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block text-foreground" htmlFor="startDate">Start Date</label>
                                        <input type="date" name="startDate" id="startDate" required className="block h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" style={{ colorScheme: 'light' }} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block text-foreground" htmlFor="endDate">End Date</label>
                                        <input type="date" name="endDate" id="endDate" required className="block h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" style={{ colorScheme: 'light' }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block text-foreground" htmlFor="reason">Reason (Optional)</label>
                                    <textarea name="reason" id="reason" rows={3} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"></textarea>
                                </div>
                                
                                <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
                                    <label className="text-sm font-bold mb-1.5 block text-foreground" htmlFor="attachmentUrl">
                                        Attachment Link <span className="text-muted-foreground font-normal">(Required)</span>
                                    </label>
                                    <input 
                                        type="url" 
                                        name="attachmentUrl" 
                                        id="attachmentUrl" 
                                        required 
                                        placeholder="e.g. Google Drive Link to proof" 
                                        className="block h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" 
                                    />
                                </div>

                                <SubmitButton className="w-full mt-2">
                                    Submit Request
                                </SubmitButton>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden h-full">
                            <div className="p-6 border-b">
                                <h2 className="font-semibold text-lg">Request History</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Type</th>
                                            <th className="px-6 py-4 font-semibold">Duration</th>
                                            <th className="px-6 py-4 font-semibold">Status</th>
                                            <th className="px-6 py-4 font-semibold">Date Filed</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {leaveRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                    No PFFD requests found.
                                                </td>
                                            </tr>
                                        ) : (
                                            leaveRequests.map((request: any) => (
                                                <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium capitalize">
                                                        {request.leaveType === 'LEAVE_CREDITS' ? 'PFFD Credits' : request.leaveType.toLowerCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                        {format(request.startDate, "MMM d")} - {format(request.endDate, "MMM d, yyyy")}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${request.status === 'APPROVED'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : request.status === 'REJECTED'
                                                                ? 'bg-destructive/10 text-destructive'
                                                                : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                            {request.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-muted-foreground">
                                                        {format(request.createdAt, "MMM d, yyyy")}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OVERTIME Tab Content */}
            {activeTab === "OVERTIME" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-foreground">Your History</h2>
                        <button 
                            onClick={() => setIsOvertimeModalOpen(true)}
                            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                        >
                            <Plus className="size-4" />
                            File Overtime
                        </button>
                    </div>

                    <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Date Range</th>
                                        <th className="px-6 py-4 font-semibold">Time Range</th>
                                        <th className="px-6 py-4 font-semibold">Reason</th>
                                        <th className="px-6 py-4 font-semibold text-center">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Submitted</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {overtimeRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                                {req.dateRange}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                                {req.timeRange} (PHT)
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                                                <div className="flex flex-col gap-1">
                                                    <span className="truncate">{req.reason}</span>
                                                    {req.attachmentUrl && (
                                                        <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                                                            <ExternalLink className="size-3" /> View Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                    req.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                    req.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
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
                            
                            {overtimeRequests.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    You have no overtime requests history.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Overtime Modal */}
                    {isOvertimeModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isSubmittingOvertime && setIsOvertimeModalOpen(false)} />
                            <div className="relative bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                        <Clock className="size-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-foreground">File Overtime</h2>
                                        <p className="text-sm text-muted-foreground">Submit a new overtime request.</p>
                                    </div>
                                </div>

                                <form onSubmit={handleOvertimeSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
                                            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
                                            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">Start Time (PHT)</label>
                                            <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1.5">End Time (PHT)</label>
                                            <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Reason for Overtime</label>
                                        <textarea required value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Provide details on why overtime is required..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Attachment Link <span className="text-muted-foreground font-normal">(Required)</span></label>
                                        <input type="url" required value={attachmentUrl} onChange={e => setAttachmentUrl(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" placeholder="e.g. Google Drive Link to proof" />
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                                        <button type="button" onClick={() => setIsOvertimeModalOpen(false)} disabled={isSubmittingOvertime} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={isSubmittingOvertime} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                            {isSubmittingOvertime ? <><Loader2 className="size-4 animate-spin"/> Submitting...</> : "Submit Request"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
