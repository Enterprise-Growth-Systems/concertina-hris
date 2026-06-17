import { ClockWidget } from "@/components/dashboard/clock-widget";
import { AnnouncementsWidget } from "@/components/dashboard/announcements-widget";
import { RecentTimeLogsWidget } from "@/components/dashboard/recent-time-logs-widget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

import { format } from "date-fns";
import { Clock, CalendarDays } from "lucide-react";



export const dynamic = "force-dynamic";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // Get the first name
  const firstName = session.user.name ? session.user.name.split(" ")[0] : "there";
  
  const now = new Date();
  
  const currentDayIndex = now.getDay();
  const currentDayName = DAYS[currentDayIndex];

  const recentLogs = await prisma.timeLog.findMany({
    where: { userId: session.user.id },
    orderBy: { clockIn: "desc" },
    take: 1000
  });

  const todaySchedule = await prisma.schedule.findFirst({
    where: { userId: session.user.id, dayOfWeek: currentDayIndex }
  });

  const events: { type: "IN" | "OUT", time: Date, id: string }[] = [];
  recentLogs.forEach((log: any) => {
    if (log.clockOut) {
      events.push({ type: "OUT", time: log.clockOut, id: `${log.id}-out` });
    }
    events.push({ type: "IN", time: log.clockIn, id: `${log.id}-in` });
  });
  
  events.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full w-full">


      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-sm font-bold text-primary mb-1 tracking-widest uppercase">WELCOME</h2>
          <h1 className="text-2xl font-bold text-foreground mb-1">{firstName}, here&apos;s your workday snapshot.</h1>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Left Column: Schedule & Time Tracking */}
        <div className="space-y-8">
          {/* Today's Schedule Box */}
          <div className="rounded-2xl border bg-card p-5 relative overflow-hidden transition-all bg-primary/5 border-primary shadow-sm shadow-primary/20">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg z-10">
            Today
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="size-10 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
              <CalendarDays className="size-5" />
            </div>
            <div className="font-semibold text-lg text-foreground">{currentDayName} Schedule</div>
          </div>

          <div className="space-y-3">
            {todaySchedule ? (
              <div className="flex items-center gap-2 text-foreground/80">
                <Clock className="size-4 text-primary" />
                <span className="font-medium text-sm">
                  {format(new Date(`1970-01-01T${todaySchedule.startTime}`), "h:mm a")} - {format(new Date(`1970-01-01T${todaySchedule.endTime}`), "h:mm a")}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground italic">
                <Clock className="size-4 opacity-50" />
                <span className="text-sm">Off Duty</span>
              </div>
            )}
          </div>
        </div>

        <ClockWidget />

        {/* Recent Time Logs Table */}
        <RecentTimeLogsWidget events={events} />
        </div>
        
        {/* Right Column: Announcements */}
        <div className="relative min-h-[600px] lg:min-h-0 lg:h-full">
          <div className="static h-full lg:absolute lg:inset-0">
            <AnnouncementsWidget />
          </div>
        </div>
      </div>

    </div>
  );
}
