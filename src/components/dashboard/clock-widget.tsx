"use client";

import { useState, useEffect, useTransition } from "react";
import { format } from "date-fns";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleClockStatus, getClockStatus } from "@/app/actions/time";

export function ClockWidget() {
    const [time, setTime] = useState<Date | null>(null);
    const [isClockedIn, setIsClockedIn] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [hasLoadedStatus, setHasLoadedStatus] = useState(false);

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
            const res = await toggleClockStatus();
            if (res.success) {
                setIsClockedIn(!isClockedIn);
            }
        } finally {
            setIsPending(false);
        }
    };

    if (!time) {
        return (
            <div className="rounded-2xl border bg-card shadow-sm p-6 lg:p-10 flex flex-col items-center justify-center min-h-[300px] animate-pulse">
                <div className="h-12 w-48 bg-muted rounded-lg mb-4"></div>
                <div className="h-6 w-32 bg-muted rounded-md"></div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border bg-card text-card-foreground shadow-sm relative overflow-hidden group">
            {/* Decorative background blur */}
            <div className={cn(
                "absolute -inset-24 bg-gradient-to-tr opacity-20 blur-3xl transition-colors duration-1000 -z-10",
                (hasLoadedStatus && isClockedIn) ? "from-primary/50 to-fuchsia-500/50" : "from-zinc-500/20 to-zinc-400/20"
            )}></div>

            <div className="p-6 lg:p-10 flex flex-col items-center justify-center text-center">
                <div className="mb-8">
                    <h2 className="text-6xl lg:text-8xl font-black tracking-tighter tabular-nums text-foreground drop-shadow-sm">
                        {format(time, "HH:mm:ss")}
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium mt-2 uppercase tracking-widest">
                        {format(time, "EEEE, MMMM do")}
                    </p>
                </div>

                {!hasLoadedStatus ? (
                    <div className="h-[60px] w-[180px] bg-muted/50 rounded-full animate-pulse flex items-center justify-center border border-border">
                        <div className="size-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <button
                        onClick={handleToggleClock}
                        disabled={isPending}
                        className={cn(
                            "relative flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform shadow-lg overflow-hidden",
                            isClockedIn
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105 shadow-destructive/20"
                                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-primary/20"
                        )}
                    >
                        {isPending ? (
                            <div className="size-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <div className={cn(
                                    "absolute inset-0 bg-white/20 translate-y-full transition-transform duration-300 group-hover:translate-y-0",
                                    !isClockedIn && "group-hover:translate-y-0"
                                )} />
                                {isClockedIn ? <Square className="size-5 fill-current relative z-10" /> : <Play className="size-5 fill-current relative z-10" />}
                                <span className="relative z-10">{isClockedIn ? "Clock Out" : "Clock In"}</span>
                            </>
                        )}
                    </button>
                )}

                <p className="mt-6 text-sm text-muted-foreground font-medium min-h-[20px]">
                    {!hasLoadedStatus 
                        ? "Checking status..." 
                        : isClockedIn
                            ? "You are currently clocked in. Have a great day!"
                            : "Ready to start your day? Don't forget to clock in."}
                </p>
            </div>
        </div>
    );
}
