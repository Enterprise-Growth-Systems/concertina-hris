"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

export async function generateTimesheetReport(startDate: string, endDate: string, isDirectScope: boolean = false) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  const managerWhereClause = isDirectScope || user.role === "MANAGER" ? { managerId: user.id } : {};

  const parsedStart = new Date(`${startDate}T00:00:00.000Z`);
  const parsedEnd = new Date(`${endDate}T23:59:59.999Z`);
  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    throw new Error("Invalid date format");
  }

  const logs = await prisma.timeLog.findMany({
    where: {
      clockIn: {
        gte: parsedStart,
        lte: parsedEnd,
      },
      user: managerWhereClause
    },
    include: {
      user: true,
    },
    orderBy: [
      { user: { name: 'asc' } },
      { clockIn: 'asc' }
    ]
  });

  // Create events list for CSV
  type LogEvent = { id: string; type: "IN" | "OUT"; time: Date; user: { name: string; email: string; } };
  const events: LogEvent[] = [];
  logs.forEach((log: any) => {
    if (log.clockOut) {
      events.push({ id: `${log.id}-out`, type: "OUT", time: log.clockOut, user: log.user });
    }
    events.push({ id: `${log.id}-in`, type: "IN", time: log.clockIn, user: log.user });
  });

  // Re-sort by user then chronologically to match Sprout format
  events.sort((a, b) => {
    if (a.user.name !== b.user.name) return a.user.name.localeCompare(b.user.name);
    return a.time.getTime() - b.time.getTime();
  });

  // Create CSV String
  let csv = "Employee Name,Email,Date,Type,Time\n";
  
  events.forEach(event => {
    const dateStr = new Date(event.time).toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = new Date(event.time).toISOString(); // Full ISO string or just time if preferred, sticking to ISO for data integrity
    
    csv += `"${event.user.name}","${event.user.email}",${dateStr},${event.type},${timeStr}\n`;
  });

  return csv;
}

export async function generateLeaveReport(startDate: string, endDate: string, isDirectScope: boolean = false) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  const managerWhereClause = isDirectScope || user.role === "MANAGER" ? { managerId: user.id } : {};

  const parsedStart = new Date(`${startDate}T00:00:00.000Z`);
  const parsedEnd = new Date(`${endDate}T23:59:59.999Z`);
  if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
    throw new Error("Invalid date format");
  }

  const requests = await prisma.leaveRequest.findMany({
    where: {
      startDate: {
        gte: parsedStart,
      },
      endDate: {
        lte: parsedEnd,
      },
      user: managerWhereClause
    },
    include: {
      user: true,
    },
    orderBy: [
      { startDate: 'asc' }
    ]
  });

  // Create CSV String
  let csv = "Employee Name,Email,Type,Start Date,End Date,Status,Reason,Attachment Link\n";
  
  requests.forEach(req => {
    const reasonStr = req.reason ? `"${req.reason.replace(/"/g, '""')}"` : "";
    const typeStr = req.leaveType === "PFFD" ? "PFFD Credits" : req.leaveType;
    const attachmentStr = req.attachmentUrl ? `"${req.attachmentUrl.replace(/"/g, '""')}"` : "";
    
    csv += `"${req.user.name}","${req.user.email}",${typeStr},${new Date(req.startDate).toISOString().split('T')[0]},${new Date(req.endDate).toISOString().split('T')[0]},${req.status},${reasonStr},${attachmentStr}\n`;
  });

  return csv;
}
