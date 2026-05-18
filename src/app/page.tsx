import { ClockWidget } from "@/components/dashboard/clock-widget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";
import { LayoutDashboard, CalendarDays, Clock } from "lucide-react";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // Get the first name
  const firstName = session.user.name ? session.user.name.split(" ")[0] : "there";
  
  // Date range for the top right pill (mocked to current week for display)
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
  const endOfWeek = new Date(now);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
  const dateRangeStr = `${formatInTimeZone(startOfWeek, 'Asia/Manila', 'MMM d')} - ${formatInTimeZone(endOfWeek, 'Asia/Manila', 'MMM d, yyyy')}`;
  
  const currentDayIndex = now.getDay();
  const currentDayName = DAYS[currentDayIndex];

  const recentLogs = await prisma.timeLog.findMany({
    where: { userId: session.user.id },
    orderBy: { clockIn: "desc" },
    take: 5
  });

  const todaySchedule = await prisma.schedule.findFirst({
    where: { userId: session.user.id, dayOfWeek: currentDayIndex }
  });

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full w-full">


      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-sm font-bold text-primary mb-1 tracking-widest uppercase">WELCOME</h2>
          <h1 className="text-2xl font-bold text-foreground mb-1">{firstName}, here's your workday snapshot.</h1>
        </div>
        <div className="px-4 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground border">
          {dateRangeStr}
        </div>
      </div>

      {/* Centered Content: Clock & Logs */}
      <div className="max-w-lg mx-auto w-full space-y-8 mb-8">
        <ClockWidget />

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

        {/* Recent Time Logs Table */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="text-center mb-6">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">RECENT TIME LOGS</h3>
            <h2 className="text-xl font-bold text-foreground">Your latest activity</h2>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12 border-t">
              No recent activity to display.
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="text-[10px] text-muted-foreground uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-left">DATE</th>
                    <th className="px-4 py-3 font-semibold text-right">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentLogs.map((log: any) => {
                    return (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap text-left">
                          {formatInTimeZone(log.clockIn, 'Asia/Manila', "MMM d, yyyy")}
                        </td>
                        <td className="px-4 py-4 text-muted-foreground whitespace-nowrap text-right">
                          {formatInTimeZone(log.clockIn, 'Asia/Manila', "h:mm a")} - {log.clockOut ? formatInTimeZone(log.clockOut, 'Asia/Manila', "h:mm a") : <span className="text-primary italic">Active</span>} <span className="text-[10px]">(PHT)</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
