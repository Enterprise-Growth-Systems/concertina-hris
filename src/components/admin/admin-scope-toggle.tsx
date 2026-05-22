"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Users, UserCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminScopeToggleProps {
    role: string;
}

export function AdminScopeToggle({ role }: AdminScopeToggleProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
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

    const handleNavigate = (viewUrl: string) => {
        startTransition(() => {
            router.push(viewUrl);
        });
    };

    return (
        <div className="inline-flex items-center p-1 bg-muted/50 rounded-xl border relative z-50">
            <button
                onClick={() => handleNavigate(getCompanyUrl())}
                disabled={!isDirect || isPending}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    !isDirect
                        ? "bg-background text-foreground shadow-sm pointer-events-none"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
                )}
            >
                {isPending && isDirect ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
                Company Wide
            </button>
            <button
                onClick={() => handleNavigate(getDirectUrl())}
                disabled={isDirect || isPending}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isDirect
                        ? "bg-background text-foreground shadow-sm pointer-events-none"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50"
                )}
            >
                {isPending && !isDirect ? <Loader2 className="size-4 animate-spin" /> : <UserCircle className="size-4" />}
                My Direct Reports
            </button>
        </div>
    );
}
