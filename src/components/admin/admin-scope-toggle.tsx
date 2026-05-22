"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminScopeToggleProps {
    role: string;
}

export function AdminScopeToggle({ role }: AdminScopeToggleProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Only ADMIN or SUPERADMIN get the toggle switch
    if (role !== "ADMIN" && role !== "SUPERADMIN") {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
                <UserCircle className="size-4" />
                Direct Reports View
            </div>
        );
    }

    const currentView = searchParams.get("view");
    const isDirect = currentView === "direct";

    // Helper to generate the URL for the 'company' view (removes the 'view' param)
    const getCompanyUrl = () => {
        const params = new URLSearchParams(searchParams);
        params.delete("view");
        return `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    };

    // Helper to generate the URL for the 'direct' view (sets the 'view' param)
    const getDirectUrl = () => {
        const params = new URLSearchParams(searchParams);
        params.set("view", "direct");
        return `${pathname}?${params.toString()}`;
    };

    return (
        <div className="inline-flex items-center p-1 bg-muted/50 rounded-xl border relative z-50">
            <Link
                href={getCompanyUrl()}
                prefetch={false}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    !isDirect
                        ? "bg-background text-foreground shadow-sm pointer-events-none"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <Users className="size-4" />
                Company Wide
            </Link>
            <Link
                href={getDirectUrl()}
                prefetch={false}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isDirect
                        ? "bg-background text-foreground shadow-sm pointer-events-none"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <UserCircle className="size-4" />
                My Direct Reports
            </Link>
        </div>
    );
}
