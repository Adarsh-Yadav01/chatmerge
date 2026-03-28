'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from "../../public/chatrealfam.png";
import illustrationImg from "../../public/csimage.jpg";
import instagramIcon from "../../public/instalogo.webp";
import whatsappIcon from "../../public/whatlogo.png";
import messengerIcon from "../../public/fblogo.webp";
import telegramIcon from "../../public/Telegramlogo.png";


const ManyChat = () => {
    const socialPlatforms = [
        {
            id: 'instagram',
            name: 'Instagram',
            description: 'Supercharge your social media marketing with Instagram Automation.',
            icon: (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Image src={instagramIcon} alt="Instagram" width={24} height={24} />
                </div>
            ),
            registerUrl: '/register?platform=instagram'
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            description: 'Choose the most popular mobile messaging app in the world and reach 2 billion users.',
            icon: (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Image src={whatsappIcon} alt="WhatsApp" width={24} height={24} />
                </div>
            ),
            registerUrl: '/register?platform=whatsapp'
        },
        {
            id: 'messenger',
            name: 'Facebook Messenger',
            description: 'Create Facebook Messenger automation to keep customers happy.',
            icon: (
                <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                    <Image src={messengerIcon} alt="Facebook Messenger" width={24} height={24} className='rounded-xl' />
                </div>
            ),
            registerUrl: '/register?platform=facebook'
        },
        {
            id: 'telegram',
            name: 'Telegram',
            description: 'Power up your business with Telegram automation.',
            icon: (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                    <Image src={telegramIcon} alt="Telegram" width={24} height={24} />
                </div>
            ),
            registerUrl: '/register?platform=telegram'
        }
    ];

    return (
        <div className="grid min-h-screen lg:grid-cols-2">
            {/* Left Side - Logo and Content */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                {/* Logo Section */}
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="flex justify-center gap-2 md:justify-start px-8">
                            <div className="flex items-center justify-center h-30 w-30">
                                <div className="flex items-center justify-center h-30 w-30">
                                    <Image src={logo} alt="Logo" width={200} height={160} />
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 items-center justify-center lg:ml-30">
                    <div className="w-full max-w-lg">

                        {/* 👇 Illustration replaced with Image */}
                        <div className="mb-6 flex justify-center lg:justify-start">
                            <Image
                                src={illustrationImg}
                                alt="Illustration"
                                width={300}
                                height={300}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Text Content */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                Where would you
                                <br />
                                like to start?
                            </h2>
                            <p className="text-gray-600 text-sm mb-4">
                                Don't worry, you can connect other channels later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Platform Selection */}
            <div className="flex flex-col gap-4 p-6 md:p-10 bg-gray-50 lg:border-l rounded-3xl border-gray-300">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <h3 className="text-xl font-bold text-gray-900">Choose Your Platform</h3>
                                <p className="text-balance text-sm text-gray-600">
                                    Select the social media platform you want to
                                    start with
                                </p>
                            </div>

                            <div className="grid gap-3">
                                {socialPlatforms.map((platform) => (
                                    <Link
                                        key={platform.id}
                                        href={platform.registerUrl}
                                        className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left group cursor-pointer block"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                                                {platform.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                                                    {platform.name}
                                                </h4>
                                                <p className="text-gray-600 text-xs leading-snug line-clamp-2">
                                                    {platform.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="underline underline-offset-4 text-blue-500 hover:text-gray-600"
                                >
                                    Sign In
                                </Link>
                            </div>

                            <div className="text-center text-xs text-gray-500 mt-20">
                                By continuing, you agree to our{" "}
                                <Link href="/privacy-policy" className="text-blue-500 hover:text-blue-800 underline underline-offset-4">
                                    Privacy Policy
                                </Link>{" "}
                                and{" "}
                                <Link href="/terms" className="text-blue-500 hover:text-blue-800 underline underline-offset-4">
                                    Terms
                                </Link>
                                .
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManyChat;