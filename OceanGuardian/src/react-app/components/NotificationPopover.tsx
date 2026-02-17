import { useEffect, useState } from "react";
import { Button } from "@/react-app/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/react-app/components/ui/popover";
import { Bell, MessageSquare, ThumbsUp, UserPlus, Info, type LucideIcon } from "lucide-react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";

interface Notification {
    id: number;
    user_id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean | 0 | 1; // SQLite can serialize booleans as 0/1
    related_id?: number;
    created_at: string;
}

const notificationIcons: Record<string, LucideIcon> = {
    comment: MessageSquare,
    validation: ThumbsUp,
    follow: UserPlus,
    system: Info,
};

export default function NotificationPopover() {
    const { profile: user } = useUserProfile();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll for notifications every minute
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications?limit=20");
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                // SQLite returns 0/1 for booleans usually, but check
                const unread = data.filter((n: Notification) => n.is_read === false || n.is_read === 0).length;
                setUnreadCount(unread);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const markAsRead = async (id: number) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await fetch(`/api/notifications/${id}/read`, { method: "POST" });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);

        try {
            await fetch("/api/notifications/read-all", { method: "POST" });
        } catch (error) {
            console.error("Failed to mark all read", error);
        }
    };

    if (!user) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-background animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="xs" onClick={markAllRead} className="h-auto px-2 py-1 text-xs">
                            Mark all read
                        </Button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-xs">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const Icon = notificationIcons[notification.type] || Info;
                            const isUnread = notification.is_read === false || notification.is_read === 0;

                            return (
                                <button
                                    type="button"
                                    key={notification.id}
                                    className={`flex w-full gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors text-left ${isUnread ? "bg-muted/20" : ""}`}
                                    onClick={() => isUnread && markAsRead(notification.id)}
                                >
                                    <div className={`mt-1 p-1.5 rounded-full ${isUnread ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm ${isUnread ? "font-semibold" : "text-foreground"}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {new Date(notification.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    {isUnread && (
                                        <div className="self-center">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
