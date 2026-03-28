"use client";

import React from "react";
import Link from "next/link";
import {
  Zap,
  Users,
  MessageSquare,
  MessageCircleMore,
  Mail,
  BringToFront,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Instagram,
  MessageSquareReply,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { FaTelegramPlane } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const automationCards = [
  {
    title: "Auto-DM links from comments",
    description: "Send a link when people comment on a post or reel",
    icon: <MessageCircleMore className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "POPULAR",
    badgeColor: "bg-red-500",
    link: "/dashboard/instagram-automation/auto-dm-comment-link",
  },
  {
    title: "Respond to all your DMs",
    description: "Auto-send customized replies when people DM you",
    icon: <Sparkles className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "POPULAR",
    badgeColor: "bg-red-500",
    link: "/dashboard/instagram-automation/respond-to-all-your-dm",
  },
  {
    title: "Automatic Reply",
    description: "Greet customers and offer self-help options.",
    icon: <BringToFront className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "LATEST",
    badgeColor: "bg-green-600",
    link: "/dashboard/whatsapp-automation/automatic-reply",
  },
];

const instagramCards = [
  {
    title: "IG Media Insights",
    description: "Manage and schedule your Instagram media content",
    icon: <BringToFront className="w-6 h-6" />,
    type: "Media Insights & Dashboard",
    badge: null,
    badgeColor: null,
    link: "/dashboard/instagram-automation/media-insights",
    hoverColor: "hover:border-pink-500",
    iconBg: "from-pink-50 to-pink-100",
    iconColor: "text-pink-600",
    hoverText: "group-hover:text-pink-600",
  },
  // {
  //   title: "IG Media Insights",
  //   description: "Track performance and analytics of your posts",
  //   icon: <TrendingUp className="w-6 h-6" />,
  //   type: "Analytics",
  //   badge: "PRO",
  //   badgeColor: "bg-pink-600",
  //   link: "/dashboard/instagram/insights",
  //   hoverColor: "hover:border-pink-500",
  //   iconBg: "from-pink-50 to-pink-100",
  //   iconColor: "text-pink-600",
  //   hoverText: "group-hover:text-pink-600",
  // },
  {
    title: "IG Auto-DM from comments",
    description: "Automatically send DMs when users comment",
    icon: <MessageCircleMore className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "LATEST",
    badgeColor: "bg-pink-500",
    link: "/dashboard/instagram-automation/auto-dm-comment-link",
    hoverColor: "hover:border-pink-500",
    iconBg: "from-pink-50 to-pink-100",
    iconColor: "text-pink-600",
    hoverText: "group-hover:text-pink-600",
  },
  {
    title: "IG Respond to all your DM",
    description: "Manage and automate your Instagram messages",
    icon: <MessageSquareReply className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "POPULAR",
    badgeColor: "bg-pink-500",
    link: "/dashboard/instagram-automation/respond-to-all-your-dm",
    hoverColor: "hover:border-pink-500",
    iconBg: "from-pink-50 to-pink-100",
    iconColor: "text-pink-600",
    hoverText: "group-hover:text-pink-600",
  },
  {
    title: "IG Publish Content",
    description: "Schedule and publish content automatically",
    icon: <Sparkles className="w-6 h-6" />,
    type: "Publish Post & Reel",
    badge: "NEW",
    badgeColor: "bg-green-500",
    link: "/dashboard/instagram-automation/publish-content",
    hoverColor: "hover:border-pink-500",
    iconBg: "from-pink-50 to-pink-100",
    iconColor: "text-pink-600",
    hoverText: "group-hover:text-pink-600",
  },
];

const whatsappCards = [
  {
    title: "WA Business Details",
    description: "Get traffic by sharing business details automatically",
    icon: <BringToFront className="w-6 h-6" />,
    type: "Share Details",
    badge: "POPULAR",
    badgeColor: "bg-green-500",
    link: "/dashboard/whatsapp-automation/business-details",
    hoverColor: "hover:border-green-500",
    iconBg: "from-green-50 to-green-100",
    iconColor: "text-green-600",
    hoverText: "group-hover:text-green-600",
  },
  {
    title: "WA Auto-Reply Setup",
    description: "Set common automatic replies for messages",
    icon: <MessageCircleMore className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "LATEST",
    badgeColor: "bg-green-500",
    link: "/dashboard/whatsapp-automation/automatic-reply",
    hoverColor: "hover:border-green-500",
    iconBg: "from-green-50 to-green-100",
    iconColor: "text-green-600",
    hoverText: "group-hover:text-green-600",
  },
  {
    title: "WA Frequent Requests",
    description: "Auto-reply to frequent customer requests",
    icon: <MessageSquare className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "PRO",
    badgeColor: "bg-green-600",
    link: "/dashboard/whatsapp-automation/auto-reply-to-request",
    hoverColor: "hover:border-green-500",
    iconBg: "from-green-50 to-green-100",
    iconColor: "text-green-600",
    hoverText: "group-hover:text-green-600",
  },
  {
    title: "WA All Contact",
    description: "Chat with subscribers anywhere, anytime",
    icon: <Users className="w-6 h-6" />,
    type: "Customer Contacts ",
    badge: null,
    badgeColor: null,
    link: "/dashboard/contact-list",
    hoverColor: "hover:border-green-500",
    iconBg: "from-green-50 to-green-100",
    iconColor: "text-green-600",
    hoverText: "group-hover:text-green-600",
  },
  // {
  //   title: "WA Publish Content",
  //   description: "Schedule and publish WhatsApp content",
  //   icon: <Sparkles className="w-6 h-6" />,
  //   type: "Flow Builder",
  //   badge: "NEW",
  //   badgeColor: "bg-emerald-500",
  //   link: "/dashboard/whatsapp/publish",
  //   hoverColor: "hover:border-green-500",
  //   iconBg: "from-green-50 to-green-100",
  //   iconColor: "text-green-600",
  //   hoverText: "group-hover:text-green-600",
  // },
];

const telegramCards = [
  {
    title: "TG Media Management",
    description: "Manage and organize your Telegram media",
    icon: <BringToFront className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "POPULAR",
    badgeColor: "bg-blue-500",
    link: "/dashboard/telegram/media",
    hoverColor: "hover:border-blue-500",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    hoverText: "group-hover:text-blue-600",
  },
  {
    title: "TG Media Insights",
    description: "Get detailed analytics for your Telegram content",
    icon: <TrendingUp className="w-6 h-6" />,
    type: "Analytics",
    badge: "PRO",
    badgeColor: "bg-blue-600",
    link: "/dashboard/telegram/insights",
    hoverColor: "hover:border-blue-500",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    hoverText: "group-hover:text-blue-600",
  },
  {
    title: "TG AutoComment in DM",
    description: "Auto-send DMs based on channel comments",
    icon: <MessageCircleMore className="w-6 h-6" />,
    type: "Flow Builder",
    badge: "LATEST",
    badgeColor: "bg-blue-500",
    link: "/dashboard/telegram/auto-comment",
    hoverColor: "hover:border-blue-500",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    hoverText: "group-hover:text-blue-600",
  },
  {
    title: "TG DM Messages",
    description: "Automate and manage Telegram direct messages",
    icon: <MessageSquare className="w-6 h-6" />,
    type: "Quick Automation",
    badge: null,
    badgeColor: null,
    link: "/dashboard/telegram/messages",
    hoverColor: "hover:border-blue-500",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    hoverText: "group-hover:text-blue-600",
  },
  {
    title: "TG Publish Content",
    description: "Schedule and publish Telegram content",
    icon: <Sparkles className="w-6 h-6" />,
    type: "Flow Builder",
    badge: "NEW",
    badgeColor: "bg-cyan-500",
    link: "/dashboard/telegram/publish",
    hoverColor: "hover:border-blue-500",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600",
    hoverText: "group-hover:text-blue-600",
  },
];

const facebookCards = [
  {
    title: "FB Media Management",
    description: "Manage and schedule your Facebook media content",
    icon: <BringToFront className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "POPULAR",
    badgeColor: "bg-blue-600",
    link: "/dashboard/facebook/media",
    hoverColor: "hover:border-blue-600",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-700",
    hoverText: "group-hover:text-blue-700",
  },
  {
    title: "FB Media Insights",
    description: "Track performance and engagement metrics",
    icon: <TrendingUp className="w-6 h-6" />,
    type: "Analytics",
    badge: "PRO",
    badgeColor: "bg-blue-700",
    link: "/dashboard/facebook/insights",
    hoverColor: "hover:border-blue-600",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-700",
    hoverText: "group-hover:text-blue-700",
  },
  {
    title: "FB AutoComment in DM",
    description: "Send automated DMs when users comment",
    icon: <MessageCircleMore className="w-6 h-6" />,
    type: "Flow Builder",
    badge: "LATEST",
    badgeColor: "bg-blue-600",
    link: "/dashboard/facebook/auto-comment",
    hoverColor: "hover:border-blue-600",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-700",
    hoverText: "group-hover:text-blue-700",
  },
  {
    title: "FB DM Messages",
    description: "Automate and manage Facebook messages",
    icon: <MessageSquare className="w-6 h-6" />,
    type: "Quick Automation",
    badge: null,
    badgeColor: null,
    link: "/dashboard/facebook/messages",
    hoverColor: "hover:border-blue-600",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-700",
    hoverText: "group-hover:text-blue-700",
  },
  {
    title: "FB Publish Content",
    description: "Schedule and publish Facebook content",
    icon: <Sparkles className="w-6 h-6" />,
    type: "Flow Builder",
    badge: "NEW",
    badgeColor: "bg-green-500",
    link: "/dashboard/facebook/publish",
    hoverColor: "hover:border-blue-600",
    iconBg: "from-blue-50 to-blue-100",
    iconColor: "text-blue-700",
    hoverText: "group-hover:text-blue-700",
  },
];

const growthCards = [
  {
    title: "Respond to all your DMs",
    description: "Auto-send customized replies when people DM you",
    icon: <MessageSquare className="w-6 h-6" />,
    type: "Quick Automation",
    badge: null,
    badgeColor: null,
    link: "/dashboard/respond-to-all-your-dm",
  },
  {
    title: "Grow followers from comments",
    description: "Incentivize a follow to grow your account",
    icon: <Users className="w-6 h-6" />,
    type: "Quick Automation",
    badge: "PRO",
    badgeColor: "bg-blue-600",
    extraBadge: "NEW",
    link: "/dashboard/connect-instagram",
  },
  {
    title: "Auto-reply to comment in DM",
    description: "Send a product lineup in Instagram DMs",
    icon: <Mail className="w-6 h-6" />,
    type: "Flow Builder",
    badge: "PRO",
    badgeColor: "bg-blue-600",
    link: "/dashboard/auto-dm-comment-link",
  },
];

const AutomationCard = ({
  title,
  description,
  icon,
  type,
  badge,
  badgeColor,
  extraBadge,
  link,
  hoverColor = "hover:border-blue-500",
  iconBg = "from-blue-50 to-indigo-100",
  iconColor = "text-blue-600",
  hoverText = "group-hover:text-blue-600",
}) => (
  <Link href={link}>
    <div
      className={`group relative bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100 hover:shadow-xl ${hoverColor} transition-all duration-300 cursor-pointer`}
    >
      {badge && (
        <div className="absolute top-4 right-4 flex gap-2">
          <span
            className={`${badgeColor} text-white text-xs font-semibold px-2.5 py-1 rounded-full`}
          >
            {badge}
          </span>
          {extraBadge && (
            <span className="bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {extraBadge}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-12 h-12 bg-gradient-to-br ${iconBg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <h3
        className={`text-lg font-semibold text-gray-900 mb-2 ${hoverText} transition-colors duration-300`}
      >
        {title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center text-gray-500 text-xs">
          <Zap className="w-3 h-3 mr-1" />
          {type}
        </div>
        <ArrowRight
          className={`w-4 h-4 text-gray-400 ${hoverText} group-hover:translate-x-1 transition-all duration-300`}
        />
      </div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const userData = {
    name: session?.user?.name || "User",
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-2">
        {/* Header */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-sans font-bold text-black/70 mb-2">
                Hello, {userData.name}!
              </h1>
           <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
  <span className="flex items-center gap-2">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    {session?.user?.whatsappToken && session?.user?.instagramToken ? (
      <span className="flex items-center gap-2">
        2 connected channels: 
        <Link href="/dashboard/whatsapp-automation" className="flex items-center gap-1 text-green-600 hover:underline">
          <FaWhatsapp className="w-4 h-4" /> WhatsApp
        </Link> |
        <Link href="/dashboard/instagram-automation" className="flex items-center gap-1 text-pink-600 hover:underline">
          <Instagram className="w-4 h-4" /> Instagram
        </Link>
      </span>
    ) : session?.user?.whatsappToken ? (
      <span className="flex items-center gap-2">
        1 connected channel: 
        <Link href="/dashboard/whatsapp-automation" className="flex items-center gap-1 text-green-600 hover:underline">
          <FaWhatsapp className="w-4 h-4" /> WhatsApp
        </Link>
      </span>
    ) : session?.user?.instagramToken ? (
      <span className="flex items-center gap-2">
        1 connected channel: 
        <Link href="/dashboard/instagram-automation" className="flex items-center gap-1 text-pink-600 hover:underline">
          <Instagram className="w-4 h-4" /> Instagram
        </Link>
      </span>
    ) : (
      <span>No connected channels</span>
    )}
  </span>
</div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="space-y-6 mb-16">
          <div>
            <p className="text-sm sm:text-base text-gray-600">
              Welcome to your dashboard. Here's what's happening with your
              projects today.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4  ">
            <Card className="bg-gradient-to-br from-white via-white to-red-500 text-black">
              <CardHeader>
                <CardDescription className="sm:text-base">
                  Total Comments
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
                  8,942
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="bg-white text-red-500 border-gray-300 rounded-full"
                  >
                    +18.3%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium text-base">
                  Spike after new post campaign
                </div>
                <div className="text-gray-700 ">
                  Most activity seen on weekends
                </div>
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-br from-white via-white to-blue-500 text-black">
              <CardHeader>
                <CardDescription className="sm:text-base">
                  Total DMs
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
                  1,582
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="bg-white text-blue-500 border-gray-300 rounded-full"
                  >
                    -7.9%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Slight drop in user inquiries
                </div>
                <div className="text-black">
                  Consider re-engagement strategies
                </div>
              </CardFooter>
            </Card>
            <Card className="bg-gradient-to-br from-white via-white to-green-500 text-black">
              <CardHeader>
                <CardDescription className="sm:text-base">
                  Followers
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
                  92,310
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="bg-white text-green-500 border-gray-300 rounded-full"
                  >
                    +6.4%
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 flex gap-2 font-medium">
                  Consistent growth from reels
                </div>
                <div className="text-black">
                  Audience reach improved steadily
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Start Here Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700 ">Start Here</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {automationCards.map((card, index) => (
              <AutomationCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Instagram Automation Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Instagram className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700">
              Instagram Automation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {instagramCards.map((card, index) => (
              <AutomationCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* WhatsApp Automation Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <FaWhatsapp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700">
              WhatsApp Automation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {whatsappCards.map((card, index) => (
              <AutomationCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Telegram Automation Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
              <FaTelegramPlane className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700">
              Telegram Automation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {telegramCards.map((card, index) => (
              <AutomationCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Facebook Automation Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <FaFacebookF className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700">
              Facebook Automation
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {facebookCards.map((card, index) => (
              <AutomationCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Hit Your Growth Goals Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700 text-">
              Hit Your Growth Goals
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {growthCards.map((card, index) => (
              <AutomationCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Stats Footer */}
        <div className="max-w-7xl mx-auto mt-12 p-8 bg-white/70 backdrop-blur-md rounded-3xl border border-gray-200/50 shadow-xl shadow-gray-900/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center p-6 rounded-2xl transition-all duration-300 hover:bg-gray-100  ">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  6
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 ">
                Available Templates
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed ">
                Ready-to-use templates for quick deployment
              </p>
            </div>

            <div className="group text-center p-6 rounded-2xl transition-all duration-300 hover:bg-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Popular Automations
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Most-used automation workflows
              </p>
            </div>

            <div className="group text-center p-6 rounded-2xl transition-all duration-300 hover:bg-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                AI-Powered Features
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Intelligent automation capabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
