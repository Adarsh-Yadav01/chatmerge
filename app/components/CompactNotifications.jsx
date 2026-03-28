"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Compact Notifications Component for dropdown
function CompactNotifications({ userId, notifications, onNotificationUpdate }) {
  const [loading, setLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-medium">No new notifications</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
          onClick={() => markAsRead(notification.id)}
        >
          {/* Avatar Placeholder */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
              {notification.actorUsername ? notification.actorUsername[0].toUpperCase() : '?'}
            </div>
          </div>

          {/* Notification Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              <span className="font-bold">@{notification.actorUsername}</span>{' '}
              {notification.actionType === 'comment' ? 'commented on your post' : 'sent you a message'}
            </p>
            <p className="text-xs text-gray-500 mt-1 truncate">{notification.contextSnippet}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </p>
          </div>

          {/* Post Image for Comments */}
          {notification.actionType === 'comment' && notification.postImage && (
            <div className="flex-shrink-0">
              <img
                src={notification.postImage}
                alt="Post thumbnail"
                className="w-10 h-10 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      ))}
      {notifications.length > 5 && (
        <p className="text-xs text-gray-500 text-center py-2">
          Showing 5 of {notifications.length} notifications
        </p>
      )}
    </div>
  );
}

export default CompactNotifications;