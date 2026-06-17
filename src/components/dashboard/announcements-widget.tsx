import { getAnnouncements } from "@/app/actions/announcements";
import { Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { auth } from "@/auth";
import Link from "next/link";

export async function AnnouncementsWidget() {
    const res = await getAnnouncements();
    const announcements = res.success && res.announcements ? res.announcements : [];
    
    const session = await auth();
    const userRole = session?.user ? (session.user as any).role : null;
    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN" || userRole === "MANAGER";

    return (
        <div className="rounded-2xl border bg-card p-5 relative overflow-hidden transition-all shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-600">
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
                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-3 py-1.5 rounded-md"
                    >
                        <span>Post New</span>
                    </Link>
                )}
            </div>

            {announcements.length === 0 ? (
                <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed">
                    <p className="text-sm font-medium text-muted-foreground">No recent announcements.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((a: any) => (
                        <div key={a.id} className="p-4 bg-muted/20 border rounded-xl hover:bg-muted/40 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-sm text-foreground">{a.title}</h4>
                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{a.content}</p>
                            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t font-medium">Posted by {a.author?.name || "Admin"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
