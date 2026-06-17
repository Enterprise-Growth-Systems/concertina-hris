"use client";

import { useEffect, useState } from "react";

export function AnimatedClockWidget() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="flex items-center space-x-2 text-foreground font-mono text-2xl h-[32px]">
        <span>--:--:--</span>
      </div>
    );
  }

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  
  const formattedHours = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  
  const pad = (num: number) => num.toString().padStart(2, "0");

  return (
    <div className="flex items-center space-x-2 font-mono text-3xl font-bold tracking-tight text-foreground bg-card px-4 py-2 rounded-xl shadow-sm border">
      <div className="flex space-x-1">
        <span>{pad(formattedHours)}</span>
        <span className="animate-pulse">:</span>
        <span>{pad(minutes)}</span>
        <span className="animate-pulse text-muted-foreground">:</span>
        <span className="text-muted-foreground">{pad(seconds)}</span>
      </div>
      <span className="text-base font-semibold text-muted-foreground uppercase">{ampm}</span>
    </div>
  );
}
