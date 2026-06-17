"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/wiki/tiptap-editor";
import { createWikiPage } from "@/app/actions/wiki";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function NewWikiPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const res = await createWikiPage({ title, content });
        
        if (res.success && res.page) {
            router.push(`/wiki/${res.page.slug}`);
            router.refresh();
        } else {
            setError(res.error || "Failed to create page");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col pb-12">
            <Link href="/wiki" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit">
                <ArrowLeft className="size-4" />
                Back to Directory
            </Link>

            <div className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 flex flex-col h-full min-h-[700px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Create New Document</h1>
                        <p className="text-sm text-muted-foreground mt-1">Write a new policy, handbook, or guide.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/wiki" className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            Cancel
                        </Link>
                        <button 
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save & Publish
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-6 flex-1 flex flex-col">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Document Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Employee Code of Conduct"
                            className="w-full p-3 rounded-xl border bg-background focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium"
                        />
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="block text-sm font-semibold text-foreground mb-2">Document Content</label>
                        <div className="flex-1 h-full min-h-[400px]">
                            <TipTapEditor content={content} onChange={setContent} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
