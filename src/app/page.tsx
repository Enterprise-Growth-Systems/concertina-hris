import Image from "next/image";
import { ClockWidget } from "@/components/dashboard/clock-widget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // Get the first name
  const firstName = session.user.name ? session.user.name.split(" ")[0] : "there";

  const balances = await prisma.leaveBalance.findMany({
    where: { userId: session.user.id }
  });

  const leaveCreditsBalance = balances.find(b => b.leaveType === "LEAVE_CREDITS")?.balance || 0;

  const recentLogs = await prisma.timeLog.findMany({
    where: { userId: session.user.id },
    orderBy: { clockIn: "desc" },
    take: 5
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Good morning, {firstName}!</h1>
        <p className="text-muted-foreground text-lg">
          Here is what is happening today at Concertina HR.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ClockWidget />

          {/* Timesheet Summary Placeholder */}
          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Recent Time Logs</h2>
            {recentLogs.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-8">
                No recent logs to display today.
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div>
                      <p className="font-medium text-sm">{format(log.clockIn, "MMM d, yyyy")}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(log.clockIn, "h:mm a")} - {log.clockOut ? format(log.clockOut, "h:mm a") : <span className="text-primary italic">Active</span>}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.status === "ON_TIME" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      }`}>
                      {log.status === "ON_TIME" ? "On Time" : "Late"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Leave Balances Placeholder */}
          <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 bg-gradient-to-br from-primary/5 to-transparent">
            <h2 className="font-semibold text-lg mb-4 text-primary">Pre-Funded Flex Days (PFFD)</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 backdrop-blur border">
                <div>
                  <p className="font-medium text-sm">Leave Credits</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div className="text-xl font-bold text-primary">{leaveCreditsBalance}</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
