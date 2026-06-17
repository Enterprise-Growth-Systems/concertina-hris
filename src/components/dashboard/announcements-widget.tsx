import { getAnnouncements } from "@/app/actions/announcements";
import { Megaphone } from "lucide-react";
import { auth } from "@/auth";
import Link from "next/link";
import { AnnouncementsClient } from "./announcements-client";

export async function AnnouncementsWidget() {
    const res = await getAnnouncements();
    const announcements = res.success && res.announcements ? res.announcements : [];
    
    const session = await auth();
    const userRole = session?.user ? session?.user?.role : null;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "MANAGER";

    return (
        <div className="rounded-2xl border bg-card p-5 relative overflow-hidden transition-all shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
                        <Megaphone className="size-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground leading-none">Announcements</h3>
                        <p className="text-xs text-muted-foreground mt-1">Company-wide updates</p>
                    </div>
                </div>
                {isAdmin && (
                    <Link 
                        href="/admin/announcements/new"
                        className="flex items-center gap-1.5 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                    >
                        <Megaphone className="size-3.5" />
                        <span>Post New</span>
                    </Link>
                )}
            </div>

            <AnnouncementsClient announcements={announcements} isAdmin={isAdmin} />
        </div>
    );
}
