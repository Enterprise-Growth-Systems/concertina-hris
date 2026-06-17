"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";

export function AnimatedClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    setTimeout(updateTime, 0); // avoid synchronous setState warning
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex items-center justify-center h-[72px] animate-pulse">
        <div className="w-48 h-12 bg-muted rounded-lg"></div>
      </div>
    );
  }

  const hours = formatInTimeZone(time, "Asia/Manila", "hh");
  const minutes = formatInTimeZone(time, "Asia/Manila", "mm");
  const seconds = formatInTimeZone(time, "Asia/Manila", "ss");
  const ampm = formatInTimeZone(time, "Asia/Manila", "a");

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-end space-x-2">
        <div className="flex items-center space-x-1.5 font-sans text-5xl md:text-6xl tracking-tighter font-black text-foreground">
          <span>{hours}</span>
          <span className="text-primary/40 pb-2 animate-pulse">:</span>
          <span>{minutes}</span>
          <span className="text-primary/40 pb-2 animate-pulse">:</span>
          <span className="text-primary">{seconds}</span>
        </div>
        <div className="flex flex-col justify-end pb-2">
          <span className="text-xl font-bold text-muted-foreground uppercase leading-none">{ampm}</span>
          <span className="text-xs font-black text-primary uppercase leading-none mt-1.5 tracking-wider">PHT</span>
        </div>
      </div>
    </div>
  );
}
