"use client";

import { useState, useEffect } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleClockStatus, getClockStatus } from "@/app/actions/time";
import { AnimatedClockWidget } from "./animated-clock";

export function ClockWidget() {
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [hasLoadedStatus, setHasLoadedStatus] = useState(false);


    useEffect(() => {
        // Initial fetch to get clock-in status from DB
        getClockStatus().then((status) => {
            setIsClockedIn(status.isClockedIn);
            setHasLoadedStatus(true);
        });
    }, []);

    const handleToggleClock = async () => {
        if (isPending || !hasLoadedStatus) return;
        
        setIsPending(true);
        try {
            // Note: In the future, we can pass projectInput and notesInput to the action
            const res = await toggleClockStatus();
            if (res.success && res.isClockedIn !== undefined) {
                // Strictly reflect the database's true state rather than blindly toggling local state
                setIsClockedIn(res.isClockedIn);
            }
        } finally {
            setIsPending(false);
        }
    };

    if (!hasLoadedStatus) {
        return (
            <div className="rounded-2xl border bg-card p-6 flex flex-col items-center justify-center min-h-[150px] animate-pulse">
                <div className="h-8 w-32 bg-muted rounded-md mb-4"></div>
                <div className="h-10 w-full bg-muted rounded-md"></div>
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

            <div className="flex-1 flex items-center justify-center mb-8">
                <AnimatedClockWidget />
            </div>

            <div className="flex flex-col items-center mt-auto">
                {!hasLoadedStatus ? (
                    <div className="h-10 w-32 bg-muted rounded-md animate-pulse"></div>
                ) : (
                    <button
                        onClick={handleToggleClock}
                        disabled={isPending}
                        className={cn(
                            "flex items-center justify-center gap-2 px-8 py-2.5 rounded-md font-bold text-sm transition-all w-full",
                            isClockedIn
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
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
