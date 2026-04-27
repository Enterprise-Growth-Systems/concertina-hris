"use client";

import { useState } from "react";
import { Plus, UserCog, User, ShieldAlert } from "lucide-react";
import { AddEmployeeForm } from "./add-employee-form";

type EmployeeData = {
    id: string;
    name: string;
    email: string;
    role: string;
    leaveBalance: number;
    joined: string;
};

export function EmployeeClientPage({ initialUsers }: { initialUsers: EmployeeData[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm text-slate-300">
                    <UserCog className="size-4" />
                    <span>{initialUsers.length} Team Members</span>
                </div>
                
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-black rounded-lg hover:bg-slate-200 transition-colors shadow-sm"
                >
                    <Plus className="size-4" />
                    Add Employee
                </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#11131A] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold text-center">PFFD Balance</th>
                                <th className="px-6 py-4 font-semibold text-right">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {initialUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            user.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-slate-800 text-slate-300 border-slate-700'
                                        }`}>
                                            {user.role === 'ADMIN' ? <ShieldAlert className="size-3" /> : <User className="size-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-mono font-medium text-emerald-400">
                                            {user.leaveBalance}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 whitespace-nowrap">
                                        {user.joined}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" 
                        onClick={() => setIsAddModalOpen(false)}
                    />
                    <div className="relative bg-[#11131A] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">Add New Employee</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Enter details and migrate their starting PFFD balance from Sprout. The default password will be <code className="text-slate-300 bg-slate-800 px-1 rounded">concertina2026</code>.
                            </p>
                        </div>
                        
                        <AddEmployeeForm onSuccess={() => setIsAddModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
