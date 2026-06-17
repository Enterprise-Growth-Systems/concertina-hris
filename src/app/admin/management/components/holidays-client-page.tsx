"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, Loader2, Users } from "lucide-react";
import { createHoliday, deleteHoliday, createAssignedHoliday, deleteAssignedHoliday } from "@/app/actions/holidays";

type Holiday = { id: string, name: string, date: Date, type: string, description: string | null };
type AssignedHoliday = { id: string, name: string, date: Date, description: string | null, user: { name: string, email: string } };
type User = { id: string, name: string, email: string };

export function HolidayManagerClient({ 
    globalHolidays, 
    assignedHolidays,
    users 
}: { 
    globalHolidays: Holiday[], 
    assignedHolidays: AssignedHoliday[],
    users: User[] 
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [assignmentType, setAssignmentType] = useState<"GLOBAL" | "ASSIGNED">("GLOBAL");
    
    // Form State
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState("REGULAR");
    const [description, setDescription] = useState("");
    const [selectedUserId, setSelectedUserId] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("date", date);
            if (description) formData.append("description", description);

            if (assignmentType === "GLOBAL") {
                formData.append("type", type);
                await createHoliday(formData);
            } else {
                if (!selectedUserId) {
                    alert("Please select an employee.");
                    return;
                }
                formData.append("userId", selectedUserId);
                await createAssignedHoliday(formData);
            }

            // Reset form
            setName(""); setDate(""); setDescription("");
        } catch {
            alert("Failed to create holiday.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteGlobal = async (id: string) => {
        await deleteHoliday(id);
    };

    const handleDeleteAssigned = async (id: string) => {
        await deleteAssignedHoliday(id);
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 sticky top-24">
                    <h2 className="font-semibold text-xl mb-4">Add Holiday</h2>
                    
                    <div className="flex bg-muted p-1 rounded-lg mb-6">
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentType === 'GLOBAL' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => setAssignmentType('GLOBAL')}
                        >
                            Global
                        </button>
                        <button
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${assignmentType === 'ASSIGNED' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => setAssignmentType('ASSIGNED')}
                        >
                            Assigned
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {assignmentType === "ASSIGNED" && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Assign To Employee</label>
                                <select
                                    required
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full bg-background border text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="">Select an employee...</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Holiday Name</label>
                            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Year's Day" className="w-full bg-background border text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Date</label>
                            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50" />
                        </div>

                        {assignmentType === "GLOBAL" && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Holiday Type</label>
                                <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 appearance-none">
                                    <option value="REGULAR">Regular Holiday</option>
                                    <option value="SPECIAL_NON_WORKING">Special Non-Working Holiday</option>
                                    <option value="COMPANY_OBSERVED">Company Observed</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Description <span className="text-xs text-muted-foreground">(Optional)</span></label>
                            <textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-background border text-foreground rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Additional details..." />
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Create Holiday"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 space-y-8">
                {/* Global Holidays */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-card/50">
                        <h2 className="font-semibold text-xl">Global Holidays</h2>
                        <div className="flex items-center gap-2 text-primary font-medium bg-primary/10 px-3 py-1.5 rounded-full text-sm">
                            <Calendar className="size-4" />
                            Everyone
                        </div>
                    </div>
                    <div className="divide-y divide-border">
                        {globalHolidays.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No global holidays entered yet.</div>
                        ) : (
                            globalHolidays.map((holiday) => (
                                <div key={holiday.id} className="p-6 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-muted border rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[5rem] shadow-sm">
                                            <span className="text-xs font-bold uppercase text-primary mb-1 tracking-widest">{format(holiday.date, "MMM")}</span>
                                            <span className="text-2xl font-bold text-foreground leading-none">{format(holiday.date, "d")}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{holiday.name}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-muted border mt-1">
                                                {holiday.type.replace(/_/g, " ")}
                                            </span>
                                            {holiday.description && <p className="text-sm text-muted-foreground mt-2">{holiday.description}</p>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteGlobal(holiday.id)} className="px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive rounded-md hover:bg-destructive hover:text-white transition-colors">
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Assigned Holidays */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex justify-between items-center bg-card/50">
                        <h2 className="font-semibold text-xl">Assigned Holidays</h2>
                        <div className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full text-sm">
                            <Users className="size-4" />
                            Specific Employees
                        </div>
                    </div>
                    <div className="divide-y divide-border">
                        {assignedHolidays.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No assigned holidays entered yet.</div>
                        ) : (
                            assignedHolidays.map((holiday) => (
                                <div key={holiday.id} className="p-6 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-muted border rounded-xl px-4 py-3 flex flex-col items-center justify-center min-w-[5rem] shadow-sm">
                                            <span className="text-xs font-bold uppercase text-emerald-600 mb-1 tracking-widest">{format(holiday.date, "MMM")}</span>
                                            <span className="text-2xl font-bold text-foreground leading-none">{format(holiday.date, "d")}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{holiday.name}</h3>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 mt-1">
                                                {holiday.user.name}
                                            </span>
                                            {holiday.description && <p className="text-sm text-muted-foreground mt-2">{holiday.description}</p>}
                                        </div>
                                    </div>
                                    <button onClick={() => handleDeleteAssigned(holiday.id)} className="px-3 py-1.5 text-xs font-semibold text-destructive border border-destructive rounded-md hover:bg-destructive hover:text-white transition-colors">
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
