import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { createHoliday, deleteHoliday } from "@/app/actions/holidays";
import { SubmitButton } from "@/components/ui/submit-button";
import { Calendar } from "lucide-react";
import { HolidayManagerClient } from "./components/holiday-manager-client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

export default async function AdminHolidaysPage() {
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!session || !sessionUser || (sessionUser.role !== "ADMIN" && sessionUser.role !== "MANAGER")) {
    redirect("/");
  }

  const globalHolidays = await prisma.holiday.findMany({
    orderBy: { date: "asc" }
  });

  const assignedHolidays = await prisma.assignedHoliday.findMany({
    orderBy: { date: "asc" },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Holiday Management</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Add and manage official Concertina company holidays and employee-specific assignments.
        </p>
      </div>

      <HolidayManagerClient 
        globalHolidays={globalHolidays} 
        assignedHolidays={assignedHolidays} 
        users={users} 
      />
    </div>
  );
}
