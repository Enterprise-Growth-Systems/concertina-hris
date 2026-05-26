"use client";

import { useState, useMemo } from "react";
import { Plus, UserCog, User, ShieldAlert, Search, Trash2, Loader2 } from "lucide-react";
import { AddEmployeeForm } from "./add-employee-form";
import { deleteEmployee, updateEmployee } from "@/app/actions/employees";
import { Pagination } from "@/components/ui/pagination";

type EmployeeData = {
    id: string;
    name: string;
    email: string;
    role: string;
    leaveBalance: number;
    joined: string;
    contactNumber?: string | null;
    emergencyContact?: string | null;
    address?: string | null;
    department?: string | null;
    position?: string | null;
    icId?: string | null;
    managerId?: string | null;
};

export function EmployeeClientPage({ initialUsers, currentUserRole, managers }: { initialUsers: EmployeeData[], currentUserRole: string, managers: { id: string, name: string }[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;
    
    // Edit Employee State
    const [employeeToEdit, setEmployeeToEdit] = useState<EmployeeData | null>(null);
    const [editRole, setEditRole] = useState<string>("");
    const [editPffdBalance, setEditPffdBalance] = useState<string>("");
    const [editContactNumber, setEditContactNumber] = useState<string>("");
    const [editEmergencyContact, setEditEmergencyContact] = useState<string>("");
    const [editAddress, setEditAddress] = useState<string>("");
    
    // New Employment Details state
    const [editName, setEditName] = useState<string>("");
    const [editEmail, setEditEmail] = useState<string>("");
    const [editDepartment, setEditDepartment] = useState<string>("");
    const [editPosition, setEditPosition] = useState<string>("");
    const [editIcId, setEditIcId] = useState<string>("");
    const [editManagerId, setEditManagerId] = useState<string>("");

    const [isSaving, setIsSaving] = useState(false);

    const filteredUsers = useMemo(() => {
        return initialUsers.filter(user => 
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [initialUsers, searchQuery]);

    // Reset pagination when search changes
    useMemo(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleDelete = async () => {
        if (!employeeToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteEmployee(employeeToDelete.id);
            if (res.success) {
                setEmployeeToDelete(null);
            } else {
                alert(res.error);
            }
        } catch (error) {
            alert("Failed to delete employee.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEditEmployee = async () => {
        if (!employeeToEdit || isNaN(parseFloat(editPffdBalance))) return;
        setIsSaving(true);
        try {
            const res = await updateEmployee(employeeToEdit.id, {
                role: editRole,
                pffdBalance: parseFloat(editPffdBalance),
                contactNumber: editContactNumber,
                emergencyContact: editEmergencyContact,
                address: editAddress,
                name: editName,
                email: editEmail,
                department: editDepartment,
                position: editPosition,
                icId: editIcId,
                managerId: editManagerId || null
            });
            if (res.success) {
                setEmployeeToEdit(null);
            } else {
                alert(res.error);
            }
        } catch (error) {
            alert("Failed to update employee.");
        } finally {
            setIsSaving(false);
        }
    };

    const canEdit = currentUserRole === "ADMIN" || currentUserRole === "MANAGER";

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-sm text-foreground/80 shrink-0">
                        <UserCog className="size-4" />
                        <span>{filteredUsers.length} Team Members</span>
                    </div>
                    
                    <div className="relative w-full sm:w-64 lg:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="size-4 text-muted-foreground" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border text-foreground rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
                        />
                    </div>
                </div>
                
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                >
                    <Plus className="size-4" />
                    Add Employee
                </button>
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold text-center">PFFD Balance</th>
                                <th className="px-6 py-4 font-semibold text-right">Joined</th>
                                <th className="px-6 py-4 font-semibold text-right w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                <span className="font-bold text-xs">{user.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-foreground">{user.name}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            user.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-200' :
                                            user.role === 'MANAGER' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                            'bg-muted text-foreground border-border'
                                        }`}>
                                            {user.role === 'ADMIN' ? <ShieldAlert className="size-3" /> : <User className="size-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-mono font-medium text-emerald-600">
                                            {user.leaveBalance}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-muted-foreground whitespace-nowrap">
                                        {user.joined}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {canEdit && (
                                                <button
                                                    onClick={() => {
                                                        setEmployeeToEdit(user);
                                                        setEditRole(user.role);
                                                        setEditPffdBalance(user.leaveBalance.toString());
                                                        setEditContactNumber(user.contactNumber || "");
                                                        setEditEmergencyContact(user.emergencyContact || "");
                                                        setEditAddress(user.address || "");
                                                        setEditName(user.name);
                                                        setEditEmail(user.email);
                                                        setEditDepartment(user.department || "");
                                                        setEditPosition(user.position || "");
                                                        setEditIcId(user.icId || "");
                                                        setEditManagerId(user.managerId || "");
                                                    }}
                                                    className="p-2 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Edit Employee"
                                                >
                                                    <UserCog className="size-4" />
                                                </button>
                                            )}
                                            {currentUserRole === "ADMIN" && (
                                                <button
                                                    onClick={() => setEmployeeToDelete(user)}
                                                    className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            No employees found matching "{searchQuery}".
                        </div>
                    )}
                </div>
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Add Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" 
                        onClick={() => setIsAddModalOpen(false)}
                    />
                    <div className="relative bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 shrink-0">
                            <h2 className="text-xl font-bold text-foreground">Add New Employee</h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                Enter details and migrate their starting PFFD balance from Sprout. The default password will be <code className="text-foreground bg-muted px-1 rounded">concertina2026</code>.
                            </p>
                        </div>
                        
                        <AddEmployeeForm onSuccess={() => setIsAddModalOpen(false)} />
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {employeeToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" 
                        onClick={() => !isDeleting && setEmployeeToDelete(null)}
                    />
                    <div className="relative bg-card border border-red-200 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 shrink-0">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-50 text-red-600 rounded-full">
                                    <Trash2 className="size-5" />
                                </div>
                                <h2 className="text-xl font-bold text-foreground">Delete Employee</h2>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Are you absolutely sure you want to delete <strong className="text-foreground">{employeeToDelete.name}</strong>?
                            </p>
                            <p className="text-xs text-red-600 mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                This action is destructive. It will permanently delete their account along with all their historical time logs, schedules, and leave requests.
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setEmployeeToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    "Yes, Delete Account"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Employee Modal */}
            {employeeToEdit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in" 
                        onClick={() => !isSaving && setEmployeeToEdit(null)}
                    />
                    <div className="relative bg-card border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 shrink-0">
                            <h2 className="text-xl font-bold text-foreground mb-1">Edit Employee</h2>
                            <p className="text-sm text-muted-foreground">
                                Update details for <strong className="text-foreground">{employeeToEdit.name}</strong>.
                            </p>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            {currentUserRole === "ADMIN" && (
                                <>
                                    <div className="pb-4 mb-4 border-b border-border">
                                        <h3 className="text-sm font-bold text-foreground mb-4">Employment Details</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={editEmail}
                                                    onChange={(e) => setEditEmail(e.target.value)}
                                                    className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                                                    <input
                                                        type="text"
                                                        value={editDepartment}
                                                        onChange={(e) => setEditDepartment(e.target.value)}
                                                        className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-1.5">Position</label>
                                                    <input
                                                        type="text"
                                                        value={editPosition}
                                                        onChange={(e) => setEditPosition(e.target.value)}
                                                        className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-1.5">IC ID</label>
                                                    <input
                                                        type="text"
                                                        value={editIcId}
                                                        onChange={(e) => setEditIcId(e.target.value)}
                                                        className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-1.5">Manager</label>
                                                    <select
                                                        value={editManagerId}
                                                        onChange={(e) => setEditManagerId(e.target.value)}
                                                        className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    >
                                                        <option value="">No Manager</option>
                                                        {managers.filter(m => m.id !== employeeToEdit.id).map(manager => (
                                                            <option key={manager.id} value={manager.id}>{manager.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">User Role</label>
                                        <select
                                            value={editRole}
                                            onChange={(e) => setEditRole(e.target.value)}
                                            className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Contact Number</label>
                                        <input
                                            type="text"
                                            value={editContactNumber}
                                            onChange={(e) => setEditContactNumber(e.target.value)}
                                            className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Emergency Contact</label>
                                        <input
                                            type="text"
                                            value={editEmergencyContact}
                                            onChange={(e) => setEditEmergencyContact(e.target.value)}
                                            className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            placeholder="Name & Number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1.5">Home Address</label>
                                        <textarea
                                            value={editAddress}
                                            onChange={(e) => setEditAddress(e.target.value)}
                                            rows={2}
                                            className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                                            placeholder="123 Example St, City, Country"
                                        />
                                    </div>
                                </>
                            )}
                            <div className="pt-4 mt-2 border-t border-border">
                                <label className="block text-sm font-medium text-foreground mb-1.5">PFFD Balance</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={editPffdBalance}
                                    onChange={(e) => setEditPffdBalance(e.target.value)}
                                    className="w-full bg-background border text-foreground rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="e.g. 5.5"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setEmployeeToEdit(null)}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors border border-transparent disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditEmployee}
                                disabled={isSaving || isNaN(parseFloat(editPffdBalance))}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
