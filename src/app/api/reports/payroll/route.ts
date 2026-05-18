import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        // Authenticate
        const sessionAuth = request.headers.get('cookie');
        if (!sessionAuth) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const startDateParam = searchParams.get('startDate');
        const endDateParam = searchParams.get('endDate');

        let dateFilter = {};
        if (startDateParam && endDateParam) {
            dateFilter = {
                gte: new Date(`${startDateParam}T00:00:00.000Z`),
                lte: new Date(`${endDateParam}T23:59:59.999Z`),
            };
        }

        // 1. Include ALL roles (removed where: { role: { in: ... } })
        // 2. Fetch all necessary data for payroll
        const users = await prisma.user.findMany({
            include: {
                timeLogs: { 
                    where: Object.keys(dateFilter).length > 0 ? { clockIn: dateFilter } : undefined,
                    orderBy: { clockIn: 'asc' } 
                },
                leaveRequests: { 
                    where: Object.keys(dateFilter).length > 0 ? { status: 'APPROVED', startDate: dateFilter } : { status: 'APPROVED' } 
                },
                overtimeRequests: {
                    where: Object.keys(dateFilter).length > 0 ? { status: 'APPROVED', startDate: dateFilter } : { status: 'APPROVED' }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Generate Consolidated Master CSV String
        let csvString = "==== CONCERTINA HR MASTER PAYROLL REPORT ====\n";
        if (startDateParam && endDateParam) {
            csvString += `Date Range: ${startDateParam} to ${endDateParam}\n`;
        }
        csvString += "\n";
        
        // 1. Attendance Summary Section
        csvString += "--- ATTENDANCE SUMMARY ---\n";
        csvString += "Employee Name,Email,IC ID,Role,Department,Position,Total Regular Hours,Total Overtime Hours,Missing Clock-Outs,Approved PFFD Used\n";
        
        users.forEach(user => {
            let totalRegularHours = 0;
            let missingOuts = 0;

            user.timeLogs.forEach(log => {
                if (log.clockOut) {
                    const hoursWorked = (new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / (1000 * 60 * 60);
                    totalRegularHours += hoursWorked;
                } else {
                    missingOuts++;
                }
            });

            let totalOvertimeHours = 0;
            user.overtimeRequests.forEach(ot => {
                // Parse "HH:mm" strings
                const [startH, startM] = ot.startTime.split(':').map(Number);
                const [endH, endM] = ot.endTime.split(':').map(Number);
                
                let otHours = (endH + (endM / 60)) - (startH + (startM / 60));
                if (otHours < 0) otHours += 24; // Handled cases crossing midnight
                
                // If it spans multiple days, multiply by number of days (usually OT is same day, but just in case)
                const msPerDay = 1000 * 60 * 60 * 24;
                const daysSpanned = Math.ceil((new Date(ot.endDate).getTime() - new Date(ot.startDate).getTime()) / msPerDay) + 1;
                
                totalOvertimeHours += (otHours * daysSpanned);
            });

            csvString += `"${user.name}","${user.email}","${user.icId || ''}","${user.role}","${user.department || ''}","${user.position || ''}","${totalRegularHours.toFixed(2)}","${totalOvertimeHours.toFixed(2)}","${missingOuts}","${user.leaveRequests.length}"\n`;
        });

        csvString += "\n\n";

        // 2. Detailed Daily Logs Section
        csvString += "--- DETAILED DAILY LOGS ---\n";
        csvString += "Employee Name,Role,Department,Date,Clock In,Clock Out,Hours Worked\n";

        users.forEach(user => {
            user.timeLogs.forEach(log => {
                const dateStr = new Date(log.clockIn).toLocaleDateString();
                const clockInStr = new Date(log.clockIn).toLocaleTimeString();
                let clockOutStr = 'MISSING';
                let hoursWorked = 0;

                if (log.clockOut) {
                    clockOutStr = new Date(log.clockOut).toLocaleTimeString();
                    hoursWorked = (new Date(log.clockOut).getTime() - new Date(log.clockIn).getTime()) / (1000 * 60 * 60);
                }

                csvString += `"${user.name}","${user.role}","${user.department || ''}","${dateStr}","${clockInStr}","${clockOutStr}","${hoursWorked > 0 ? hoursWorked.toFixed(2) : 'N/A'}"\n`;
            });
        });

        const filename = startDateParam && endDateParam 
            ? `Master_Payroll_Export_${startDateParam}_to_${endDateParam}.csv` 
            : 'Master_Payroll_Export.csv';

        return new NextResponse(csvString, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
