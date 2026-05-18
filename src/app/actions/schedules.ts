"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function upsertSchedule(userId: string, dayOfWeek: number, startTime: string, endTime: string) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only Admins can manage schedules.");
  }

  // Allow clearing a schedule for a specific day by passing empty times
  if (!startTime || !endTime) {
     await prisma.schedule.deleteMany({
         where: { userId, dayOfWeek }
     });
  } else {
    await prisma.schedule.upsert({
      where: {
        userId_dayOfWeek: { userId, dayOfWeek },
      },
      update: { startTime, endTime },
      create: { userId, dayOfWeek, startTime, endTime },
    });
  }

  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
}

export async function upsertSpecialSchedule(userId: string, dateStr: string, startTime: string, endTime: string, reason?: string) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  const date = new Date(dateStr);

  await prisma.specialSchedule.upsert({
    where: {
      userId_date: { userId, date },
    },
    update: { startTime, endTime, reason },
    create: { userId, date, startTime, endTime, reason },
  });

  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
}

export async function deleteSpecialSchedule(id: string) {
  const session = await auth();
  const user = session?.user as any;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  await prisma.specialSchedule.delete({ where: { id } });

  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
}
