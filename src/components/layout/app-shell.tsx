"use client";

import { useState } from "react";
import { Menu, X, Clock, LayoutDashboard, CalendarHeart, Users, History, UserCircle, ClipboardList, ClipboardCheck, BookOpen } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { handleSignOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
const EMP_ROUTES = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Timesheets", href: "/timesheets", icon: Clock },
    { name: "Requests", href: "/requests", icon: CalendarHeart },
    { name: "Wiki", href: "/wiki", icon: BookOpen },
    { name: "My Profile", href: "/profile", icon: UserCircle },
];

const ADMIN_ROUTES = [
    { name: "Management", href: "/admin/management", icon: Users },
    { name: "Time Logs", href: "/admin/timesheets", icon: History },
    { name: "Approvals", href: "/admin/approvals", icon: ClipboardCheck },
    { name: "Reports Dashboard", href: "/admin/reports", icon: ClipboardList },
];

function NavContent({ user, pathname, setIsMobileMenuOpen, showAdminPanel }: any) {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-col gap-1 pl-2 mb-4">
                <Image 
                    src="/egs-logo.png" 
                    alt="EGS Logo" 
                    width={100} 
                    height={40} 
                    className="object-contain mb-2"
                />
            </div>

            <nav className="flex flex-col gap-1 flex-1 mt-4 lg:mt-2 overflow-y-auto pr-2 pb-4">
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

            <div className="rounded-xl p-3 mt-auto shrink-0 hidden lg:flex flex-col gap-3 bg-muted/30 border border-transparent hover:border-border transition-colors">
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                        <span className="text-sm font-bold text-primary uppercase">{user?.name?.charAt(0) || "E"}</span>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                            {user?.name || "Employee"} 
                            {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && !(user?.name || "").toLowerCase().includes("admin") ? " (Admin)" : ""}
                        </p>
                    </div>
                </div>
                <form action={handleSignOut} className="w-full">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-2 bg-background hover:bg-destructive hover:text-white text-muted-foreground text-xs font-medium rounded-lg border shadow-sm transition-all duration-200">
                        Sign out
                    </button>
                </form>
            </div>
            {/* Mobile-oriented signout block */}
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mt-auto shrink-0 lg:hidden mb-4">
                <p className="text-sm font-medium text-foreground">{user?.name || "Employee"}</p>
                <div className="flex items-center justify-between w-full mt-2">
                    <form action={handleSignOut} className="flex-1">
                        <button type="submit" className="w-full py-2 bg-destructive/10 rounded-md text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors">
                            Sign out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function AppShell({ user, children }: { user: any, children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const showAdminPanel = user && (user.role === "ADMIN" || user.role === "MANAGER");

    return (
        <div className="flex w-full min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col px-4 py-6 gap-8 sticky top-0 h-screen z-20">
                <NavContent user={user} pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} showAdminPanel={showAdminPanel} />
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
                        <NavContent user={user} pathname={pathname} setIsMobileMenuOpen={setIsMobileMenuOpen} showAdminPanel={showAdminPanel} />
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

                <main className="flex-1 p-4 lg:p-6 lg:pl-0 shrink-0 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Breadcrumbs />
                        <div className="flex items-center gap-2">
                            <NotificationsDropdown />
                            <ThemeToggle />
                        </div>
                    </div>
                    <div className="bg-card rounded-2xl border shadow-sm w-full flex-1 p-6 relative overflow-hidden">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
