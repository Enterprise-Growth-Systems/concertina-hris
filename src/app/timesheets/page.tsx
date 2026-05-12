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

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Review your attendance history and total hours worked.
                </p>
            </div>

            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Clock In</th>
                                <th className="px-6 py-4 font-semibold">Clock Out</th>
                                <th className="px-6 py-4 font-semibold">Duration</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {timeLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        No time logs found.
                                    </td>
                                </tr>
                            ) : (
                                timeLogs.map((log: any) => {
                                    let duration = "-";
                                    if (log.clockOut) {
                                        const diffMs = log.clockOut.getTime() - log.clockIn.getTime();
                                        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                                        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                        duration = `${diffHrs}h ${diffMins}m`;
                                    }

                                    return (
                                        <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">
                                                {formatInTimeZone(log.clockIn, "Asia/Manila", "MMM d, yyyy")}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {formatInTimeZone(log.clockIn, "Asia/Manila", "h:mm a")}
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {log.clockOut ? formatInTimeZone(log.clockOut, "Asia/Manila", "h:mm a") : <span className="text-primary italic animate-pulse">Active</span>}
                                            </td>
                                            <td className="px-6 py-4 font-medium">
                                                {duration}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${log.status === 'ON_TIME'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                    }`}>
                                                    {log.status === 'ON_TIME' ? 'On Time' : 'Late'}
                                                </span>
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
