"use client";

import { useState, useMemo } from "react";
import { ExternalLink, Check, X, Loader2 } from "lucide-react";
import { updateOvertimeStatus } from "@/app/actions/overtime";
import { Pagination } from "@/components/ui/pagination";

type RequestData = {
    id: string;
    employeeName: string;
    employeeEmail: string;
    dateRange: string;
    timeRange: string;
    reason: string;
    status: string;
    managerName: string;
    attachmentUrl: string | null;
    submittedOn: string;
};

export function OvertimeApprovalsClient({ requests }: { requests: RequestData[] }) {
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE);
    const paginatedRequests = useMemo(() => 
        requests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [requests, currentPage]);

    const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
        setProcessingId(id);
        try {
            const res = await updateOvertimeStatus(id, status);
            if (!res.success) {
                alert(res.error);
            }
        } catch (e) {
            alert("Failed to update status.");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
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
                        {paginatedRequests.map((req) => (
                            <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-foreground">{req.employeeName}</div>
                                    <div className="text-xs text-muted-foreground">{req.employeeEmail}</div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                    <div className="font-medium text-foreground">{req.dateRange}</div>
                                    <div className="text-xs">{req.timeRange}</div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                                    <div className="flex flex-col gap-1">
                                        <span className="truncate" title={req.reason}>{req.reason}</span>
                                        {req.attachmentUrl && (
                                            <a href={req.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1 w-fit">
                                                <ExternalLink className="size-3" /> View Proof
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
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {req.status === "PENDING" ? (
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                                                disabled={processingId === req.id}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors disabled:opacity-50"
                                                title="Approve"
                                            >
                                                {processingId === req.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                                                disabled={processingId === req.id}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                                title="Reject"
                                            >
                                                {processingId === req.id ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">Processed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {paginatedRequests.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No overtime requests to review.
                    </div>
                )}
            </div>
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
