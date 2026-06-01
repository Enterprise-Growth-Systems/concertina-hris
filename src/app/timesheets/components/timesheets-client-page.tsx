"use client";

import { useState, useMemo, useEffect } from "react";
import { format, isSameDay, parseISO, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";

type LogEvent = { 
    id: string; 
    type: "IN" | "OUT"; 
    time: Date; 
};

export function TimesheetsClientPage({ initialEvents }: { initialEvents: LogEvent[] }) {
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 100;

    const filteredLogs = useMemo(() => {
        return initialEvents.filter(event => {
            // Date Range Filter
            let matchesDate = true;
            if (startDateFilter || endDateFilter) {
                const eventDate = new Date(event.time);
                
                if (startDateFilter && endDateFilter) {
                    matchesDate = isWithinInterval(eventDate, {
                        start: startOfDay(parseISO(startDateFilter)),
                        end: endOfDay(parseISO(endDateFilter))
                    });
                } else if (startDateFilter) {
                    matchesDate = eventDate >= startOfDay(parseISO(startDateFilter));
                } else if (endDateFilter) {
                    matchesDate = eventDate <= endOfDay(parseISO(endDateFilter));
                }
            }

            return matchesDate;
        });
    }, [initialEvents, startDateFilter, endDateFilter]);

    const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const clearFilters = () => {
        setStartDateFilter("");
        setEndDateFilter("");
        setCurrentPage(1);
    };

    const hasActiveFilters = startDateFilter !== "" || endDateFilter !== "";

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Filter Control Panel */}
            <div className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
                    <div className="relative w-full md:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                        </div>
                        <input
                            type="date"
                            value={startDateFilter}
                            onChange={(e) => {
                                setStartDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-background border text-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="Start Date"
                        />
                    </div>
                    <span className="text-muted-foreground text-sm font-medium">to</span>
                    <div className="relative w-full md:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                        </div>
                        <input
                            type="date"
                            value={endDateFilter}
                            onChange={(e) => {
                                setEndDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-background border text-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                            aria-label="End Date"
                        />
                    </div>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                    <button 
                        onClick={clearFilters}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground rounded-lg transition-colors border border-transparent shrink-0"
                    >
                        <X className="size-4" />
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                        {hasActiveFilters 
                                            ? "No logs found for the selected date range." 
                                            : "No time logs found."}
                                    </td>
                                </tr>
                            ) : (
                                paginatedLogs.map((event) => {
                                    return (
                                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                <span className="text-sm font-bold">{formatInTimeZone(event.time, 'Asia/Manila', "MMM d, yyyy")}</span>
                                                <span className="text-xs text-muted-foreground ml-2 uppercase">{formatInTimeZone(event.time, 'Asia/Manila', "EEE")}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-md ${event.type === 'IN' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'}`}>{event.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap text-right">
                                                {formatInTimeZone(event.time, 'Asia/Manila', "hh:mm:ss a")}
                                            </td>
                                        </tr>
                                    );
                                })
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
