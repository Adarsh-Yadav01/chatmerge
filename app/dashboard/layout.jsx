"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import AppSidebar from "../../app/components/Sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import NotificationComponent from "@/app/components/NotificationComponent"; // Import the notification component

// Map routes to display names
const routeNameMap = {
  "/dashboard": "",
  "/dashboard/connect-channel": "Connect Channel",
  "/dashboard/contact-list": "Contact List",

  "/dashboard/instagram-automation/connect-instagram": "Connect Instagram",
  "/dashboard/instagram-automation/connect-instagram/analytics":
    "Instagram Analytics",
  "/dashboard/instagram-automation/media-insights": "Media Insights",

  "/dashboard/instagram-automation/auto-dm-comment-link":
    "Auto-reply to comment in DM",
  "/dashboard/instagram-automation/auto-dm-comment-link/automation":
    "Auto-reply to comment in DM",

  "/dashboard/instagram-automation/respond-to-all-your-dm":
    "Respond to all your DM",
  "/dashboard/instagram-automation/respond-to-all-your-dm/automation":
    "Respond to all your DM",

  "/dashboard/instagram-automation/publish-content": "Publish Content",

  "/dashboard/whatsapp-automation/business-details": "Business Details",
  "/dashboard/contact-list": "Contact List",
  "/dashboard/whatsapp-automation/automatic-reply": "Automatic Reply",
  "/dashboard/whatsapp-automation/automatic-reply/automation":
    "Automatic Reply",
  "/dashboard/whatsapp-automation/auto-reply-to-request": "Reply to Requests",
  "/dashboard/whatsapp-automation/auto-reply-to-request/automation":
    "Reply to Requests",

  "/dashboard/telegram-automation/redirect-your-website": "Redirect  Website",
  "/dashboard/telegram-automation/redirect-your-website/automation":
    "Redirect  Website",

  "/dashboard/telegram-automation/keyword-to-lead-flow": "Keyword Flow",
  "/dashboard/telegram-automation/keyword-to-lead-flow/automation":
    "Keyword Flow",

  "/dashboard/telegram-automation/session-reminder-automation":
    "Session Reminder Automation",
  "/dashboard/telegram-automation/session-reminder-automation/automation":
    "Session Reminder Automation",

  // Add more routes as needed
};

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const currentPageName = routeNameMap[pathname]; // Fallback if route not mapped
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const userId = session?.user?.id;

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?userId=${userId}&isRead=false`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000); // Fetch every 3 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const handleNotificationUpdate = (updatedNotifications) => {
    setNotifications(updatedNotifications);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] text-base ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center justify-between w-full px-4">
            {/* Left side - Breadcrumb */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block text-base">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block text-base" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-base text-gray-800">
                      {currentPageName}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Right side - Notification Component */}
            {userId && (
              <NotificationComponent 
                userId={userId} 
                notifications={notifications}
                onNotificationUpdate={handleNotificationUpdate}
              />
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}