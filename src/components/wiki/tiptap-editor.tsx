"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, Strikethrough, List, ListOrdered, Quote, Heading2 } from "lucide-react";

interface TipTapEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10 rounded-t-xl">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <Bold className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <Italic className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('strike') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <Strikethrough className="size-4" />
            </button>
            
            <div className="w-px h-6 bg-border mx-1" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <Heading2 className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <List className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <ListOrdered className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-md hover:bg-muted transition-colors ${editor.isActive('blockquote') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
            >
                <Quote className="size-4" />
            </button>
        </div>
    );
};

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing your policy or handbook here...',
            }),
        ],
        content: content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="border rounded-xl bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-primary transition-all">
            <MenuBar editor={editor} />
            <div className="max-h-[600px] overflow-y-auto">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
