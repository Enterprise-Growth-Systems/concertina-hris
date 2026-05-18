"use client";

import { useState } from "react";
import { Plus, Clock, ExternalLink, Loader2 } from "lucide-react";
import { submitOvertime } from "@/app/actions/overtime";

type RequestData = {
    id: string;
    dateRange: string;
    timeRange: string;
    reason: string;
    status: string;
    managerName: string;
    attachmentUrl: string | null;
    submittedOn: string;
};

export function OvertimeClientPage({ initialRequests }: { initialRequests: RequestData[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form state
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [reason, setReason] = useState("");
    const [attachmentUrl, setAttachmentUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
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
                setIsModalOpen(false);
                setStartDate(""); setEndDate(""); setStartTime(""); setEndTime(""); setReason(""); setAttachmentUrl("");
            } else {
                alert(res.error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-foreground">Your History</h2>
                <button 
                    onClick={() => setIsModalOpen(true)}
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
                            {initialRequests.map((req) => (
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
                    
                    {initialRequests.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            You have no overtime requests history.
                        </div>
                    )}
                </div>
            </div>

            {/* File Overtime Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isSubmitting && setIsModalOpen(false)} />
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

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-sm transition-colors disabled:opacity-50">
                                    {isSubmitting ? <><Loader2 className="size-4 animate-spin"/> Submitting...</> : "Submit Request"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
