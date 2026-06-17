"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";



export async function createHoliday(formData: FormData) {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can create holidays.");
  }

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const type = formData.get("type") as string;
  const description = formData.get("description") as string | null;

  if (!name || !dateStr || !type) {
    throw new Error("Name, date, and type are required.");
  }

  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date format.");
  }

  await prisma.holiday.create({
    data: {
      name,
      date: dateObj,
      type,
      description,
    },
  });

  revalidatePath("/admin/holidays");
  revalidatePath("/holidays");
  revalidatePath("/");
}

export async function deleteHoliday(holidayId: string) {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized: Only admins and managers can delete holidays.");
  }

  await prisma.holiday.delete({
    where: {
      id: holidayId,
    },
  });

  revalidatePath("/admin/holidays");
  revalidatePath("/holidays");
  revalidatePath("/");
}

export async function createAssignedHoliday(formData: FormData) {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  const userId = formData.get("userId") as string;
  
  // Enforce Manager ownership scope
  if (user.role === "MANAGER") {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { managerId: true }
    });
    if (!targetUser || targetUser.managerId !== user.id) {
      throw new Error("Unauthorized: You can only assign holidays to your direct reports.");
    }
  }

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const description = formData.get("description") as string | null;

  if (!userId || !name || !dateStr) {
    throw new Error("Missing required fields.");
  }

  const dateObj = new Date(dateStr);
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date format.");
  }

  await prisma.assignedHoliday.create({
    data: {
      userId,
      name,
      date: dateObj,
      description,
    },
  });

  revalidatePath("/admin/holidays");
}

export async function deleteAssignedHoliday(holidayId: string) {
  const session = await auth();
  const user = session?.user;

  if (!session || !user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
    throw new Error("Unauthorized");
  }

  // Enforce Manager ownership scope
  if (user.role === "MANAGER") {
    const assignedHoliday = await prisma.assignedHoliday.findUnique({
      where: { id: holidayId },
      include: { user: { select: { managerId: true } } }
    });
    
    if (!assignedHoliday || assignedHoliday.user.managerId !== user.id) {
      throw new Error("Unauthorized: You can only delete assigned holidays for your direct reports.");
    }
  }

  await prisma.assignedHoliday.delete({
    where: { id: holidayId },
  });

  revalidatePath("/admin/holidays");
}
