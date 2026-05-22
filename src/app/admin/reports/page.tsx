import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReportsClientPage } from "./components/reports-client-page";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ searchParams }: { searchParams: { view?: string } }) {
    const session = await auth();
    const user = session?.user as any;
    if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER" && user.role !== "SUPERADMIN")) {
        redirect("/login");
    }

    const isDirectScope = searchParams.view === "direct" || user.role === "MANAGER";
    
    return <ReportsClientPage role={user.role} isDirectScope={isDirectScope} />;
}
