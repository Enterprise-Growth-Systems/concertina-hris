import { getWikiPageBySlug } from "@/app/actions/wiki";
import { notFound } from "next/navigation";
import { FileText, Calendar, User, ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function WikiDocumentPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const { slug } = params;
    
    const session = await auth();
    const isAdmin = session?.user && ["ADMIN", "SUPERADMIN", "MANAGER"].includes((session.user as any).role);
    
    const res = await getWikiPageBySlug(slug);
    if (!res.success || !res.page) {
        notFound();
    }
    
    const page = res.page;

    return (
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col pb-12">
            <Link href="/wiki" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit">
                <ArrowLeft className="size-4" />
                Back to Directory
            </Link>

            <div className="bg-card rounded-3xl border shadow-sm p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b pb-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="size-6" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{page.title}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <User className="size-4" />
                                <span>{page.author.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="size-4" />
                                <span>{format(new Date(page.updatedAt), "MMM d, yyyy")}</span>
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <Link 
                            href={`/admin/wiki/edit/${page.id}`}
                            className="shrink-0 px-4 py-2 bg-muted hover:bg-accent text-foreground text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2 border"
                        >
                            <Edit className="size-4" />
                            Edit Document
                        </Link>
                    )}
                </div>

                <div 
                    className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: page.content || "" }}
                />
            </div>
        </div>
    );
}
