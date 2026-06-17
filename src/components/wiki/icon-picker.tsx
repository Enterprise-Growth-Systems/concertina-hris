"use client";

import { FileText, Book, Shield, Globe, Lock, Monitor, Users, Briefcase, FileCode, CheckCircle, Lightbulb, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIKI_ICONS = [
    { id: "FileText", icon: FileText, label: "Document" },
    { id: "Book", icon: Book, label: "Handbook" },
    { id: "Shield", icon: Shield, label: "Policy" },
    { id: "Globe", icon: Globe, label: "Public" },
    { id: "Lock", icon: Lock, label: "Private" },
    { id: "Monitor", icon: Monitor, label: "IT" },
    { id: "Users", icon: Users, label: "Team" },
    { id: "Briefcase", icon: Briefcase, label: "Business" },
    { id: "FileCode", icon: FileCode, label: "Tech" },
    { id: "CheckCircle", icon: CheckCircle, label: "Guidelines" },
    { id: "Lightbulb", icon: Lightbulb, label: "Idea" },
    { id: "FolderOpen", icon: FolderOpen, label: "Folder" },
];

export function DynamicIcon({ name, className }: { name: string; className?: string }) {
    const IconData = WIKI_ICONS.find((i) => i.id === name);
    const IconComponent = IconData ? IconData.icon : FileText;
    return <IconComponent className={className} />;
}

interface IconPickerProps {
    value: string;
    onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {WIKI_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = value === item.id;
                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onChange(item.id)}
                        className={cn(
                            "flex flex-col items-center justify-center p-3 rounded-xl border transition-all w-20 h-20 gap-2",
                            isSelected 
                                ? "bg-primary/10 border-primary text-primary shadow-sm" 
                                : "bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                        title={item.label}
                    >
                        <IconComponent className="size-6" />
                        <span className="text-[10px] font-semibold tracking-tight">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
