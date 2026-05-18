"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";

export function LeaveApprovalsClientPage({ initialProcessedRequests }: { initialProcessedRequests: any[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const totalPages = Math.ceil(initialProcessedRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = useMemo(() => 
        initialProcessedRequests.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [initialProcessedRequests, currentPage]);

    return (
        <div className="pt-8 space-y-6">
            <h2 className="font-semibold text-xl">Recently Processed</h2>
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Dates</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No processed history.
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequests.map((request: any) => (
                                    <tr key={request.id} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">
                                            {request.user.name}
                                        </td>
                                        <td className="px-6 py-4 capitalize">
                                            {request.leaveType === 'LEAVE_CREDITS' ? 'PFFD Credits' : request.leaveType.toLowerCase()}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {format(new Date(request.startDate), "MMM d")} - {format(new Date(request.endDate), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${request.status === 'APPROVED'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-destructive/10 text-destructive'
                                                }`}>
                                                {request.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
