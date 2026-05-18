"use client";

import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { Search, Filter, Calendar as CalendarIcon, X } from "lucide-react";

type TimeLogData = {
    id: string;
    clockIn: Date;
    clockOut: Date | null;
    user: {
        name: string;
        email: string;
    };
};

export function TimeLogsClientPage({ initialLogs }: { initialLogs: TimeLogData[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    type LogEvent = { id: string; type: "IN" | "OUT"; time: Date; user: { name: string; email: string; } };
    const events: LogEvent[] = [];
    initialLogs.forEach(log => {
        if (log.clockOut) {
            events.push({ id: `${log.id}-out`, type: "OUT", time: log.clockOut, user: log.user });
        }
        events.push({ id: `${log.id}-in`, type: "IN", time: log.clockIn, user: log.user });
    });
    events.sort((a, b) => b.time.getTime() - a.time.getTime());

    const filteredLogs = events.filter(event => {
        // 1. Search Query Filter
        const matchesSearch = 
            event.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            event.user.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Date Filter
        let matchesDate = true;
        if (dateFilter) {
            const selectedDate = parseISO(dateFilter);
            matchesDate = isSameDay(new Date(event.time), selectedDate);
        }

        return matchesSearch && matchesDate;
    });

    const clearFilters = () => {
        setSearchQuery("");
        setDateFilter("");
    };

    const hasActiveFilters = searchQuery !== "" || dateFilter !== "";

    return (
        <div className="space-y-6">
            {/* Filter Control Panel */}
            <div className="bg-card border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    {/* Search Input */}
                    <div className="relative w-full md:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="size-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border text-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>



                    {/* Date Picker */}
                    <div className="relative w-full md:w-48">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="size-4 text-muted-foreground" />
                        </div>
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full bg-background border text-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

            {/* Status Bar */}
            <div className="text-sm text-muted-foreground font-medium px-1">
                Showing {filteredLogs.length} matching events
            </div>

            {/* Table */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-foreground">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        {hasActiveFilters 
                                            ? "No events found matching your specific filters." 
                                            : "No active time events found across the company."}
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((event) => {
                                    return (
                                        <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{event.user.name}</div>
                                                <div className="text-xs text-muted-foreground">{event.user.email}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                <span className="text-sm font-bold">{formatInTimeZone(new Date(event.time), 'Asia/Manila', "MMM d, yyyy")}</span>
                                                <span className="text-xs text-muted-foreground ml-2 uppercase">{formatInTimeZone(new Date(event.time), 'Asia/Manila', "EEE")}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-md ${event.type === 'IN' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'}`}>{event.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap text-right">
                                                {formatInTimeZone(new Date(event.time), 'Asia/Manila', "hh:mm:ss a")}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
