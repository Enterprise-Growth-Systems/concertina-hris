import prisma from "@/lib/prisma";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TimesheetsClientPage } from "./components/timesheets-client-page";



export const dynamic = "force-dynamic";

export default async function TimesheetsPage() {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        redirect("/login");
    }

    const timeLogs = await prisma.timeLog.findMany({
        where: { userId: session.user.id },
        orderBy: { clockIn: "desc" },
        take: 1000, // Fetch up to 1000 logs for client-side pagination
    });

    const events: { type: "IN" | "OUT", time: Date, id: string }[] = [];
    timeLogs.forEach((log: any) => {
        if (log.clockOut) {
            events.push({ type: "OUT", time: log.clockOut, id: `${log.id}-out` });
        }
        events.push({ type: "IN", time: log.clockIn, id: `${log.id}-in` });
    });

    events.sort((a, b) => b.time.getTime() - a.time.getTime());

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Timesheets</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Review your attendance history.
                </p>
            </div>

            <TimesheetsClientPage initialEvents={events} />
        </div>
    );
}
