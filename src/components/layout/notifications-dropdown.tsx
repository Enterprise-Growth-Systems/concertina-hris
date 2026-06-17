"use client";

import { useState, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/app/actions/notifications";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type NotificationType = {
    id: string;
    title: string;
    message: string;
    href: string | null;
    readAt: Date | null;
    createdAt: Date;
};

export function NotificationsDropdown() {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    
    useEffect(() => {
        const fetchNotifs = async () => {
            const res = await getNotifications();
            if (res.success && res.notifications) {
                setNotifications(res.notifications as any);
            }
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.readAt).length;

    const handleMarkAllAsRead = async () => {
        const res = await markAllNotificationsAsRead();
        if (res.success) {
            setNotifications(notifications.map(n => ({ ...n, readAt: new Date() })));
        }
    };

    const handleNotificationClick = async (id: string, readAt: Date | null) => {
        if (!readAt) {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date() } : n));
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-destructive" />
                )}
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl shadow-lg border z-50 overflow-hidden flex flex-col max-h-[400px]">
                        <div className="p-3 border-b flex items-center justify-between bg-muted/30">
                            <h3 className="font-semibold text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    <Check className="h-3 w-3" />
                                    Mark all read
                                </button>
                            )}
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No new notifications.
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((n) => (
                                        <div 
                                            key={n.id} 
                                            className={`p-3 border-b last:border-0 hover:bg-accent transition-colors ${!n.readAt ? 'bg-primary/5' : ''}`}
                                            onClick={() => handleNotificationClick(n.id, n.readAt)}
                                        >
                                            {n.href ? (
                                                <Link href={n.href}>
                                                    <div className="flex flex-col gap-1 cursor-pointer">
                                                        <h4 className="text-sm font-semibold text-foreground">{n.title}</h4>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                                        <span className="text-[10px] text-muted-foreground mt-1">
                                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </Link>
                                            ) : (
                                                <div className="flex flex-col gap-1">
                                                    <h4 className="text-sm font-semibold text-foreground">{n.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                                    <span className="text-[10px] text-muted-foreground mt-1">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
