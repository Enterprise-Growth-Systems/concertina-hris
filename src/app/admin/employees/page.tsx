import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { auth } from "@/auth";
import { EmployeeClientPage } from "./components/employee-client-page";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function EmployeesPage() {
    const session = await auth();
    const currentUserRole = session?.user ? (session.user as any).role : "EMPLOYEE";

    // Fetch all users with their primary leave balance
    const users = await prisma.user.findMany({
        orderBy: { name: 'asc' },
        include: {
            leaveBalances: {
                where: { leaveType: 'PFFD' }
            }
        }
    });

    // Flatten data for the client component
    const formattedUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        leaveBalance: u.leaveBalances[0]?.balance || 0,
        joined: format(u.createdAt, 'MMM d, yyyy')
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-8 py-8 px-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Team Management</h1>
                <p className="text-muted-foreground mt-1 text-lg">
                    Add new employees, manage roles, and migrate starting PFFD balances.
                </p>
            </div>

            <EmployeeClientPage initialUsers={formattedUsers} currentUserRole={currentUserRole} />
        </div>
    );
}
