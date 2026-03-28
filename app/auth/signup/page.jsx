'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');

  const handleChannelSelect = (channel) => {
    setSelectedChannel(channel);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Call server action or API for signup
    console.log('Signup:', { email, password, selectedChannel });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-center bg-white border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            <Image src="/channel-icons/google.png" alt="Google" width={24} height={24} className="mr-2" />
            Continue with Google
          </button>
          <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            <Image src="/channel-icons/facebook.png" alt="Facebook" width={24} height={24} className="mr-2" />
            Continue with Facebook
          </button>
          <button className="w-full flex items-center justify-center bg-black text-white py-2 rounded-lg hover:bg-gray-800">
            <Image src="/channel-icons/apple.png" alt="Apple" width={24} height={24} className="mr-2" />
            Continue with Apple
          </button>
          <div className="flex items-center justify-between">
            <hr className="w-full border-gray-300" />
            <span className="px-2 text-gray-500">or</span>
            <hr className="w-full border-gray-300" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select a Channel</label>
              <div className="flex space-x-2 mt-2">
                {['Instagram', 'Facebook', 'WhatsApp', 'Telegram'].map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => handleChannelSelect(channel)}
                    className={`px-3 py-1 rounded-lg border ${
                      selectedChannel === channel ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
                    } hover:bg-blue-100`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              Create Account
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}