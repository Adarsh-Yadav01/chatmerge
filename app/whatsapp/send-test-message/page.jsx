'use client';

import { useState } from 'react';

export default function SendTestMessage() {
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [templateName, setTemplateName] = useState('order_confirmation_2025');
  const [language, setLanguage] = useState('en_US');
  const [parameters, setParameters] = useState({ '{{1}}': 'John Doe', '{{2}}': '12345' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const components = [
        {
          type: 'body',
          parameters: Object.values(parameters).map(text => ({ type: 'text', text })),
        },
      ];

      // Validate inputs
      if (!/^\+\d{10,15}$/.test(phoneNumber)) {
        setMessage('Error: Invalid phone number format (e.g., +1234567890)');
        return;
      }
      if (!templateName || !language) {
        setMessage('Error: Template name and language are required');
        return;
      }
      if (Object.values(parameters).some(p => !p)) {
        setMessage('Error: Provide values for all template parameters');
        return;
      }

      const response = await fetch('/api/whatsapp/send-test-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, templateName, language, components }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Message sent successfully! ID: ${data.messages[0].id}`);
      } else {
        setMessage(`Error: ${data.error?.message || 'Failed to send message'}`);
      }
    } catch (error) {
      setMessage('Error: Could not connect to server or send message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center text-gray-800">Send Test WhatsApp Message</h1>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Send a test message using an approved template. Use a test phone number.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Recipient Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., +1234567890"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Use international format</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Name</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., order_confirmation_2025"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="en_US">English (US)</option>
              <option value="en_GB">English (UK)</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Parameters</label>
            {Object.keys(parameters).map((variable, index) => (
              <div key={index} className="mb-2">
                <label className="block text-xs font-medium text-gray-600">Parameter for {variable}</label>
                <input
                  type="text"
                  value={parameters[variable]}
                  onChange={(e) => setParameters(prev => ({ ...prev, [variable]: e.target.value }))}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`e.g., ${variable === '{{1}}' ? 'John Doe' : '12345'}`}
                  required
                />
              </div>
            ))}
            <p className="text-xs text-gray-500 mt-1">Use placeholders (no real customer data)</p>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Send Test Message
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}