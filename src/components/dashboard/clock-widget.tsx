"use client";

import { useState, useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleClockStatus, getClockStatus } from "@/app/actions/time";

export function ClockWidget() {
    const [time, setTime] = useState<Date | null>(null);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [hasLoadedStatus, setHasLoadedStatus] = useState(false);
    
    // Optional form state
    const [projectInput, setProjectInput] = useState("");
    const [notesInput, setNotesInput] = useState("");

    useEffect(() => {
        // Initial fetch to get clock-in status from DB
        getClockStatus().then((status) => {
            setIsClockedIn(status.isClockedIn);
            setHasLoadedStatus(true);
        });

        setTime(new Date());
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleToggleClock = async () => {
        if (isPending || !hasLoadedStatus) return;
        
        setIsPending(true);
        try {
            // Note: In the future, we can pass projectInput and notesInput to the action
            const res = await toggleClockStatus();
            if (res.success) {
                setIsClockedIn(!isClockedIn);
                if (!isClockedIn) {
                   // clear inputs on clock out
                   setProjectInput("");
                   setNotesInput("");
                }
            }
        } finally {
            setIsPending(false);
        }
    };

    if (!time) {
        return (
            <div className="rounded-2xl border bg-card p-6 flex flex-col items-center justify-center min-h-[350px] animate-pulse">
                <div className="h-8 w-32 bg-muted rounded-md mb-8"></div>
                <div className="h-12 w-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 w-32 bg-muted rounded-md"></div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border bg-card p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-foreground text-sm">Clock-in</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Live attendance tracker</p>
                </div>
                <span className="px-2.5 py-1 bg-muted rounded-md text-[10px] font-semibold text-muted-foreground border">
                    {hasLoadedStatus ? (isClockedIn ? "Active" : "Ready") : "..."}
                </span>
            </div>

            <div className="flex flex-col items-center justify-center mb-6">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">CURRENT TIME</p>
                <h2 className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                    {formatInTimeZone(time, 'Asia/Manila', "HH:mm:ss")}
                </h2>
                <p className="text-xs font-medium text-muted-foreground mt-1">
                    {formatInTimeZone(time, 'Asia/Manila', "EEEE, MMM d")}
                </p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
                <input 
                    type="text" 
                    placeholder="Project or work item (optional)" 
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    disabled={isClockedIn || !hasLoadedStatus}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                />
                <input 
                    type="text" 
                    placeholder="Notes (optional)" 
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    disabled={isClockedIn || !hasLoadedStatus}
                    className="w-full text-sm px-4 py-2.5 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                />
            </div>

            <div className="flex flex-col items-center mt-auto">
                {!hasLoadedStatus ? (
                    <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
                ) : (
                    <button
                        onClick={handleToggleClock}
                        disabled={isPending}
                        className={cn(
                            "flex items-center justify-center gap-2 px-8 py-2.5 rounded-md font-bold text-sm transition-all w-40",
                            isClockedIn
                                ? "bg-muted text-foreground hover:bg-muted/80 border"
                                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        )}
                    >
                        {isPending ? (
                            <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                {isClockedIn ? <Square className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
                                <span>{isClockedIn ? "Clock-out" : "Clock-in"}</span>
                            </>
                        )}
                    </button>
                )}

                <p className="mt-4 text-xs text-muted-foreground text-center">
                    {!hasLoadedStatus 
                        ? "Checking status..." 
                        : isClockedIn
                            ? "You are currently clocked in and working."
                            : "You are currently clocked out and ready to begin."}
                </p>
            </div>
        </div>
    );
}
