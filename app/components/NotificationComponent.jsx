"use client";
import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { BellRing, CheckCheck, Sparkles, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NotificationComponent({ userId, notifications, onNotificationUpdate }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleMarkAllAsRead = async () => {
        if (!userId || notifications.length === 0) return;

        setIsPressed(true);
        setIsCompleted(true);

        setTimeout(() => {
            setIsPressed(false);
        }, 150);

        setTimeout(() => {
            setIsCompleted(false);
        }, 2000);

        try {
            // Mark all notifications as read via API
            const promises = notifications.map(notification =>
                fetch(`/api/notifications`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: notification.id, userId, isRead: true }),
                })
            );

            await Promise.all(promises);
            onNotificationUpdate([]);

        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: notificationId, userId }),
            });

            if (response.ok) {
                const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
                onNotificationUpdate(updatedNotifications);
            } else {
                const errorData = await response.json();
                console.error('Error deleting notification:', errorData.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/notifications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: notificationId, userId, isRead: true }),
            });
            if (response.ok) {
                const updated = notifications.filter(n => n.id !== notificationId);
                onNotificationUpdate(updated);
            } else {
                const errorData = await response.json();
                console.error('Error marking notification as read:', errorData.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const unreadCount = notifications.length;

    return (
        <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
                <button
                    className="relative p-1.5 -2 cursor-pointer border text-blue-600 shadow-2xl hover:text-black hover:bg-gray-100 rounded-lg transition-colors z-50"
                >
                    <BellRing className="h-6 w-6" />
                    {/* Notification badge */}
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] cursor-pointer rounded-l-3xl flex flex-col"
                closeClassName="cursor-pointer" 
            >
                <SheetHeader className="flex-shrink-0">
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>
                        Stay updated with your latest activities
                    </SheetDescription>
                </SheetHeader>

                {/* Scrollable notifications container */}
                <div className="flex-1 overflow-y-auto space-y-4 px-4 -mt-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <BellRing className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                            <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="group relative p-4 rounded-lg border transition-all duration-200 bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer"
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 pr-8">
                                        <div className="flex items-center gap-3 mb-2">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium">
                                                    {notification.actorUsername ? notification.actorUsername[0].toUpperCase() : '?'}
                                                </div>
                                            </div>
                                            <h4 className="font-medium text-blue-900">
                                                <span className="font-bold">@{notification.actorUsername}</span>{' '}
                                                {notification.actionType === 'comment' ? 'commented on your post' : 'sent you a message'}
                                            </h4>
                                        </div>

                                        <p className="text-sm mt-1 text-blue-700 ml-11">
                                            {notification.contextSnippet}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2 ml-11">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>

                                    {/* Post Image for Comments */}
                                    {notification.actionType === 'comment' && notification.postImage && (
                                        <div className="flex-shrink-0 mr-8">
                                            <img
                                                src={notification.postImage}
                                                alt="Post thumbnail"
                                                className="w-12 h-12 object-cover rounded-md"
                                            />
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNotification(notification.id);
                                        }}
                                        className="absolute top-3 right-3 p-1 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer hover:bg-red-100 hover:text-red-600 text-gray-400 transition-all duration-200"
                                        aria-label="Delete notification"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Fixed bottom button */}
                {notifications.length > 0 && (
                    <div className="flex-shrink-0 pt-2 pb-2 px-4 rounded-2xl border-t bg-white">
                        <div className="flex items-center justify-center p-2">
                            <button
                                onClick={handleMarkAllAsRead}
                                className={`
                  relative group w-64 h-12 cursor-pointer
                  bg-white
                 
                  text-blue-600 font-semibold text-sm
                  rounded-xl
                  transition-all duration-200 ease-out
                  transform-gpu
                  ${isPressed
                                        ? "translate-y-1 shadow-lg"
                                        : "translate-y-0 shadow-2xl hover:shadow-3xl hover:-translate-y-0.5"
                                    }
                  ${isCompleted ? "scale-105" : "scale-100 hover:scale-102"}
                  before:absolute before:inset-0 before:rounded-xl
                  before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-transparent
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
                  after:absolute after:inset-0 after:rounded-xl
                  after:shadow-inner after:shadow-blue-900/20
                  overflow-hidden
                `}
                                style={{
                                    boxShadow: isPressed
                                        ? "0 4px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)"
                                        : "0 8px 25px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
                                }}
                            >
                                {/* Shine effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                                {/* Button content */}
                                <div className="relative z-10 flex items-center justify-center gap-2 px-6 py-4">
                                    {isCompleted ? (
                                        <>
                                            <CheckCheck className="w-5 h-5 text-green-300" />
                                            <span>All marked as read!</span>
                                            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                                        </>
                                    ) : (
                                        <>
                                            <CheckCheck className="w-5 h-5 transition-transform group-hover:scale-110" />
                                            <span>Mark all as read</span>
                                        </>
                                    )}
                                </div>

                                {/* Bottom edge highlight */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent" />

                                {/* Success ripple effect */}
                                {isCompleted && (
                                    <div className="absolute inset-0 rounded-xl bg-green-400/20 animate-ping" />
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}