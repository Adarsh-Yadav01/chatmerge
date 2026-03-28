"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  ChevronsUpDown,
  Frame,
  LogOut,
  Instagram,
  LayoutDashboard,
  MoreHorizontal,
  CircleFadingPlus,
  PieChart,
  Workflow,
  Settings2,
  BotMessageSquare,
  Command,
  Contact,
} from "lucide-react";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";
import Image from "next/image";
import logo from "../../public/chatrealfam.png"; // Adjust the path as necessary
import Link from "next/link";

const MOBILE_BREAKPOINT = 768;

export default function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  console.log("🧩 Session Data:", session);
console.log("🟢 Session Status:", status);
  const [isMobile, setIsMobile] = React.useState(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Get user data from session
  const userData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "user@example.com",
    avatar: session?.user?.image || "/placeholder.svg",
  };

  // Generate initials for fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const data = {
    projects: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Connect Channel",
        url: "/dashboard/connect-channel",
        icon: Command,
      },
      {
        name: "Contact ",
        url: "/dashboard/contact-list",
        icon: Contact,
      },
    ],

    navMain: [
      {
        title: "Instagram Channel",
        url: "/",
        icon: Instagram,
        items: [
          {
            title: "Connect Instagram",
            url: "/dashboard/instagram-automation/connect-instagram",
          },
          {
            title: "Media Insights",
            url: "/dashboard/instagram-automation/media-insights",
          },
          {
            title: "Auto-DM comment",
            url: [
              "/dashboard/instagram-automation/auto-dm-comment-link",
              "/dashboard/instagram-automation/auto-dm-comment-link/automation",
            ],
          },
          {
            title: "Respond your DM",
            url: [
              "/dashboard/instagram-automation/respond-to-all-your-dm",
              "/dashboard/instagram-automation/respond-to-all-your-dm/automation",
            ],
          },

          {
            title: "Publish Content",
            url: "/dashboard/instagram-automation/publish-content",
          },
        ],
      },
      {
        title: "WhatsApp Channel",
        url: "/",
        icon: FaWhatsapp,
        items: [
          {
            title: "Info",
            url: "/dashboard/whatsapp-automation/info",
          },
               {
            title: "Create Template",
            url: "/dashboard/whatsapp-automation/create-template",
          },
                     {
            title: "Manage Template ",
            url: "/dashboard/whatsapp-automation/manage-template",
          },
                {
            title: "Keyword Automation ",
            url: "/dashboard/whatsapp-automation/keyword-automation",
          },
       

          {
            title: "Business Details",
            url: "/dashboard/whatsapp-automation/business-details",
          },

          {
            title: "All Contact",
            url: "/dashboard/contact-list",
          },

          {
            title: "Automatic Reply",
            url: [
              "/dashboard/whatsapp-automation/automatic-reply",
              "/dashboard/whatsapp-automation/automatic-reply/automation",
            ],
          },
          {
            title: "Reply to Requests",
            url: [
              "/dashboard/whatsapp-automation/auto-reply-to-request",
              "/dashboard/whatsapp-automation/auto-reply-to-request/automation",
            ],
          },
        ],
      },
      {
        title: "Telegram Channel",
        url: "/",
        icon: FaTelegramPlane,
        items: [
          {
            title: "Redirect  Website",
            url: [
              "/dashboard/telegram-automation/redirect-your-website",
              "/dashboard/telegram-automation/redirect-your-website/automation",
            ],
          },
          {
            title: "Keyword Flow",
            url: [
              "/dashboard/telegram-automation/keyword-to-lead-flow",
              "/dashboard/telegram-automation/keyword-to-lead-flow/automation",
            ],
          },
          {
            title: "Auto Reminder",
            url: [
              "/dashboard/telegram-automation/session-reminder-automation",
              "/dashboard/telegram-automation/session-reminder-automation/automation",
            ],
          },

        ],
      },
    ],

    navOthers: [
      {
        title: "Ḥelp",
        url: "/",
        icon: Settings2,
        items: [
          {
            title: "Terms of Service",
            url: "/terms",
          },
          {
            title: "Privacy Policy",
            url: "/privacy-policy",
          },
          {
            title: "About Us",
            url: "/about",
          },
          {
            title: "Contact Us",
            url: "/contact",
          },
        ],
      },
    ],
  };

  const isActive = (itemUrl) => {
    if (Array.isArray(itemUrl)) {
      return itemUrl.some(
        (url) => pathname === url || pathname.startsWith(url + "/")
      );
    }
    if (itemUrl === "/dashboard") {
      return pathname === itemUrl;
    }
    return pathname === itemUrl || pathname.startsWith(itemUrl + "/");
  };

  // State to manage which collapsible sections are open
  const [openSections, setOpenSections] = React.useState({});

  // Function to check if any sub-item in a collapsible section is active
  const isCollapsibleSectionActive = (items) => {
    return items?.some((item) => {
      if (Array.isArray(item.url)) {
        return item.url.some(
          (url) => pathname === url || pathname.startsWith(url + "/")
        );
      }
      return pathname === item.url || pathname.startsWith(item.url + "/");
    });
  };

  // Initialize open sections based on active items on mount
  React.useEffect(() => {
    const initialOpenSections = {};
    data.navMain.forEach((item) => {
      if (isCollapsibleSectionActive(item.items)) {
        initialOpenSections[item.title] = true;
      }
    });
    setOpenSections(initialOpenSections);
  }, [pathname]);

  // Handle collapsible toggle
  const handleCollapsibleToggle = (sectionTitle) => {
    setOpenSections((prev) => {
      // Create a new object with all sections set to false
      const newOpenSections = {};
      data.navMain.forEach((item) => {
        newOpenSections[item.title] = false;
      });
      // Toggle the clicked section
      newOpenSections[sectionTitle] = !prev[sectionTitle];
      return newOpenSections;
    });
  };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-gradient-to-r data-[state=open]:from-blue-50 data-[state=open]:to-indigo-50 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 transition-all duration-300 ease-out"
            >
              <Link href="/">
                <div className="flex aspect-square size-22 ml-14 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  <Image src={logo} alt="Logo" width={200} height={160} />
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Home
          </SidebarGroupLabel>
          <SidebarMenu>
            {data.projects.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  className={`
                    text-sm font-medium transition-all duration-200 ease-out rounded-lg px-3 py-2.5 group
                    ${isActive(item.url)
                      ? " text-blue-600 "
                      : "text-slate-700 hover:bg-gradient-to-r hover:from-slate-100 hover:to-blue-50   hover:text-blue-700"
                    }
                  `}
                  asChild
                >
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Automations
          </SidebarGroupLabel>{" "}
          <SidebarMenu>
            {data.navMain.map((item) => {
              const isActiveSection = isCollapsibleSectionActive(item.items);

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  open={openSections[item.title] ?? isActiveSection}
                  onOpenChange={() => handleCollapsibleToggle(item.title)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={`
                          text-sm font-medium transition-all duration-200 ease-out rounded-lg px-3 py-2.5 group
                          ${isActiveSection
                            ? "bg-gradient-to-r from-emerald-50 to-blue-50 text-slate-900 "
                            : "text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-blue-700"
                          }
                        `}
                        tooltip={item.title}
                      >
                        {item.icon && (
                          <item.icon
                            className={`
                            size-4 transition-all duration-200 
                            ${isActiveSection
                                ? "text-emerald-600"
                                : "text-slate-500 group-hover:text-emerald-600"
                              }
                          `}
                          />
                        )}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={`
                                text-sm transition-all duration-200 ease-out rounded-md px-3 py-3 group
                                ${pathname === subItem.url
                                  ? " text-blue-500   font-medium"
                                  : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-800 "
                                }
                              `}
                            >
                              <a
                                href={
                                  Array.isArray(subItem.url)
                                    ? subItem.url[0]
                                    : subItem.url
                                }
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`
      w-1.5 h-1.5 rounded-full transition-all duration-200 
      ${isActive(subItem.url)
                                      ? "bg-blue-500 shadow-sm"
                                      : "bg-slate-300 group-hover:bg-slate-400"
                                    }
    `}
                                />
                             <span
  className={`flex-1 truncate whitespace-nowrap ${
    isActive(subItem.url)
      ? "text-blue-600 font-medium"
      : "text-gray-700 group-hover:text-gray-900"
  }`}
  style={{ maxWidth: "160px" }} // optional, adjust width as per sidebar width
  title={subItem.title} // tooltip for full text
>
  {subItem.title}
</span>

                                {isActive(subItem.url) && (
                                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                )}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel> Others</SidebarGroupLabel>
          <SidebarMenu>
            {data.navOthers.map((item) => {
              const isActiveSection = isCollapsibleSectionActive(item.items);

              return (
                <Collapsible
                  key={item.title}
                  asChild
                  open={openSections[item.title] ?? isActiveSection}
                  onOpenChange={() => handleCollapsibleToggle(item.title)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={`
                          text-sm font-medium transition-all duration-200 ease-out rounded-lg px-3 py-2.5 group
                          ${isActiveSection
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 text-slate-900 "
                            : "text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 hover:text-slate-900"
                          }
                        `}
                        tooltip={item.title}
                      >
                        {item.icon && (
                          <item.icon
                            className={`
                            size-4 transition-all duration-200 
                            ${isActiveSection
                                ? "text-amber-600 "
                                : "text-slate-500 group-hover:text-amber-600"
                              }
                          `}
                          />
                        )}{" "}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={`
                                text-sm transition-all duration-200 ease-out rounded-md px-3 py-2 group
                                ${pathname === subItem.url
                                  ? " text-blue-500  font-medium"
                                  : "text-slate-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:text-slate-800 "
                                }
                              `}
                            >
                              <a
                                href={subItem.url}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className={`
                                  w-1.5 h-1.5 rounded-full transition-all duration-200 
                                  ${pathname === subItem.url
                                      ? "bg-white shadow-sm"
                                      : "bg-slate-300 group-hover:bg-amber-400"
                                    }
                                `}
                                />
                                <span className="flex-1">{subItem.title}</span>
                                {pathname === subItem.url && (
                                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                )}
                              </a>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(userData.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {userData.name}
                    </span>
                    <span className="truncate text-xs">{userData.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={!!isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(userData.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {userData.name}
                      </span>
                      <span className="truncate text-xs">{userData.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    console.log("Logout initiated");

                    // Clear localStorage
                    localStorage.clear();

                    // Clear sessionStorage
                    sessionStorage.clear();

                    // Clear all cookies set by your domain (if any)
                    document.cookie.split(";").forEach((cookie) => {
                      const eqPos = cookie.indexOf("=");
                      const name =
                        eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
                    });

                    // Sign out via NextAuth
                    signOut({ callbackUrl: "/login" });
                  }}
                >
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
