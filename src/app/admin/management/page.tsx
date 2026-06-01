import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ManagementClientPage } from "./components/management-client-page";

import { AdminScopeToggle } from "@/components/admin/admin-scope-toggle";

const prisma = new PrismaClient();
export const dynamic = "force-dynamic";

export default async function AdminManagementPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const session = await auth();
    const resolvedParams = await searchParams;
    let currentUserRole = "EMPLOYEE";
    
    if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });
        if (dbUser) currentUserRole = dbUser.role;
    }

    if (!session || !session.user || (currentUserRole !== "ADMIN" && currentUserRole !== "MANAGER")) {
        redirect("/");
    }

    const isDirectScope = resolvedParams.view === "direct" || currentUserRole === "MANAGER";
    const userWhereClause = isDirectScope ? { managerId: session.user.id } : {};

    // 1. Fetch Team (Users) Data
    const users = await prisma.user.findMany({
        where: userWhereClause,
        orderBy: { name: 'asc' },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            contactNumber: true,
            emergencyContact: true,
            address: true,
            department: true,
            position: true,
            icId: true,
            managerId: true,
            leaveBalances: {
                where: { leaveType: 'PFFD' }
            },
            schedules: true,
            specialSchedules: true
        }
    });

    const managers = users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').map(u => ({
        id: u.id,
        name: u.name
    }));

    const formattedUsersForTeam = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        leaveBalance: u.leaveBalances[0]?.balance || 0,
        joined: format(u.createdAt, 'MMM d, yyyy'),
        contactNumber: u.contactNumber,
        emergencyContact: u.emergencyContact,
        address: u.address,
        department: u.department,
        position: u.position,
        icId: u.icId,
        managerId: u.managerId
    }));

    // 2. Fetch Holiday Data
    const globalHolidays = await prisma.holiday.findMany({
        orderBy: { date: "asc" }
    });

    const assignedHolidays = await prisma.assignedHoliday.findMany({
        orderBy: { date: "asc" },
        include: {
            user: { select: { name: true, email: true } }
        }
    });

    const usersForHolidays = users.map(u => ({ id: u.id, name: u.name, email: u.email }));

    return (
        <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Management Dashboard</h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage team members, schedules, and holidays.
                    </p>
                </div>
                <AdminScopeToggle role={currentUserRole} />
            </div>
            
            <ManagementClientPage 
                teamData={{ initialUsers: formattedUsersForTeam, currentUserRole, managers }}
                scheduleData={{ initialUsers: users }}
                holidayData={{ globalHolidays, assignedHolidays, users: usersForHolidays }}
            />
        </div>
    );
}
