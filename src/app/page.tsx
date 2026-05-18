import { ClockWidget } from "@/components/dashboard/clock-widget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";
import { LayoutDashboard } from "lucide-react";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

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
  const currentDateStr = formatInTimeZone(now, 'Asia/Manila', 'MMM d, yyyy | h:mm a');

  const balances = await prisma.leaveBalance.findMany({
    where: { userId: session.user.id }
  });

  const leaveCreditsBalance = balances.find(b => b.leaveType === "PFFD")?.balance || 0;

  const recentLogs = await prisma.timeLog.findMany({
    where: { userId: session.user.id },
    orderBy: { clockIn: "desc" },
    take: 5
  });

  // Calculate simple stats for the UI
  const timeEntriesCount = recentLogs.length;
  const latestStatus = recentLogs[0]?.status === "ON_TIME" ? "On Time" : recentLogs[0]?.status === "LATE" ? "Late" : "N/A";

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-full w-full">
      {/* Top Header */}
      <div className="flex items-center gap-2 mb-6 text-muted-foreground pb-4 border-b">
        <LayoutDashboard className="size-4" />
        <h1 className="font-semibold text-sm">Dashboard</h1>
        <span className="text-sm font-normal">Your daily snapshot of time logs, leave credits, and activity.</span>
      </div>

      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-sm font-bold text-primary mb-1 tracking-widest uppercase">WELCOME</h2>
          <h1 className="text-2xl font-bold text-foreground mb-1">{firstName}, here's your workday snapshot.</h1>
          <p className="text-xs text-muted-foreground">
            {session.user.role === "ADMIN" || session.user.role === "SUPERADMIN" ? "HR Manager" : "Employee"} | {currentDateStr}
          </p>
        </div>
        <div className="px-4 py-1.5 bg-muted rounded-full text-xs font-medium text-muted-foreground border">
          {dateRangeStr}
        </div>
      </div>

      {/* 3-Column Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        
        {/* Col 1: Clock Widget */}
        <ClockWidget />

        {/* Col 2: Logged today */}
        <div className="rounded-2xl border bg-card p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Logged today</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Total time recorded today</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-md text-[10px] font-semibold border border-emerald-200">Today</span>
          </div>

          <div className="flex flex-col items-center justify-center border-b pb-6 mb-6">
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">TOTAL HOURS</p>
             <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-primary">0</span>
              <span className="text-sm font-bold text-muted-foreground">hrs</span>
              <span className="text-4xl font-bold text-primary ml-1">00</span>
              <span className="text-sm font-bold text-muted-foreground">mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">ENTRIES TODAY</p>
              <p className="text-lg font-bold text-foreground">0</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3 flex flex-col items-center justify-center text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">STATUS</p>
              <p className="text-sm font-bold text-muted-foreground">No logs</p>
            </div>
          </div>
          
          <div className="mt-auto pt-4 text-[10px] text-muted-foreground text-center">
            Calculated based on your active and completed logs for today.
          </div>
        </div>

        {/* Col 3: Logged this week */}
        <div className="rounded-2xl border bg-card p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-bold text-foreground text-sm">Logged this week</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Total time recorded this week</p>
            </div>
            <span className="px-2.5 py-1 bg-muted rounded-md text-[10px] font-semibold text-muted-foreground border">This week</span>
          </div>

          <div className="flex flex-col items-center justify-center border-b pb-6 mb-6">
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">TOTAL HOURS</p>
             <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-primary">0</span>
              <span className="text-sm font-bold text-muted-foreground">hrs</span>
              <span className="text-4xl font-bold text-primary ml-1">01</span>
              <span className="text-sm font-bold text-muted-foreground">mins</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">TIME ENTRIES</p>
              <p className="text-lg font-bold text-foreground">{timeEntriesCount}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">LATEST STATUS</p>
              <p className={`text-sm font-bold ${latestStatus === 'Late' ? 'text-destructive' : 'text-emerald-600'}`}>{latestStatus}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">TODAY</p>
              <p className="text-sm font-bold text-foreground">No logs today</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">0h 00m logged</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">PFFD BALANCE</p>
              <p className="text-xl font-bold text-foreground">{leaveCreditsBalance}</p>
            </div>
          </div>

          <div className="mt-auto pt-4 text-[10px] text-muted-foreground">
            Includes completed entries recorded during the current week.
          </div>
        </div>
      </div>

      {/* Recent Time Logs Table */}
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">RECENT TIME LOGS</h3>
        <h2 className="text-xl font-bold text-foreground mb-6">Your latest activity</h2>

        {recentLogs.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-12 border-t">
            No recent activity to display.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-muted-foreground uppercase tracking-widest border-b">
                <tr>
                  <th className="px-4 py-3 font-semibold">DATE</th>
                  <th className="px-4 py-3 font-semibold">TIME</th>
                  <th className="px-4 py-3 font-semibold">DETAILS</th>
                  <th className="px-4 py-3 font-semibold text-right">STATUS</th>
                  <th className="px-4 py-3 font-semibold text-right">DURATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentLogs.map((log: any) => {
                  const isLate = log.status === "LATE";
                  // Mock duration for now
                  const durationStr = log.clockOut ? "1m" : "0m";
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
                        {formatInTimeZone(log.clockIn, 'Asia/Manila', "EEEE, MMM d")}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground whitespace-nowrap">
                        {formatInTimeZone(log.clockIn, 'Asia/Manila', "h:mm a")} - {log.clockOut ? formatInTimeZone(log.clockOut, 'Asia/Manila', "h:mm a") : <span className="text-primary italic">Active</span>}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {log.notes || "No details"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${isLate ? "bg-red-50 text-destructive" : "bg-emerald-50 text-emerald-600"}`}>
                          {isLate ? "Late" : "On Time"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right text-muted-foreground">
                        {durationStr}
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
  );
}
