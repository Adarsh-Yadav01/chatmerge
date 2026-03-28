"use client";

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Constants for configuration
const FB_SDK_VERSION = 'v23.0';
const SIGNUP_TIMEOUT_MS = 30000;
const API_ENDPOINTS = {
    EXCHANGE_TOKEN: '/api/whatsapp/exchange-token',
    UPDATE_USER: '/api/whatsapp/update-user',
    SEND_MESSAGE: '/api/whatsapp/send-message',
};
const SANDBOX_PHONE_NUMBER = '+15550912579';

/**
 * Logs data with a label, redacting sensitive fields (e.g., tokens, codes).
 */
const logWithRedaction = (label, data) => {
    const redactedData = { ...data };
    if (redactedData.whatsappToken) redactedData.whatsappToken = '[REDACTED]';
    if (redactedData.code) redactedData.code = '[REDACTED]';
    console.log(`${label}:`, JSON.stringify(redactedData, null, 2));
};

export default function WhatsappSetupButton({ className, disabled }) {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [signupData, setSignupData] = useState({
        whatsappWabaId: null,
        whatsappPhoneId: null,
        whatsappToken: null,
    });
    const [signupStarted, setSignupStarted] = useState(false);

    /**
     * Handles responses from WA_EMBEDDED_SIGNUP events or OAuth code exchange.
     */
    const handleSignupResponse = async (whatsappWabaId, whatsappPhoneId, code) => {
        logWithRedaction('handleSignupResponse called', { whatsappWabaId, whatsappPhoneId, code });
        setLoading(true);
        try {
            if (whatsappWabaId && whatsappPhoneId) {
                setSignupData(prev => ({
                    ...prev,
                    whatsappWabaId,
                    whatsappPhoneId,
                }));
                logWithRedaction('Updated signupData with WABA and Phone ID', { whatsappWabaId, whatsappPhoneId });
            }
            if (code) {
                logWithRedaction('Preparing to call exchange-token', { code });
                const res = await fetch(API_ENDPOINTS.EXCHANGE_TOKEN, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, phone_number: SANDBOX_PHONE_NUMBER }),
                });
                console.log('Exchange-token response status:', res.status);
                const data = await res.json();
                console.log('Exchange-token response data:', JSON.stringify(data, null, 2));
                if (data.error) {
                    console.error('Token Exchange Error:', JSON.stringify(data.errorDetails || data.error, null, 2));
                    toast.error(`Token exchange failed: ${data.error}`);
                    setSignupStarted(false);
                    return;
                }
                setSignupData(prev => ({
                    ...prev,
                    whatsappToken: data.access_token,
                }));
                logWithRedaction('Token Exchange Success', { whatsappToken: data.access_token });
            }
        } catch (error) {
            console.error('Setup Error:', error.message, error.stack);
            toast.error(`Error during WhatsApp setup: ${error.message}`);
            setSignupStarted(false);
            setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
        } finally {
            setLoading(false);
            console.log('handleSignupResponse completed');
        }
    };

    useEffect(() => {
        const { whatsappWabaId, whatsappPhoneId, whatsappToken } = signupData;
        logWithRedaction('Checking signupData for API call', { whatsappWabaId, whatsappPhoneId, whatsappToken, userId: session?.user?.id });

        if (whatsappWabaId && whatsappPhoneId && whatsappToken) {
            const updateUser = async () => {
                const userId = session?.user?.id || process.env.NEXT_PUBLIC_TEST_USER_ID || 'test-user';
                logWithRedaction('Calling update-user', {
                    userId,
                    whatsappWabaId,
                    whatsappPhoneId,
                    whatsappToken,
                });
                try {
                    const updateRes = await fetch(API_ENDPOINTS.UPDATE_USER, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            whatsappWabaId,
                            whatsappPhoneId,
                            whatsappToken,
                        }),
                    });
                    console.log('Update-user response status:', updateRes.status);
                    const updateData = await updateRes.json();
                    console.log('Update-user response data:', JSON.stringify(updateData, null, 2));
                    if (updateData.success) {
                        logWithRedaction('Updating session with WhatsApp data', { whatsappWabaId, whatsappPhoneId, whatsappToken });
                        if (session) {
                            await update({
                                ...session,
                                user: {
                                    ...session?.user,
                                    whatsappWabaId,
                                    whatsappPhoneId,
                                    whatsappToken,
                                },
                            });
                        }
                        toast.success('WhatsApp setup completed! Activating automation...');
                        logWithRedaction('Calling send-message', {
                            whatsappToken,
                            whatsappPhoneId,
                            recipientPhone: SANDBOX_PHONE_NUMBER,
                            message: 'Welcome to your WhatsApp automation! Your chatbot is now active.',
                        });
                        const sendRes = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                accessToken: whatsappToken,
                                phoneNumberId: whatsappPhoneId,
                                recipientPhone: SANDBOX_PHONE_NUMBER,
                                message: 'Welcome to your WhatsApp automation! Your chatbot is now active.',
                            }),
                        });
                        console.log('Send-message response status:', sendRes.status);
                        const sendData = await sendRes.json();
                        console.log('Send-message response data:', JSON.stringify(sendData, null, 2));
                        if (sendData.success) {
                            toast.success('WhatsApp setup completed! Redirecting to dashboard...');
                            console.log('Redirecting to /dashboard');
                            router.push('/dashboard');
                        } else {
                            console.error('Send Message Error:', JSON.stringify(sendData, null, 2));
                            toast.error(`Failed to send test message: ${sendData.error || 'Unknown error'}`);
                            router.push('/dashboard');
                        }
                    } else {
                        console.error('Update User Error:', JSON.stringify(updateData, null, 2));
                        toast.error('Failed to update user data');
                        setSignupStarted(false);
                        setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
                    }
                } catch (error) {
                    console.error('Update User Error:', error.message, error.stack);
                    toast.error(`Error updating user: ${error.message}`);
                    setSignupStarted(false);
                    setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
                }
            };
            updateUser();
        }
    }, [signupData, session, update, router]);

    useEffect(() => {
        logWithRedaction('useEffect started', { session, status });
        console.log('Session user:', session?.user);
        if (!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
            console.error('Facebook App ID missing');
            toast.error('Facebook App ID missing');
            return;
        }
        if (!process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID) {
            console.error('WhatsApp configuration ID missing');
            toast.error('WhatsApp configuration ID missing');
            return;
        }

        if (!window.FB) {
            console.log('Loading Facebook SDK...');
            (function (d, s, id) {
                const fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    console.log('Facebook SDK script already exists, skipping load');
                    return;
                }
                const js = d.createElement(s);
                js.id = id;
                js.src = `https://connect.facebook.net/en_US/sdk.js`;
                js.async = true;
                js.defer = true;
                js.crossOrigin = 'anonymous';
                js.onload = () => {
                    console.log('Facebook SDK loaded');
                    window.FB.init({
                        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                        autoLogAppEvents: true,
                        xfbml: true,
                        version: FB_SDK_VERSION,
                    });
                    logWithRedaction('Facebook SDK initialized', {
                        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                        version: FB_SDK_VERSION,
                    });
                };
                js.onerror = () => {
                    console.error('Failed to load Facebook SDK');
                    toast.error('Failed to load Facebook SDK');
                    setSignupStarted(false);
                };
                fjs.parentNode.insertBefore(js, fjs);
            })(document, 'script', 'facebook-jssdk');
        } else {
            console.log('Facebook SDK already loaded, initializing...');
            window.FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                autoLogAppEvents: true,
                xfbml: true,
                version: FB_SDK_VERSION,
            });
            logWithRedaction('Facebook SDK initialized', {
                appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
                version: FB_SDK_VERSION,
            });
        }

        const messageHandler = (event) => {
            logWithRedaction('Received message event', { origin: event.origin, data: event.data });
            if (event.origin !== "https://www.facebook.com" && event.origin !== "https://web.facebook.com") {
                console.log('Ignoring message from non-Facebook origin:', event.origin);
                return;
            }
            try {
                const data = JSON.parse(event.data);
                logWithRedaction('Parsed message data', data);
                if (data.type === 'WA_EMBEDDED_SIGNUP') {
                    if (data.event === 'FINISH') {
                        const { waba_id, phone_number_id } = data.data;
                        logWithRedaction('WA_EMBEDDED_SIGNUP FINISH event', { waba_id, phone_number_id });
                        handleSignupResponse(waba_id, phone_number_id, null);
                    } else if (data.event === 'CANCEL') {
                        const { current_step } = data.data;
                        console.warn('Cancel at', current_step);
                        toast.error(`WhatsApp signup cancelled at step: ${current_step || 'Unknown'}`);
                        setSignupStarted(false);
                        setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
                    } else if (data.event === 'ERROR') {
                        const { error_message } = data.data;
                        console.error('error', error_message);
                        toast.error(`WhatsApp signup error: ${error_message}`);
                        setSignupStarted(false);
                        setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
                    }
                }
            } catch {
                console.log('Non JSON Responses', event.data);
            }
        };

        window.addEventListener('message', messageHandler);

        window.fbLoginCallback = (response) => {
            logWithRedaction('fbLoginCallback received', response);
            if (response.authResponse && response.authResponse.code) {
                const code = response.authResponse.code;
                console.log('Extracted code from authResponse:', '[REDACTED]');
                handleSignupResponse(null, null, code);
            } else {
                const errorMsg = response.error ? response.error.message : 'No authResponse or code in response';
                console.error('FB Login Failed:', JSON.stringify(response, null, 2));
                toast.error(`WhatsApp signup failed: ${errorMsg}`);
                setSignupStarted(false);
                setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
            }
        };

        const timeoutId = setTimeout(() => {
            console.log('Signup process timed out');
            toast.error('Signup process timed out. Please try again.');
            setSignupStarted(false);
            setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });
        }, SIGNUP_TIMEOUT_MS);

        return () => {
            console.log('Cleaning up useEffect: removing message event listener and timeout');
            window.removeEventListener('message', messageHandler);
            clearTimeout(timeoutId);
        };
    }, [session, status]);

    const launchWhatsAppSignup = useCallback(() => {
        logWithRedaction('launchWhatsAppSignup called', { status, session });
        if (signupStarted) {
            console.log('Signup already in progress, ignoring additional click');
            toast.error('WhatsApp signup already in progress');
            return;
        }
        if (status === 'loading') {
            console.log('Session loading, aborting signup');
            toast.error('Session loading, please wait');
            return;
        }
        if (status !== 'authenticated' && !process.env.NEXT_PUBLIC_TEST_USER_ID) {
            console.log('User not authenticated and no test user ID, redirecting to /login');
            toast.error('Please log in first');
            router.push('/login');
            return;
        }
        if (!window.FB) {
            console.error('Facebook SDK not loaded');
            toast.error('Facebook SDK not loaded');
            return;
        }
        if (!process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID) {
            console.error('WhatsApp configuration ID missing');
            toast.error('WhatsApp configuration ID missing');
            return;
        }

        setSignupStarted(true);
        setSignupData({ whatsappWabaId: null, whatsappPhoneId: null, whatsappToken: null });

        window.FB.login(
            (response) => {
                logWithRedaction('OAuth Dialog Response', response);
                window.fbLoginCallback(response);
            },
            {
                config_id: process.env.NEXT_PUBLIC_WHATSAPP_CONFIG_ID,
                response_type: 'code',
                override_default_response_type: true,
                extras: { version: 'v3' }
            }
        );
    }, [session, status, signupStarted, router]);

    return (
        <button
            onClick={launchWhatsAppSignup}
            disabled={disabled || loading || signupStarted || (status !== 'authenticated' && !process.env.NEXT_PUBLIC_TEST_USER_ID) || status === 'loading'}
            className={className}
        >
            {loading ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray="32"
                            strokeDashoffset="32"
                        >
                            <animate
                                attributeName="stroke-dashoffset"
                                values="32;0"
                                dur="1s"
                                repeatCount="indefinite"
                            />
                        </circle>
                    </svg>
                    Connecting...
                </span>
            ) : (
                <span>🔗 Connect WhatsApp Account</span>
            )}
        </button>
    );
}