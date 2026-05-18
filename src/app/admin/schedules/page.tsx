import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { ScheduleClientPage } from "./components/schedule-client-page";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminSchedulesPage() {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!session || !sessionUser || (sessionUser.role !== "ADMIN" && sessionUser.role !== "MANAGER")) {
    redirect("/");
  }

  // Fetch users and their assigned schedules
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
    include: {
      schedules: true,
      specialSchedules: true
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Assign and modify weekly work schedules for all team members.
        </p>
      </div>

      <ScheduleClientPage initialUsers={users} />
    </div>
  );
}
