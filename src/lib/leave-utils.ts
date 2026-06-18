export function calculateLeaveDays(
    start: Date, 
    end: Date, 
    schedules: { dayOfWeek: number, startTime: string, endTime: string }[]
): number {
    let totalDays = 0;
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endDate = new Date(end);
    endDate.setHours(0, 0, 0, 0);

    const scheduledDays = new Set<number>();
    if (schedules.length > 0) {
        schedules.forEach(s => scheduledDays.add(s.dayOfWeek));
    } else {
        // Fallback: Mon-Fri
        [1, 2, 3, 4, 5].forEach(d => scheduledDays.add(d));
    }

    while (current <= endDate) {
        if (scheduledDays.has(current.getDay())) {
            totalDays++;
        }
        current.setDate(current.getDate() + 1);
    }

    return totalDays;
}
