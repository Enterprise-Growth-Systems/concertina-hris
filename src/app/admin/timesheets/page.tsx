import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TimeLogsClientPage } from "./components/time-logs-client-page";

import { AdminScopeToggle } from "@/components/admin/admin-scope-toggle";



export const dynamic = "force-dynamic";

export default async function AdminTimesheetsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const session = await auth();
    const resolvedParams = await searchParams;
    const user = session?.user;
    if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
        redirect("/login");
    }

    const isDirectScope = resolvedParams.view === "direct" || user.role === "MANAGER";
    const managerWhereClause = isDirectScope ? { user: { managerId: user.id } } : {};

    const timeLogs = await prisma.timeLog.findMany({
        where: managerWhereClause,
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{isDirectScope ? "My Team's Time Logs" : "Company Time Logs"}</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Advanced Multi-Filter Search
                    </p>
                </div>
                <AdminScopeToggle role={user.role} />
            </div>

            <TimeLogsClientPage initialLogs={timeLogs} />
        </div>
    );
}
