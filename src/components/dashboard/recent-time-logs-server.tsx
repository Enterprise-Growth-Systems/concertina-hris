import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { RecentTimeLogsWidget } from "./recent-time-logs-widget";

export async function RecentTimeLogsServerWidget() {
    const session = await auth();
    if (!session || !session.user) return null;

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const recentLogs = await prisma.timeLog.findMany({
        where: { 
            userId: session.user.id,
            clockIn: { gte: twoWeeksAgo }
        },
        orderBy: { clockIn: "desc" },
    });

    const events: { type: "IN" | "OUT", time: Date, id: string }[] = [];
    recentLogs.forEach((log: any) => {
        if (log.clockOut) {
            events.push({ type: "OUT", time: log.clockOut, id: `${log.id}-out` });
        }
        events.push({ type: "IN", time: log.clockIn, id: `${log.id}-in` });
    });
    
    events.sort((a, b) => b.time.getTime() - a.time.getTime());

    return <RecentTimeLogsWidget events={events} />;
}
