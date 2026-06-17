"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function AnnouncementsClient({ announcements }: { announcements: any[] }) {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

    if (announcements.length === 0) {
        return (
            <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed">
                <p className="text-sm font-medium text-muted-foreground">No recent announcements.</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                        {/* We use line-clamp to limit the preview snippet */}
                        <div className="text-sm text-muted-foreground line-clamp-2 prose-sm prose-p:my-0">
                            {/* If it contains HTML, we strip it for the preview, or just render it safely with line-clamp */}
                            <div dangerouslySetInnerHTML={{ __html: a.content }} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t font-medium">
                            Posted by {a.author?.name || "Admin"}
                        </p>
                    </div>
                ))}
            </div>

            <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {selectedAnnouncement && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">{selectedAnnouncement.title}</DialogTitle>
                                <DialogDescription className="text-xs font-semibold uppercase tracking-wider mt-2">
                                    Posted by {selectedAnnouncement.author?.name || "Admin"} • {formatDistanceToNow(new Date(selectedAnnouncement.createdAt), { addSuffix: true })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="mt-6 prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:text-foreground prose-headings:text-foreground prose-a:text-primary">
                                <div dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }} />
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
