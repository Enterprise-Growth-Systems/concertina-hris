import { getWikiPages } from "@/app/actions/wiki";
import { BookOpen, FolderOpen, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function WikiDirectoryPage() {
    const session = await auth();
    const isAdmin = session?.user && ["ADMIN", "SUPERADMIN", "MANAGER"].includes((session.user as any).role);
    
    const res = await getWikiPages(null);
    const pages = res.success && res.pages ? res.pages : [];

    return (
        <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-sm font-bold text-primary mb-1 tracking-widest uppercase">KNOWLEDGE BASE</h2>
                    <h1 className="text-3xl font-bold text-foreground">Company Wiki</h1>
                </div>
                {isAdmin && (
                    <Link 
                        href="/admin/wiki/new" 
                        className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                        <FileText className="size-4" />
                        Create Document
                    </Link>
                )}
            </div>

            <div className="bg-card rounded-2xl border shadow-sm flex-1 p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b">
                    <BookOpen className="size-6 text-primary" />
                    <h3 className="font-semibold text-lg">Directory</h3>
                </div>

                {pages.length === 0 ? (
                    <div className="py-16 text-center bg-muted/20 rounded-xl border border-dashed flex flex-col items-center justify-center">
                        <FolderOpen className="size-12 text-muted-foreground/30 mb-4" />
                        <h4 className="font-semibold text-foreground mb-1">No Documents Found</h4>
                        <p className="text-sm text-muted-foreground">
                            {isAdmin ? "Click 'Create Document' to add your first policy or handbook." : "The knowledge base is currently empty."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pages.map((page: any) => (
                            <Link key={page.id} href={`/wiki/${page.slug}`}>
                                <div className="group border rounded-xl p-5 hover:border-primary hover:shadow-md transition-all cursor-pointer bg-background">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <FileText className="size-5" />
                                        </div>
                                        <ChevronRight className="size-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{page.title}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {page._count.children > 0 ? `${page._count.children} sub-pages` : "Document"}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
