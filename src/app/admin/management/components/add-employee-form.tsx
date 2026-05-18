"use client";

import { useState } from "react";
import { addEmployee } from "@/app/actions/employees";
import { Loader2 } from "lucide-react";

export function AddEmployeeForm({ onSuccess }: { onSuccess: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await addEmployee(formData);

        if (result.success) {
            onSuccess();
        } else {
            setError(result.error || "Failed to add employee.");
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
                    {error}
                </div>
            )}
            
            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                <input 
                    name="name" 
                    required 
                    className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="Jane Doe" 
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input 
                    name="email" 
                    type="email" 
                    required 
                    className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="jane.doe@company.com" 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">System Role</label>
                    <select 
                        name="role" 
                        className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                    >
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Starting PFFD</label>
                    <input 
                        name="pffdBalance" 
                        type="number" 
                        required 
                        min="0"
                        defaultValue="0"
                        className="w-full bg-background border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button 
                    type="button" 
                    onClick={onSuccess}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {isLoading && <Loader2 className="size-4 animate-spin" />}
                    {isLoading ? "Adding..." : "Add Employee"}
                </button>
            </div>
        </form>
    );
}
