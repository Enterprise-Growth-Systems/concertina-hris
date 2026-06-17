"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Maximize2 } from "lucide-react";
import { TimesheetsModal } from "./timesheets-modal";

type LogEvent = { 
    id: string; 
    type: "IN" | "OUT"; 
    time: Date; 
};

export function RecentTimeLogsWidget({ events }: { events: LogEvent[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="rounded-2xl border bg-card p-6 relative">
            {/* Header */}
            <div className="text-center mb-6 relative">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">RECENT TIME LOGS</h3>
                <h2 className="text-xl font-bold text-foreground">Your latest activity</h2>
                
                {/* Expand Button */}
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-primary bg-muted/50 hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                    title="View All Timesheets"
                >
                    <Maximize2 className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline-block">Expand</span>
                </button>
            </div>

            {/* Table */}
            {events.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-12 border-t">
                    No recent activity to display.
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-center">
                        <thead className="text-[10px] text-muted-foreground uppercase tracking-widest border-b">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-left">DATE</th>
                                <th className="px-4 py-3 font-semibold text-center">TYPE</th>
                                <th className="px-4 py-3 font-semibold text-right">TIME</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {events.slice(0, 10).map((event) => {
                                return (
                                    <tr key={event.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap text-left">
                                            <span className="text-sm font-bold">{formatInTimeZone(event.time, 'Asia/Manila', "MMM d, yyyy")}</span>
                                            <span className="text-xs text-muted-foreground ml-1.5 uppercase">{formatInTimeZone(event.time, 'Asia/Manila', "EEE")}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${event.type === 'IN' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'}`}>{event.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-foreground whitespace-nowrap text-right font-medium">
                                            {formatInTimeZone(event.time, 'Asia/Manila', "hh:mm:ss a")}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            <TimesheetsModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                initialEvents={events} 
            />
        </div>
    );
}
