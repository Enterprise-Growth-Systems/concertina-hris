import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-card/50">
            <div className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{currentPage}</span> of <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-background text-foreground"
                    aria-label="Previous Page"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-background text-foreground"
                    aria-label="Next Page"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </div>
    );
}
