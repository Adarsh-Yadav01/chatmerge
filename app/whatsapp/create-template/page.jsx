'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export default function CreateTemplate() {
  const [templateName, setTemplateName] = useState('order_confirmation_2025');
  const [category, setCategory] = useState('UTILITY');
  const [language, setLanguage] = useState('en_US');
  const [headerType, setHeaderType] = useState('TEXT');
  const [headerText, setHeaderText] = useState('Order Confirmation');
  const [body, setBody] = useState('Thank you for your order, {{1}}! Your order #{{2}} is confirmed. Reply for details.');
  const [footer, setFooter] = useState('ChatMerge Support');
  const [buttons, setButtons] = useState([{ type: 'QUICK_REPLY', text: 'View Details' }]);
  const [variableSamples, setVariableSamples] = useState({ '{{1}}': 'John Doe', '{{2}}': '12345' });
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(true);
  const [exampleType, setExampleType] = useState('order_confirmation');
  const [validationErrors, setValidationErrors] = useState({});
  const [warnings, setWarnings] = useState([]);

  const examples = {
    order_confirmation: {
      name: 'order_confirmation_2025',
      category: 'UTILITY',
      headerType: 'TEXT',
      headerText: 'Order Confirmation',
      body: 'Thank you for your order, {{1}}! Your order #{{2}} is confirmed. Reply for details.',
      footer: 'ChatMerge Support',
      buttons: [{ type: 'QUICK_REPLY', text: 'View Details' }],
      samples: { '{{1}}': 'John Doe', '{{2}}': '12345' },
    },
    appointment_reminder: {
      name: 'appointment_reminder_2025',
      category: 'UTILITY',
      headerType: 'TEXT',
      headerText: 'Appointment Reminder',
      body: 'Hi {{1}}, this is a reminder for your appointment on {{2}} at {{3}}. Please reply to confirm.',
      footer: 'ChatMerge Clinic',
      buttons: [{ type: 'QUICK_REPLY', text: 'Confirm' }],
      samples: { '{{1}}': 'Jane Smith', '{{2}}': 'October 1, 2025', '{{3}}': '10:00 AM' },
    },
    shipping_update: {
      name: 'shipping_update_2025',
      category: 'UTILITY',
      headerType: 'TEXT',
      headerText: 'Shipping Update',
      body: 'Hi {{1}}, your order {{2}} has been shipped. Track it here.',
      footer: 'ChatMerge Logistics',
      buttons: [{ type: 'URL', text: 'Track Order', url: 'https://example.com/track' }],
      samples: { '{{1}}': 'Alice Johnson', '{{2}}': 'ABC123' },
    },
  };

  const loadExample = (type) => {
    const ex = examples[type];
    if (ex) {
      setTemplateName(ex.name);
      setCategory(ex.category);
      setHeaderType(ex.headerType);
      setHeaderText(ex.headerText);
      setBody(ex.body);
      setFooter(ex.footer);
      setButtons(ex.buttons);
      setVariableSamples(ex.samples);
      setValidationErrors({});
      setWarnings([]);
    }
  };

  // Real-time validation
  useEffect(() => {
    validateTemplate();
  }, [templateName, body, headerText, footer, buttons, variableSamples, headerType]);

  // Detect variables in body text
  useEffect(() => {
    const variables = (body.match(/{{[1-9][0-9]*}}/g) || []).reduce((acc, curr) => {
      acc[curr] = variableSamples[curr] || '';
      return acc;
    }, {});
    setVariableSamples(variables);
  }, [body]);

  const validateTemplate = () => {
    const errors = {};
    const newWarnings = [];

    // Template name validation
    if (!templateName) {
      errors.templateName = 'Template name is required';
    } else if (!/^[a-z0-9_]+$/.test(templateName)) {
      errors.templateName = 'Only lowercase letters, numbers, and underscores allowed';
    } else if (templateName.length < 3) {
      errors.templateName = 'Template name must be at least 3 characters';
    } else if (templateName.length > 512) {
      errors.templateName = 'Template name must not exceed 512 characters';
    } else if (templateName.startsWith('_') || templateName.endsWith('_')) {
      errors.templateName = 'Template name cannot start or end with underscore';
    }

    // Body validation
    if (!body || body.trim().length === 0) {
      errors.body = 'Body text is required';
    } else if (body.length > 1024) {
      errors.body = `Body is ${body.length}/1024 characters (too long)`;
    } else if (body.length < 10) {
      newWarnings.push('Body text is very short. Consider adding more context.');
    }

    // Check for consecutive variables
    const variables = body.match(/{{[1-9][0-9]*}}/g) || [];
    const varNumbers = variables.map(v => parseInt(v.match(/\d+/)[0]));
    for (let i = 1; i <= Math.max(...varNumbers, 0); i++) {
      if (!varNumbers.includes(i)) {
        errors.body = `Variables must be consecutive. Missing {{${i}}}`;
        break;
      }
    }

    // Header validation
    if (headerType === 'TEXT') {
      if (!headerText || headerText.trim().length === 0) {
        errors.headerText = 'Header text is required when header type is TEXT';
      } else if (headerText.length > 60) {
        errors.headerText = `Header is ${headerText.length}/60 characters (too long)`;
      }
    }

    // Footer validation
    if (footer && footer.length > 60) {
      errors.footer = `Footer is ${footer.length}/60 characters (too long)`;
    }

    // Button validation
    buttons.forEach((btn, idx) => {
      if (!btn.text || btn.text.trim().length === 0) {
        errors[`button_${idx}`] = 'Button text is required';
      } else if (btn.text.length > 25) {
        errors[`button_${idx}`] = `Button text is ${btn.text.length}/25 characters`;
      }

      if (btn.type === 'URL') {
        if (!btn.url) {
          errors[`button_${idx}_url`] = 'URL is required for URL button';
        } else if (!/^https?:\/\/.+/.test(btn.url)) {
          errors[`button_${idx}_url`] = 'URL must start with http:// or https://';
        }
      }

      if (btn.type === 'PHONE_NUMBER') {
        if (!btn.phone) {
          errors[`button_${idx}_phone`] = 'Phone number is required';
        } else if (!/^\+\d{1,15}$/.test(btn.phone)) {
          errors[`button_${idx}_phone`] = 'Phone must be in format +1234567890';
        }
      }
    });

    // Variable samples validation
    Object.keys(variableSamples).forEach(variable => {
      if (!variableSamples[variable] || variableSamples[variable].trim().length === 0) {
        errors[`sample_${variable}`] = `Sample value required for ${variable}`;
      }
    });

    // Category-specific warnings
    if (category === 'MARKETING' && buttons.length === 0) {
      newWarnings.push('Marketing templates typically include call-to-action buttons.');
    }

    if (category === 'UTILITY' && body.includes('sale') || body.includes('discount') || body.includes('offer')) {
      newWarnings.push('This looks like marketing content. Consider using MARKETING category.');
    }

    // Check for prohibited content
    const prohibitedWords = ['free', 'win', 'winner', 'congratulations', 'urgent', 'limited time'];
    const lowerBody = body.toLowerCase();
    prohibitedWords.forEach(word => {
      if (lowerBody.includes(word) && category === 'UTILITY') {
        newWarnings.push(`Word "${word}" detected. This may cause rejection in UTILITY category.`);
      }
    });

    setValidationErrors(errors);
    setWarnings(newWarnings);
  };

  const addButton = () => {
    if (buttons.length < 10) {
      setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }]);
    }
  };

  const updateButton = (index, field, value) => {
    const newButtons = [...buttons];
    newButtons[index][field] = value;
    setButtons(newButtons);
  };

  const removeButton = (index) => {
    setButtons(buttons.filter((_, i) => i !== index));
  };

  const updateVariableSample = (variable, value) => {
    setVariableSamples(prev => ({ ...prev, [variable]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    // Final validation check
    if (Object.keys(validationErrors).length > 0) {
      setMessage('Please fix all validation errors before submitting.');
      return;
    }

    try {
      const components = [
        {
          type: 'BODY',
          text: body,
          example: {
            body_text: [Object.values(variableSamples)],
          },
        },
      ];

      if (headerType === 'TEXT' && headerText) {
        components.unshift({
          type: 'HEADER',
          format: 'TEXT',
          text: headerText,
        });
      } else if (headerType !== 'NONE' && headerType !== 'TEXT') {
        components.unshift({ type: 'HEADER', format: headerType });
      }

      if (footer && footer.trim()) {
        components.push({ type: 'FOOTER', text: footer });
      }

      if (buttons.length > 0 && buttons.some(btn => btn.text.trim())) {
        components.push({
          type: 'BUTTONS',
          buttons: buttons
            .filter(btn => btn.text.trim())
            .map(btn => ({
              type: btn.type,
              text: btn.text,
              ...(btn.type === 'URL' && btn.url && { url: btn.url }),
              ...(btn.type === 'PHONE_NUMBER' && btn.phone && { phone_number: btn.phone }),
            })),
        });
      }

      const response = await fetch('/api/whatsapp/create-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateName, category, language, components }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Template created successfully! ID: ${data.id}. It will be reviewed by Meta (usually takes 1-2 hours).`);
        // Reset form after 3 seconds
        setTimeout(() => loadExample(exampleType), 3000);
      } else {
        const errorMsg = data.error?.error_user_msg || data.error?.message || 'Failed to create template';
        setMessage(`❌ Error: ${errorMsg}`);
      }
    } catch (error) {
      setMessage('❌ Error: Could not connect to server or submit template');
    }
  };

  const renderPreview = () => {
    let previewBody = body;
    Object.keys(variableSamples).forEach(v => {
      previewBody = previewBody.replace(new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), variableSamples[v] || v);
    });

    return (
      <div className="bg-gradient-to-b from-teal-600 to-teal-700 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4 text-white">
          <span className="font-medium">WhatsApp Preview</span>
          <span className="text-xs bg-teal-800 px-2 py-1 rounded">{category}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto overflow-hidden">
          {headerType === 'TEXT' && headerText && (
            <div className="bg-gray-50 px-4 pt-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">{headerText}</h3>
            </div>
          )}
          {headerType === 'IMAGE' && (
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center">
              <span className="text-gray-600">📷 Image Header</span>
            </div>
          )}
          {headerType === 'VIDEO' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex items-center justify-center">
              <span className="text-white">🎥 Video Header</span>
            </div>
          )}
          {headerType === 'DOCUMENT' && (
            <div className="bg-blue-50 px-4 py-4 flex items-center gap-3 border-b">
              <span className="text-2xl">📄</span>
              <span className="text-blue-900 text-sm font-medium">Document Header</span>
            </div>
          )}
          
          <div className="px-4 py-3">
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{previewBody}</p>
          </div>
          
          {footer && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 italic">{footer}</p>
            </div>
          )}
          
          {buttons.length > 0 && buttons.some(btn => btn.text) && (
            <div className="border-t border-gray-200 mt-2">
              {buttons.filter(btn => btn.text).map((btn, idx) => (
                <button
                  key={idx}
                  className="w-full text-center py-3 text-teal-600 font-medium text-sm hover:bg-gray-50 border-b border-gray-200 last:border-b-0 flex items-center justify-center gap-2"
                >
                  {btn.type === 'URL' && '🔗'}
                  {btn.type === 'PHONE_NUMBER' && '📞'}
                  {btn.type === 'QUICK_REPLY' && '↩️'}
                  {btn.text}
                </button>
              ))}
            </div>
          )}
          
          <div className="px-4 pb-2 pt-1 text-right">
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Create WhatsApp Template</h1>
          <p className="text-gray-600">Design professional message templates with real-time validation</p>
        </div>

        {/* Validation Summary */}
        {(hasErrors || warnings.length > 0) && (
          <div className="mb-6 space-y-3">
            {hasErrors && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-2">
                      {Object.keys(validationErrors).length} Validation Error{Object.keys(validationErrors).length > 1 ? 's' : ''}
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      {Object.values(validationErrors).map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">Warnings</h3>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') || message.includes('❌')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Template Configuration</h2>

            {/* Load Example */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="block text-sm font-semibold text-blue-900 mb-2">
                Quick Start: Load Example Template
              </label>
              <select
                value={exampleType}
                onChange={(e) => {
                  setExampleType(e.target.value);
                  loadExample(e.target.value);
                }}
                className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="order_confirmation">Order Confirmation (Utility)</option>
                <option value="appointment_reminder">Appointment Reminder (Utility)</option>
                <option value="shipping_update">Shipping Update (Utility)</option>
              </select>
            </div>

            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    validationErrors.templateName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., order_confirmation_2025"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Lowercase letters, numbers, underscores only. Must be unique.
                </p>
                {validationErrors.templateName && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {validationErrors.templateName}</p>
                )}
              </div>

              {/* Category & Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {category === 'UTILITY' && 'Transactional messages'}
                    {category === 'MARKETING' && 'Promotional messages'}
                    {category === 'AUTHENTICATION' && 'OTP & verification'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language *</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="en">English</option>
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="hi">Hindi</option>
                    <option value="it">Italian</option>
                    <option value="pt_BR">Portuguese (BR)</option>
                  </select>
                </div>
              </div>

              {/* Header */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Header (Optional)</label>
                <select
                  value={headerType}
                  onChange={(e) => setHeaderType(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 mb-2"
                >
                  <option value="NONE">None</option>
                  <option value="TEXT">Text</option>
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Document</option>
                </select>
                {headerType === 'TEXT' && (
                  <>
                    <input
                      type="text"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                        validationErrors.headerText ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Header text (max 60 characters)"
                      maxLength={60}
                    />
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">Appears at the top in bold</p>
                      <span className={`text-xs ${headerText.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>
                        {headerText.length}/60
                      </span>
                    </div>
                  </>
                )}
                {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType) && (
                  <p className="text-xs text-amber-600 mt-2">
                    ℹ️ Media headers must be uploaded via Meta Business Manager after template creation
                  </p>
                )}
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Body Text *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    validationErrors.body ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Your message text here. Use {{1}}, {{2}} for variables."
                  rows={5}
                  maxLength={1024}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Use {'{{1}}'}, {'{{2}}'} for dynamic values</p>
                  <span className={`text-xs ${body.length > 1024 ? 'text-red-600' : 'text-gray-500'}`}>
                    {body.length}/1024
                  </span>
                </div>
              </div>

              {/* Variable Samples */}
              {Object.keys(variableSamples).length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Variable Samples * (for Meta review)
                  </label>
                  <div className="space-y-3">
                    {Object.keys(variableSamples).map((variable, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Sample for {variable}
                        </label>
                        <input
                          type="text"
                          value={variableSamples[variable]}
                          onChange={(e) => updateVariableSample(variable, e.target.value)}
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                            validationErrors[`sample_${variable}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder={`Example value for ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ⚠️ Use realistic examples (no real customer data)
                  </p>
                </div>
              )}

              {/* Footer */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Footer (Optional)</label>
                <input
                  type="text"
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                    validationErrors.footer ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Footer text (max 60 characters)"
                  maxLength={60}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">Appears at bottom in gray</p>
                  <span className={`text-xs ${footer.length > 60 ? 'text-red-600' : 'text-gray-500'}`}>
                    {footer.length}/60
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Buttons (Optional, max 10)
                </label>
                <div className="space-y-3">
                  {buttons.map((btn, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-gray-600">Button {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeButton(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      <select
                        value={btn.type}
                        onChange={(e) => updateButton(index, 'type', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="QUICK_REPLY">Quick Reply</option>
                        <option value="URL">URL</option>
                        <option value="PHONE_NUMBER">Phone Number</option>
                      </select>
                      
                      <input
                        type="text"
                        value={btn.text}
                        onChange={(e) => updateButton(index, 'text', e.target.value)}
                        className={`w-full p-2.5 border rounded-lg mb-2 focus:ring-2 focus:ring-teal-500 ${
                          validationErrors[`button_${index}`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Button text (max 25 chars)"
                        maxLength={25}
                      />
                      
                      {btn.type === 'URL' && (
                        <input
                          type="url"
                          value={btn.url || ''}
                          onChange={(e) => updateButton(index, 'url', e.target.value)}
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                            validationErrors[`button_${index}_url`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="https://example.com"
                        />
                      )}
                      
                      {btn.type === 'PHONE_NUMBER' && (
                        <input
                          type="tel"
                          value={btn.phone || ''}
                          onChange={(e) => updateButton(index, 'phone', e.target.value)}
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                            validationErrors[`button_${index}_phone`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="+1234567890"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {buttons.length < 10 && (
                  <button
                    type="button"
                    onClick={addButton}
                    className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                  >
                    + Add Button
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={hasErrors}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    hasErrors
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {hasErrors ? 'Fix Errors to Submit' : 'Create Template'}
                </button>
                {!hasErrors && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Template will be sent to Meta for review (1-2 hours)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            {renderPreview()}

            {/* Best Practices */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Best Practices</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Clear Purpose</h4>
                    <p className="text-xs text-gray-600">Make it clear why you're messaging</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Personalize</h4>
                    <p className="text-xs text-gray-600">Use variables for customer names and details</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Call to Action</h4>
                    <p className="text-xs text-gray-600">Add buttons for easy user response</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Brand Identity</h4>
                    <p className="text-xs text-gray-600">Include footer with company name</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">⚠️ Avoid</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Spam words: "free", "win", "urgent" in UTILITY</li>
                  <li>• ALL CAPS text</li>
                  <li>• Excessive emojis</li>
                  <li>• Misleading content</li>
                  <li>• Requests for personal info (passwords, OTP)</li>
                </ul>
              </div>
            </div>

            {/* Category Guide */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Category Guide</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-semibold text-blue-900">UTILITY</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Order confirmations, shipping updates, account alerts, appointment reminders
                  </p>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900">MARKETING</h4>
                  <p className="text-xs text-purple-700 mt-1">
                    Promotions, sales announcements, product launches, newsletters
                  </p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-900">AUTHENTICATION</h4>
                  <p className="text-xs text-green-700 mt-1">
                    OTP codes, verification codes, password resets, login alerts
                  </p>
                </div>
              </div>
            </div>

            {/* Character Count Summary */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Character Count</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Template Name:</span>
                  <span className={`font-medium ${templateName.length > 512 ? 'text-red-600' : 'text-gray-800'}`}>
                    {templateName.length}/512
                  </span>
                </div>
                
                {headerType === 'TEXT' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Header:</span>
                    <span className={`font-medium ${headerText.length > 60 ? 'text-red-600' : 'text-gray-800'}`}>
                      {headerText.length}/60
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Body:</span>
                  <span className={`font-medium ${body.length > 1024 ? 'text-red-600' : 'text-gray-800'}`}>
                    {body.length}/1024
                  </span>
                </div>
                
                {footer && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Footer:</span>
                    <span className={`font-medium ${footer.length > 60 ? 'text-red-600' : 'text-gray-800'}`}>
                      {footer.length}/60
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-gray-600">Variables:</span>
                  <span className="font-medium text-gray-800">
                    {Object.keys(variableSamples).length}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Buttons:</span>
                  <span className="font-medium text-gray-800">
                    {buttons.filter(b => b.text).length}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Need Help?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Template Approval Time</h4>
              <p className="text-xs text-gray-600">
                Most templates are reviewed within 1-2 hours. Marketing templates may take longer.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Variables Guide</h4>
              <p className="text-xs text-gray-600">
                Use {'{{1}}'} for first variable, {'{{2}}'} for second, etc. Variables must be consecutive.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Button Limits</h4>
              <p className="text-xs text-gray-600">
                Quick Reply: Up to 3 buttons. Call-to-Action (URL/Phone): Up to 2 buttons. Max 10 total.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Rejection Reasons</h4>
              <p className="text-xs text-gray-600">
                Misleading content, spam words, requesting sensitive info, or poor quality examples.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}