"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/app/actions/announcements";
import { TipTapEditor } from "@/components/wiki/tiptap-editor";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import Link from "next/link";

export default function NewAnnouncementPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !content.trim()) {
            setError("Title and content are required.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const res = await createAnnouncement(title, content);
        
        if (res.success) {
            router.push(`/`);
            router.refresh();
        } else {
            setError(res.error || "Failed to create announcement.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/" className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="size-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Post Announcement</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Create a company-wide update for all employees.</p>
                </div>
            </div>

            <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 flex flex-col">
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-bold text-foreground mb-2">
                            Announcement Title
                        </label>
                        <input 
                            type="text" 
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
                            placeholder="e.g. Q3 Townhall Schedule"
                        />
                    </div>

                    <div className="mb-4 flex-1">
                        <label className="block text-sm font-bold text-foreground mb-2">
                            Message Content
                        </label>
                        <div className="border rounded-xl bg-background overflow-hidden">
                            <TipTapEditor 
                                content={content} 
                                onChange={setContent} 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t">
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                            Post Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
