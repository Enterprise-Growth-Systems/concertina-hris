import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function TimesheetsPage() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    const timeLogs = await prisma.timeLog.findMany({
        where: { userId: session.user.id },
        orderBy: { clockIn: "desc" },
        take: 30, // Show last 30 logs
    });

    const events: { type: "IN" | "OUT", time: Date, id: string, status?: string }[] = [];
    timeLogs.forEach((log: any) => {
        if (log.clockOut) {
            events.push({ type: "OUT", time: log.clockOut, id: `${log.id}-out` });
        }
        events.push({ type: "IN", time: log.clockIn, id: `${log.id}-in`, status: log.status });
    });

    events.sort((a, b) => b.time.getTime() - a.time.getTime());

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Review your attendance history.
                </p>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Time</th>
                                <th className="px-6 py-4 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {events.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No time logs found.
                                    </td>
                                </tr>
                            ) : (
                                events.map((event) => {
                                    return (
                                        <tr key={event.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                                <span className="text-sm font-bold">{formatInTimeZone(event.time, 'Asia/Manila', "MMM d, yyyy")}</span>
                                                <span className="text-xs text-muted-foreground ml-2 uppercase">{formatInTimeZone(event.time, 'Asia/Manila', "EEE")}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold px-3 py-1 rounded-md ${event.type === 'IN' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'}`}>{event.type}</span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-medium whitespace-nowrap">
                                                {formatInTimeZone(event.time, 'Asia/Manila', "hh:mm:ss a")}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {event.status && event.type === 'IN' ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${event.status === 'ON_TIME'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-red-50 text-red-600 border border-red-200'
                                                        }`}>
                                                        {event.status === 'ON_TIME' ? 'On Time' : 'Late'}
                                                    </span>
                                                ) : <span className="text-muted-foreground/30">-</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
