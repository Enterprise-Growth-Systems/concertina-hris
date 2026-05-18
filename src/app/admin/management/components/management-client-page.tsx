"use client";

import { useState } from "react";
import { Users, CalendarDays, Calendar } from "lucide-react";

import { EmployeeClientPage } from "./team-client-page";
import { ScheduleClientPage } from "./schedules-client-page";
import { HolidayManagerClient } from "./holidays-client-page";

type TeamDataProps = {
    initialUsers: any[];
    currentUserRole: string;
    managers: any[];
};

type ScheduleDataProps = {
    initialUsers: any[];
};

type HolidayDataProps = {
    globalHolidays: any[];
    assignedHolidays: any[];
    users: any[];
};

export function ManagementClientPage({ 
    teamData,
    scheduleData,
    holidayData
}: { 
    teamData: TeamDataProps;
    scheduleData: ScheduleDataProps;
    holidayData: HolidayDataProps;
}) {
    const [activeTab, setActiveTab] = useState<"TEAM" | "SCHEDULES" | "HOLIDAYS">("TEAM");

    return (
        <div className="space-y-6">
            <div className="flex border-b border-border mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("TEAM")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === "TEAM" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        Team Management
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("SCHEDULES")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === "SCHEDULES" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <CalendarDays className="size-4" />
                        Schedules Manager
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("HOLIDAYS")}
                    className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${
                        activeTab === "HOLIDAYS" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        Holiday Manager
                    </div>
                </button>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                {activeTab === "TEAM" && (
                    <EmployeeClientPage 
                        initialUsers={teamData.initialUsers}
                        currentUserRole={teamData.currentUserRole}
                        managers={teamData.managers}
                    />
                )}
                {activeTab === "SCHEDULES" && (
                    <ScheduleClientPage 
                        initialUsers={scheduleData.initialUsers}
                    />
                )}
                {activeTab === "HOLIDAYS" && (
                    <HolidayManagerClient 
                        globalHolidays={holidayData.globalHolidays}
                        assignedHolidays={holidayData.assignedHolidays}
                        users={holidayData.users}
                    />
                )}
            </div>
        </div>
    );
}
