import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TimeLogsClientPage } from "./components/time-logs-client-page";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminTimesheetsPage() {
    const session = await auth();
    const user = session?.user as any;
    if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        redirect("/login");
    }

    const timeLogs = await prisma.timeLog.findMany({
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                }
            }
        },
        orderBy: { clockIn: "desc" },
        take: 1000, // Show last 1000 logs across the company to allow deep client-side filtering
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Time Logs</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Advanced Multi-Filter Search
                </p>
            </div>

            <TimeLogsClientPage initialLogs={timeLogs} />
        </div>
    );
}
