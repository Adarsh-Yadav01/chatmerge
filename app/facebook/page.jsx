"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import fblogo from "../../public/fblogo.webp";
import fbimage from "../../public/fbimage.jpg";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function FacebookPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isConnecting, setIsConnecting] = useState(false);
    const [isFacebookAgreed, setIsFacebookAgreed] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "loading" || !session || session.user.role !== "USER") {
            return;
        }
    }, [session, status, router]);

    const cardData = {
        id: "facebook",
        logo: fblogo,
        logoAlt: "Facebook logo",
        name: "Facebook Messenger",
        title: "Connect Your Facebook Account",
        description: "Securely connect your Facebook account to enable automation features.",
        features: [
            { icon: "🔗", text: "Auto-reply comments" },
            { icon: "📈", text: "Analytics & tracking" },
            { icon: "🤖", text: "Auto comment links" },
        ],
        imageSrc: fbimage,
        imageAlt: "Pro automation interface",
        button: "🔗 Connect Facebook Account",
        bgColor: "from-black via-black to-blue-500",
        btnColor: "from-black via-blue-700 to-blue-500",
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gradient-to-r from-purple-50 via-red-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    if (!session || session.user.role !== "USER") {
        return null;
    }
    return (
        <div className="max-h-screen w-full bg-gradient-to-r from-purple-50 via-red-50 to-orange-50 lg:overflow-auto md:overflow-auto">
            <div className="flex justify-center items-center px-4 py-4 min-h-screen overflow-hidden">
                <div className="max-w-md w-full">
                    <CardContainer className="inter-var w-full">
                        <CardBody
                            className={`bg-gradient-to-tr ${cardData.bgColor} relative group/card w-full h-auto rounded-xl p-8 border border-black/[0.1]`}
                        >
                            <div className="flex justify-center items-center mb-4">
                                <CardItem
                                    translateZ="50"
                                    className="text-xl font-bold text-white flex flex-col justify-center items-center"
                                >
                                    <Image
                                        src={cardData.logo}
                                        alt={cardData.logoAlt}
                                        className="h-16 w-16 object-cover rounded-2xl"
                                    />
                                    <p className="text-white text-3xl font-semibold mt-2">{cardData.name}</p>
                                </CardItem>
                            </div>
                            <CardItem
                                as="div"
                                translateZ="60"
                                className="text-white text-center mb-6"
                            >
                                <h2 className="text-xl text-center font-semibold">{cardData.title}</h2>
                                <p className="text-sm leading-relaxed">{cardData.description}</p>
                            </CardItem>
                            <CardItem
                                as="div"
                                translateZ="40"
                                className="text-white text-center mb-4"
                            >
                                <div className="flex justify-center mb-2">
                                    <label
                                        htmlFor="privacy-agreement"
                                        className="text-xs flex items-center"
                                    >
                                        <input
                                            type="checkbox"
                                            id="privacy-agreement"
                                            required
                                            onChange={(e) => setIsTelegramAgreed(e.target.checked)}
                                            className="mr-1 accent-blue-500 cursor-pointer w-4 h-4"
                                        />
                                        I agree to the &nbsp;
                                        <Link
                                            href="https://chat.realfam.co.in/privacy-policy"
                                            className="text-blue-300 hover:text-blue-400 underline underline-offset-4"
                                            target="_blank"
                                        >
                                            Privacy Policy&nbsp;
                                        </Link>
                                        and &nbsp;
                                        <Link
                                            href="https://chat.realfam.co.in/terms"
                                            className="text-blue-300 hover:text-blue-400 underline underline-offset-4"
                                            target="_blank"
                                        >
                                            Terms & Conditions
                                        </Link>
                                    </label>
                                </div>
                            </CardItem>
                            <div className="flex flex-row gap-4 w-full mb-4">
                                <CardItem translateZ="40" className="flex-1">
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-white text-sm">🚀 Automation Features:</h3>
                                        <div className="grid gap-1 text-xs text-white">
                                            {cardData.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5">
                                                    <span className="text-green-500">{feature.icon}</span>
                                                    <span>{feature.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardItem>
                                <CardItem translateZ="60" className="flex-1">
                                    <Image
                                        src={cardData.imageSrc}
                                        className="h-36 w-full object-cover rounded-lg"
                                        alt={cardData.imageAlt}
                                        placeholder="empty"
                                    />
                                </CardItem>
                            </div>
                            <CardItem translateZ="60" className="w-full mb-4">
                                <button
                                    onClick={() => toast("⌛ Coming Soon!", { position: "top-center" })}
                                    disabled={!isTelegramAgreed}
                                    className={`w-full py-2 px-4 cursor-pointer bg-gradient-to-r ${cardData.btnColor} opacity-70 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105`}
                                >
                                    {cardData.button}
                                </button>
                            </CardItem>
                            <CardItem translateZ="30" className="w-full mb-4">
                                <div className="bg-black border border-blue-500 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-blue-50">🔒</span>
                                        <div className="text-xs text-blue-100">
                                            <p className="font-semibold mb-1">Safe & Secure Connection</p>
                                            <p>Your credentials are encrypted and stored securely.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardItem>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                <CardItem
                                    translateZ="20"
                                    as="a"
                                    href="/learn-more"
                                    className="text-xs text-blue-500 hover:text-blue-600"
                                >
                                    📖 Learn More
                                </CardItem>
                                <CardItem
                                    translateZ="20"
                                    as="a"
                                    href="/contact"
                                    className="text-xs text-gray-50 hover:text-red-300"
                                >
                                    ❓ Need Help?
                                </CardItem>
                            </div>
                        </CardBody>
                    </CardContainer>
                </div>
            </div>
            <Toaster />
        </div>
    );
}