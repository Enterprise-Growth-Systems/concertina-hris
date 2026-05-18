"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { upsertSchedule, upsertSpecialSchedule, deleteSpecialSchedule } from "@/app/actions/schedules";
import { Pagination } from "@/components/ui/pagination";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function ScheduleClientPage({ initialUsers }: { initialUsers: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const filteredUsers = useMemo(() => {
        return initialUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [initialUsers, searchQuery]);

    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border text-sm text-muted-foreground shrink-0">
                    <span>{filteredUsers.length} Users Found</span>
                </div>
                
                <div className="relative w-full sm:w-64 lg:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="size-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search employees by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border text-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                    />
                </div>
            </div>

            <div className="space-y-8 min-h-[400px]">
                {paginatedUsers.map((user: any) => (
                    <div key={user.id} className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-muted/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                            <div>
                                <h2 className="font-semibold text-xl text-foreground">{user.name}</h2>
                                <p className="text-sm text-muted-foreground">{user.email} • {user.role}</p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-card">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {DAYS.map((dayName, index) => {
                                const existingSchedule = user.schedules.find((s: any) => s.dayOfWeek === index);
                                
                                return (
                                <div key={dayName} className="bg-background border rounded-lg p-3 shadow-sm">
                                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 text-center">
                                    {dayName}
                                    </div>
                                    
                                    <form action={async (formData) => {
                                        await upsertSchedule(
                                            user.id,
                                            index, 
                                            formData.get("startTime") as string, 
                                            formData.get("endTime") as string
                                        );
                                    }} className="space-y-2">
                                        <div>
                                            <input 
                                                type="time" 
                                                name="startTime" 
                                                defaultValue={existingSchedule?.startTime || ""}
                                                className="w-full bg-background border text-foreground rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="text-center text-muted-foreground text-[10px] leading-none">to</div>
                                        <div>
                                            <input 
                                                type="time" 
                                                name="endTime" 
                                                defaultValue={existingSchedule?.endTime || ""}
                                                className="w-full bg-background border text-foreground rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                        <SubmitButton variant="default" className="w-full h-7 text-[10px] mt-2 py-0 px-0">
                                            {existingSchedule ? 'Update' : 'Set'}
                                        </SubmitButton>
                                    </form>
                                </div>
                                );
                            })}
                            </div>
                        </div>

                        <div className="p-4 border-t bg-muted/20">
                            <h3 className="text-sm font-semibold mb-3 text-foreground">Special Schedule Override</h3>
                            <p className="text-xs text-muted-foreground mb-4">Set a specific shift for a single date (e.g., overriding a holiday or weekend).</p>
                            
                            <form action={async (formData) => {
                                await upsertSpecialSchedule(
                                    user.id,
                                    formData.get("date") as string,
                                    formData.get("startTime") as string,
                                    formData.get("endTime") as string,
                                    formData.get("reason") as string
                                );
                            }} className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="flex-1 w-full sm:w-auto">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Date</label>
                                    <input type="date" name="date" required className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="w-full sm:w-32">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Start Time</label>
                                    <input type="time" name="startTime" required className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="w-full sm:w-32">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">End Time</label>
                                    <input type="time" name="endTime" required className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="flex-1 w-full sm:w-auto">
                                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Reason (Optional)</label>
                                    <input type="text" name="reason" placeholder="e.g. Weekend OT" className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <SubmitButton variant="default" className="w-full sm:w-24">
                                    Add
                                </SubmitButton>
                            </form>

                            {user.specialSchedules && user.specialSchedules.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-widest">Active Overrides</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.specialSchedules.map((ss: any) => (
                                            <div key={ss.id} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3 py-1.5 rounded-md text-xs font-medium">
                                                <span>{new Date(ss.date).toLocaleDateString()}: {ss.startTime}-{ss.endTime} {ss.reason ? `(${ss.reason})` : ''}</span>
                                                <button onClick={() => deleteSpecialSchedule(ss.id)} className="hover:text-destructive transition-colors ml-1">
                                                    <X className="size-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {paginatedUsers.length === 0 && (
                    <div className="text-center text-muted-foreground py-12 bg-card rounded-2xl border">
                        No employees found matching "{searchQuery}".
                    </div>
                )}
                
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
