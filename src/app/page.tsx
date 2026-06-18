import { ClockWidget } from "@/components/dashboard/clock-widget";
import { AnnouncementsWidget } from "@/components/dashboard/announcements-widget";
import { RecentTimeLogsServerWidget } from "@/components/dashboard/recent-time-logs-server";
import { TodayScheduleWidget } from "@/components/dashboard/today-schedule-widget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";



export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  // Get the first name
  const firstName = session.user.name ? session.user.name.split(" ")[0] : "there";

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
          <Suspense fallback={<div className="h-32 rounded-2xl border bg-card flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
            <TodayScheduleWidget />
          </Suspense>

          <ClockWidget />

          <Suspense fallback={<div className="h-64 rounded-2xl border bg-card flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
            <RecentTimeLogsServerWidget />
          </Suspense>
        </div>
        
        {/* Right Column: Announcements */}
        <div className="relative min-h-[600px] lg:min-h-0 lg:h-full">
          <div className="static h-full lg:absolute lg:inset-0">
            <Suspense fallback={<div className="h-full rounded-2xl border bg-card flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>}>
              <AnnouncementsWidget />
            </Suspense>
          </div>
        </div>
      </div>

    </div>
  );
}
