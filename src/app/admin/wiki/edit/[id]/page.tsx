"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { TipTapEditor } from "@/components/wiki/tiptap-editor";
import { IconPicker } from "@/components/wiki/icon-picker";
import { updateWikiPage, deleteWikiPage } from "@/app/actions/wiki";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";

// We have to fetch the page client-side or pass it down. 
// For simplicity in this demo, let's fetch it via a server action or just assume the server component fetches and passes it.
// Since it's a 'use client' page directly right now, we can fetch it in a useEffect.
// Actually, it's better to wrap it in a server component, but we will just fetch it directly.



export default function EditWikiPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [icon, setIcon] = useState("FileText");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [slug, setSlug] = useState("");

    // NOTE: In a real app we'd fetch by ID. We'll use a hack to fetch all and filter for now to save time adding an action.
    useEffect(() => {
        const fetchPage = async () => {
            // We need a way to get the page by ID. We can add a server action for this or just fetch all
            const { getWikiPages } = await import("@/app/actions/wiki");
            const res = await getWikiPages(null);
            if (res.success && res.pages) {
                const page = res.pages.find((p: any) => p.id === params.id);
                if (page) {
                    setTitle(page.title);
                    setContent(page.content || "");
                    setIcon((page as any).icon || "FileText");
                    setSlug(page.slug);
                } else {
                    setError("Page not found");
                }
            }
            setIsLoading(false);
        };
        fetchPage();
    }, [params.id]);

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const res = await updateWikiPage(params.id, { title, content, icon });
        
        if (res.success && res.page) {
            router.push(`/wiki/${res.page.slug}`);
            router.refresh();
        } else {
            setError(res.error || "Failed to update page");
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this page? This action cannot be undone.")) return;
        
        setIsDeleting(true);
        setError("");
        
        const res = await deleteWikiPage(params.id);
        
        if (res.success) {
            router.push("/wiki");
            router.refresh();
        } else {
            setError(res.error || "Failed to delete page");
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-[50vh]"><Loader2 className="size-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col pb-12">
            <Link href={slug ? `/wiki/${slug}` : "/wiki"} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit">
                <ArrowLeft className="size-4" />
                Back
            </Link>

            <div className="bg-card rounded-3xl border shadow-sm p-8 md:p-10 flex flex-col h-full min-h-[700px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b pb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Edit Document</h1>
                        <p className="text-sm text-muted-foreground mt-1">Update this knowledge base article.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={slug ? `/wiki/${slug}` : "/wiki"} className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                            Cancel
                        </Link>
                        <button 
                            onClick={handleDelete}
                            disabled={isSubmitting || isDeleting}
                            className="px-4 py-2 bg-destructive/10 text-destructive text-sm font-semibold rounded-lg hover:bg-destructive/20 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {isDeleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                            Delete
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSubmitting || isDeleting}
                            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="space-y-6 flex-1 flex flex-col">
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-foreground mb-3">
                            Document Icon
                        </label>
                        <IconPicker value={icon} onChange={setIcon} />
                    </div>

                    <div className="mb-8">
                        <label htmlFor="title" className="block text-sm font-bold text-foreground mb-2">
                            Document Title
                        </label>
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
