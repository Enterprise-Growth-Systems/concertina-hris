"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Users, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminScopeToggleProps {
    role: string;
}

export function AdminScopeToggle({ role }: AdminScopeToggleProps) {
    const router = useRouter();
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

    const setView = (view: "company" | "direct") => {
        const params = new URLSearchParams(searchParams);
        if (view === "direct") {
            params.set("view", "direct");
        } else {
            params.delete("view");
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="inline-flex items-center p-1 bg-muted/50 rounded-xl border">
            <button
                onClick={() => setView("company")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    !isDirect
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <Users className="size-4" />
                Company Wide
            </button>
            <button
                onClick={() => setView("direct")}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isDirect
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
            >
                <UserCircle className="size-4" />
                My Direct Reports
            </button>
        </div>
    );
}
