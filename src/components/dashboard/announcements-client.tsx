"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { X, Trash2, Loader2 } from "lucide-react";
import { deleteAnnouncement } from "@/app/actions/announcements";

export function AnnouncementsClient({ announcements: initialAnnouncements, isAdmin }: { announcements: any[], isAdmin?: boolean }) {
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setAnnouncements(initialAnnouncements);
    }, [initialAnnouncements]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (selectedAnnouncement) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => { document.body.style.overflow = "auto"; };
    }, [selectedAnnouncement]);

    if (announcements.length === 0) {
        return (
            <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed">
                <p className="text-sm font-medium text-muted-foreground">No recent announcements.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {announcements.map((a: any) => (
                    <div 
                        key={a.id} 
                        onClick={() => setSelectedAnnouncement(a)}
                        className="p-4 bg-muted/20 border rounded-xl hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-sm text-foreground line-clamp-1">{a.title}</h4>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold whitespace-nowrap ml-2">
                                {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2 prose-sm prose-p:my-0">
                            <div dangerouslySetInnerHTML={{ __html: a.content }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t font-medium">
                            Posted by {a.author?.name || "Admin"}
                        </p>
                    </div>
                ))}
            </div>

            {selectedAnnouncement && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div 
                        className="absolute inset-0" 
                        onClick={() => setSelectedAnnouncement(null)} 
                    />
                    <div className="relative z-10 w-full max-w-2xl bg-card rounded-2xl border shadow-xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between p-6 border-b shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground leading-tight">{selectedAnnouncement.title}</h2>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">
                                    Posted by {selectedAnnouncement.author?.name || "Admin"} • {formatDistanceToNow(new Date(selectedAnnouncement.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <button 
                                        onClick={async () => {
                                            if (confirm("Are you sure you want to delete this announcement?")) {
                                                setIsDeleting(true);
                                                const res = await deleteAnnouncement(selectedAnnouncement.id);
                                                setIsDeleting(false);
                                                if (res.success) {
                                                    setAnnouncements(announcements.filter((a: any) => a.id !== selectedAnnouncement.id));
                                                    setSelectedAnnouncement(null);
                                                } else {
                                                    alert("Failed to delete: " + res.error);
                                                }
                                            }
                                        }}
                                        disabled={isDeleting}
                                        className="p-2 -mt-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors disabled:opacity-50 flex items-center justify-center"
                                        title="Delete Announcement"
                                    >
                                        {isDeleting ? <Loader2 className="size-5 animate-spin" /> : <Trash2 className="size-5" />}
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedAnnouncement(null)}
                                    className="p-2 -mr-2 -mt-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-a:text-primary">
                                <div dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
