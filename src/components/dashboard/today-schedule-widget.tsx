import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Clock, CalendarDays } from "lucide-react";
import { auth } from "@/auth";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function TodayScheduleWidget() {
    const session = await auth();
    if (!session || !session.user) return null;

    const now = new Date();
    const currentDayIndex = now.getDay();
    const currentDayName = DAYS[currentDayIndex];

    const todaySchedule = await prisma.schedule.findFirst({
        where: { userId: session.user.id, dayOfWeek: currentDayIndex }
    });

    return (
        <div className="rounded-2xl border bg-card p-5 relative overflow-hidden transition-all bg-primary/5 border-primary shadow-sm shadow-primary/20">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-bl-lg z-10">
                Today
            </div>
            
            <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg flex items-center justify-center bg-primary text-primary-foreground">
                    <CalendarDays className="size-5" />
                </div>
                <div className="font-semibold text-lg text-foreground">{currentDayName} Schedule</div>
            </div>

            <div className="space-y-3">
                {todaySchedule ? (
                    <div className="flex items-center gap-2 text-foreground/80">
                        <Clock className="size-4 text-primary" />
                        <span className="font-medium text-sm">
                            {format(new Date(`1970-01-01T${todaySchedule.startTime}`), "h:mm a")} - {format(new Date(`1970-01-01T${todaySchedule.endTime}`), "h:mm a")}
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground italic">
                        <Clock className="size-4 opacity-50" />
                        <span className="text-sm">Off Duty</span>
                    </div>
                )}
            </div>
        </div>
    );
}
