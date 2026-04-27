"use client";

import { useState } from "react";
import { Menu, X, Clock, LayoutDashboard, CalendarHeart, Users, Settings, History, Megaphone, BookOpen, BookUser, UserCircle, Calendar, CalendarDays, ClipboardList } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { handleSignOut } from "@/app/actions/auth";

const EMP_ROUTES = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Timesheets", href: "/timesheets", icon: Clock },
    { name: "Schedules", href: "/schedule", icon: CalendarDays },
    { name: "PFFD Requests", href: "/leaves", icon: CalendarHeart },
    { name: "Team Directory", href: "/directory", icon: BookUser },
    { name: "Company Holidays", href: "/holidays", icon: Calendar },
    { name: "My Profile", href: "/profile", icon: UserCircle },
];

const ADMIN_ROUTES = [
    { name: "Team Management", href: "/admin/employees", icon: Users },
    { name: "Time Logs", href: "/admin/timesheets", icon: History },
    { name: "Leave Approvals", href: "/admin/leaves", icon: CalendarHeart },
    { name: "Schedules Manager", href: "/admin/schedules", icon: CalendarDays },
    { name: "Holiday Manager", href: "/admin/holidays", icon: Calendar },
    { name: "Reports Dashboard", href: "/admin/reports", icon: ClipboardList },
];

export function AppShell({ user, children }: { user: any, children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const showAdminPanel = user && (user.role === "ADMIN" || user.role === "MANAGER");

    const NavContent = () => (
        <div className="flex flex-col h-full w-full">
            <div className="flex items-center gap-2 pl-2">
                <div className="size-8 shrink-0 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Clock className="size-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl tracking-tight">Concertina HR</span>
            </div>

            <nav className="flex flex-col gap-1 flex-1 mt-8 lg:mt-6 overflow-y-auto pr-2 pb-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                    Main Menu
                </div>
                {EMP_ROUTES.map((route) => {
                    const isActive = pathname === route.href;
                    return (
                        <Link
                            key={route.name}
                            href={route.href}
                            prefetch={true}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <route.icon className="shrink-0 size-4.5" />
                            {route.name}
                        </Link>
                    );
                })}

                {showAdminPanel && (
                    <>
                        <div className="text-xs font-semibold text-muted-foreground mb-2 mt-8 px-2 uppercase tracking-wider">
                            Administration
                        </div>
                        {ADMIN_ROUTES.map((route) => {
                            const isActive = pathname === route.href;
                            return (
                                <Link
                                    key={route.name}
                                    href={route.href}
                                    prefetch={true}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <route.icon className="shrink-0 size-4.5" />
                                    {route.name}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mt-auto shrink-0 hidden lg:block">
                <p className="text-sm font-medium text-foreground">{user?.name || "Employee"}</p>
                <p className="text-xs text-muted-foreground mb-3 truncate max-w-full">{user?.email}</p>
                <form action={handleSignOut}>
                    <button type="submit" className="text-xs font-medium text-destructive hover:text-destructive/80 transition-colors">
                        Sign out
                    </button>
                </form>
            </div>
            {/* Mobile-oriented signout block */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mt-auto shrink-0 lg:hidden mb-4">
                <p className="text-sm font-medium text-foreground">{user?.name || "Employee"}</p>
                <p className="text-xs text-muted-foreground mb-3 truncate max-w-full">{user?.email}</p>
                <form action={handleSignOut}>
                    <button type="submit" className="w-full py-2 bg-destructive/10 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors">
                        Sign out
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <div className="flex w-full min-h-screen">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r bg-card/50 backdrop-blur-md px-4 py-6 gap-8 sticky top-0 h-screen z-20">
                <NavContent />
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="relative w-4/5 max-w-sm bg-card h-full border-r p-6 pb-2 pt-6 flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-left duration-300">
                        <button
                            className="absolute right-4 top-5 p-2 text-muted-foreground hover:bg-muted rounded-md z-10 bg-card"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="size-5" />
                        </button>
                        <NavContent />
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b flex items-center justify-between px-4 bg-card/60 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary rounded-xl flex items-center justify-center shadow-md">
                            <Clock className="size-4 text-primary-foreground" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Concertina HR</span>
                    </div>
                    <button
                        className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu className="size-6" />
                    </button>
                </header>

                <main className="flex-1 p-4 lg:p-8 shrink-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
