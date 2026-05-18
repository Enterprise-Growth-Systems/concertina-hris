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

  const recentLogs = await prisma.timeLog.findMany({
    where: { userId: session.user.id },
    orderBy: { clockIn: "desc" },
    take: 5
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
