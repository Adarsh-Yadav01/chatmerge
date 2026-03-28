'use client';
import { useState, useEffect } from 'react';
import { Send, Eye, EyeOff, Phone, MessageSquare, FileText, Image, Video, ExternalLink, Reply } from 'lucide-react';

export default function SendMessage() {
  const [phoneNumber, setPhoneNumber] = useState('+918840820604');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [parameters, setParameters] = useState({});
  const [templates, setTemplates] = useState([]);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messageStatus, setMessageStatus] = useState(null);
  const [sentMessageId, setSentMessageId] = useState(null);

  // Fetch approved templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/whatsapp/list-templates');
        const data = await response.json();
        if (response.ok) {
          const approvedTemplates = data.data.filter(t => t.status === 'APPROVED');
          setTemplates(approvedTemplates);
          if (approvedTemplates.length > 0) {
            setSelectedTemplateId(approvedTemplates[0].id);
          }
        } else {
          setMessage(`Error fetching templates: ${data.error}`);
        }
      } catch (error) {
        setMessage('Error: Could not fetch templates');
      }
    };
    fetchTemplates();
  }, []);

  // Update parameters when template changes
  useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplateId);
    setSelectedTemplate(template);
    
    if (template) {
      const bodyComponent = template.components.find(c => c.type === 'BODY');
      const headerComponent = template.components.find(c => c.type === 'HEADER');
      
      const newParams = {};
      
      // Extract body parameters
      if (bodyComponent?.text) {
        const variables = bodyComponent.text.match(/{{[1-9][0-9]*}}/g) || [];
        variables.forEach((variable, index) => {
          const exampleValue = bodyComponent.example?.body_text?.[0]?.[index] || '';
          newParams[variable] = exampleValue;
        });
      }
      
      // Handle header parameters (for DOCUMENT, IMAGE, VIDEO)
      if (headerComponent && ['DOCUMENT', 'IMAGE', 'VIDEO'].includes(headerComponent.format)) {
        newParams['header_url'] = headerComponent.example?.header_handle?.[0] || '';
      }
      
      setParameters(newParams);
    }
  }, [selectedTemplateId, templates]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!selectedTemplate) {
      setMessage('Error: Please select a template');
      return;
    }

    try {
      // Build components array
      const components = [];
      
      // Header component (for media)
      const headerComponent = selectedTemplate.components.find(c => c.type === 'HEADER');
      if (headerComponent && ['DOCUMENT', 'IMAGE', 'VIDEO'].includes(headerComponent.format)) {
        const headerUrl = parameters['header_url'];
        if (headerUrl) {
          components.push({
            type: 'header',
            parameters: [{
              type: headerComponent.format.toLowerCase(),
              [headerComponent.format.toLowerCase()]: {
                link: headerUrl
              }
            }]
          });
        }
      }
      
      // Body component
      const bodyComponent = selectedTemplate.components.find(c => c.type === 'BODY');
      if (bodyComponent?.text) {
        const variables = bodyComponent.text.match(/{{[1-9][0-9]*}}/g) || [];
        if (variables.length > 0) {
          components.push({
            type: 'body',
            parameters: variables.map(v => ({
              type: 'text',
              text: parameters[v] || ''
            }))
          });
        }
      }

      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: phoneNumber,
          templateName: selectedTemplate.name,
          language: selectedTemplate.language,
          components: components.length > 0 ? components : undefined,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        const msgId = data.messages[0].id;
        setSentMessageId(msgId);
        setMessageStatus({
          id: msgId,
          status: 'sent',
          timestamp: new Date().toISOString(),
          to: phoneNumber
        });
        setMessage(`✅ Message sent successfully! ID: ${msgId}`);
      } else {
        setMessageStatus({
          status: 'failed',
          error: data.error?.message || 'Failed to send message',
          timestamp: new Date().toISOString()
        });
        setMessage(`❌ Error: ${data.error?.message || 'Failed to send message'}`);
      }
    } catch (error) {
      setMessageStatus({
        status: 'failed',
        error: 'Could not connect to server',
        timestamp: new Date().toISOString()
      });
      setMessage('❌ Error: Could not connect to server or send message');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'failed': return '✗';
      default: return '○';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'sent': return 'text-gray-500';
      case 'delivered': return 'text-gray-500';
      case 'read': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const renderMessageStatus = () => {
    if (!messageStatus) return null;

    return (
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MessageSquare size={16} />
          Message Status
        </h3>
        
        <div className="space-y-2">
          {/* Status Info */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Status:</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-medium ${getStatusColor(messageStatus.status)}`}>
                {getStatusIcon(messageStatus.status)} {messageStatus.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Message ID */}
          {messageStatus.id && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Message ID:</span>
              <span className="text-xs font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">
                {messageStatus.id.substring(0, 20)}...
              </span>
            </div>
          )}

          {/* Recipient */}
          {messageStatus.to && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Sent to:</span>
              <span className="text-xs font-medium text-gray-800">
                {messageStatus.to}
              </span>
            </div>
          )}

          {/* Timestamp */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Time:</span>
            <span className="text-xs text-gray-800">
              {new Date(messageStatus.timestamp).toLocaleString()}
            </span>
          </div>

          {/* Error Message */}
          {messageStatus.error && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-red-600 font-medium">
                Error: {messageStatus.error}
              </span>
            </div>
          )}

          {/* Status Legend */}
          {messageStatus.status !== 'failed' && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Status Legend:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">✓</span>
                  <span className="text-gray-600">Sent to WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">✓✓</span>
                  <span className="text-gray-600">Delivered to recipient</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-blue-500">✓✓</span>
                  <span className="text-gray-600">Read by recipient</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWhatsAppPreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="bg-white p-8 rounded-xl shadow-lg flex items-center justify-center h-96 text-gray-400">
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">No template selected</p>
            <p className="text-sm mt-2">Select a template to see preview</p>
          </div>
        </div>
      );
    }

    const headerComponent = selectedTemplate.components.find(c => c.type === 'HEADER');
    const bodyComponent = selectedTemplate.components.find(c => c.type === 'BODY');
    const footerComponent = selectedTemplate.components.find(c => c.type === 'FOOTER');
    const buttonsComponent = selectedTemplate.components.find(c => c.type === 'BUTTONS');

    // Replace variables in body text
    let previewBody = bodyComponent?.text || '';
    Object.keys(parameters).forEach(v => {
      if (v !== 'header_url') {
        previewBody = previewBody.replace(
          new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
          parameters[v] || `[${v}]`
        );
      }
    });

    return (
      <div className="bg-gradient-to-b from-teal-600 to-teal-700 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4 text-white">
          <MessageSquare size={20} />
          <span className="font-medium">WhatsApp Preview</span>
        </div>
        
        {/* WhatsApp Message Bubble */}
        <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto overflow-hidden">
          {/* Header */}
          {headerComponent && (
            <>
              {headerComponent.format === 'TEXT' && headerComponent.text && (
                <div className="bg-gray-50 px-4 pt-4 pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-base text-gray-900">{headerComponent.text}</h3>
                </div>
              )}
              {headerComponent.format === 'IMAGE' && (
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex flex-col items-center justify-center text-gray-600">
                  <Image size={48} className="mb-2" />
                  <span className="text-sm font-medium">Image Header</span>
                  {parameters['header_url'] && (
                    <span className="text-xs mt-1 px-2 py-1 bg-white rounded">Media attached</span>
                  )}
                </div>
              )}
              {headerComponent.format === 'VIDEO' && (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex flex-col items-center justify-center text-white">
                  <Video size={48} className="mb-2" />
                  <span className="text-sm font-medium">Video Header</span>
                  {parameters['header_url'] && (
                    <span className="text-xs mt-1 px-2 py-1 bg-gray-700 rounded">Media attached</span>
                  )}
                </div>
              )}
              {headerComponent.format === 'DOCUMENT' && (
                <div className="bg-blue-50 px-4 py-4 flex items-center gap-3 border-b border-blue-100">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Document</p>
                    {parameters['header_url'] && (
                      <p className="text-xs text-blue-600 mt-0.5">PDF attached</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Body */}
          <div className="px-4 py-3">
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{previewBody}</p>
          </div>

          {/* Footer */}
          {footerComponent?.text && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 italic">{footerComponent.text}</p>
            </div>
          )}

          {/* Buttons */}
          {buttonsComponent?.buttons && buttonsComponent.buttons.length > 0 && (
            <div className="border-t border-gray-200 mt-2">
              {buttonsComponent.buttons.map((btn, idx) => {
                let icon = null;
                let buttonStyle = "w-full text-center py-3 text-teal-600 font-medium text-sm hover:bg-gray-50 border-b border-gray-200 last:border-b-0 flex items-center justify-center gap-2 transition-colors";
                
                if (btn.type === 'PHONE_NUMBER') {
                  icon = <Phone size={16} />;
                } else if (btn.type === 'URL') {
                  icon = <ExternalLink size={16} />;
                } else if (btn.type === 'QUICK_REPLY') {
                  icon = <Reply size={16} />;
                }
                
                return (
                  <button key={idx} className={buttonStyle}>
                    {icon}
                    <span>{btn.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* WhatsApp timestamp */}
          <div className="px-4 pb-2 pt-1 text-right">
            <span className="text-xs text-gray-400">
              {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Template Info Card */}
        <div className="mt-4 bg-teal-800 bg-opacity-50 rounded-lg p-3 text-white text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="font-medium opacity-75">Template:</span>
            <span className="font-semibold">{selectedTemplate.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium opacity-75">Category:</span>
            <span className="capitalize">{selectedTemplate.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium opacity-75">Language:</span>
            <span className="uppercase">{selectedTemplate.language}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium opacity-75">Status:</span>
            <span className="bg-green-500 px-2 py-0.5 rounded text-white font-medium">
              {selectedTemplate.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderParameterInputs = () => {
    const paramKeys = Object.keys(parameters).filter(k => k !== 'header_url');
    
    if (paramKeys.length === 0 && !parameters['header_url']) {
      return (
        <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">
          ℹ️ This template has no parameters
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* Header Media URL */}
        {parameters['header_url'] !== undefined && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-sm font-semibold text-blue-900 mb-2">
              📎 Header Media URL
            </label>
            <input
              type="url"
              value={parameters['header_url']}
              onChange={(e) => setParameters(prev => ({ ...prev, header_url: e.target.value }))}
              className="w-full p-2.5 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="https://example.com/file.pdf"
              required
            />
            <p className="text-xs text-blue-600 mt-1.5">
              {selectedTemplate?.components.find(c => c.type === 'HEADER')?.format} file URL
            </p>
          </div>
        )}

        {/* Body Parameters */}
        {paramKeys.length > 0 && (
          <>
            <label className="block text-sm font-semibold text-gray-700">
              📝 Message Parameters
            </label>
            {paramKeys.map((variable, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Parameter {variable}
                </label>
                <input
                  type="text"
                  value={parameters[variable]}
                  onChange={(e) => setParameters(prev => ({ ...prev, [variable]: e.target.value }))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder={`Enter value for ${variable}`}
                  required
                />
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-full mb-4">
            <MessageSquare size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WhatsApp Message Sender</h1>
          <p className="text-gray-600">Send template messages with live preview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Configuration */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
              <span className="text-teal-600">⚙️</span> Message Configuration
            </h2>
            
            <div className="space-y-6">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📱 Recipient Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="e.g., +918840820604"
                  required
                />
                <p className="text-xs text-gray-500 mt-1.5">International format with country code</p>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📋 Select Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.language}) - {t.category}
                    </option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5">⚠️ No templates available</p>
                )}
              </div>

              {/* Parameters */}
              {selectedTemplate && (
                <div>
                  {renderParameterInputs()}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPreview(!preview)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  {preview ? <EyeOff size={20} /> : <Eye size={20} />}
                  {preview ? 'Hide' : 'Show'} Preview
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!selectedTemplate}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <Send size={20} />
                  Send Message
                </button>
              </div>
            </div>

            {/* Status Message */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-lg text-sm font-medium ${
                  message.includes('Error') || message.includes('❌')
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {message}
              </div>
            )}
          </div>

          {/* Right Side - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            {preview ? (
              renderWhatsAppPreview()
            ) : (
              <div className="bg-white p-8 rounded-xl shadow-lg flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Preview Hidden</p>
                  <p className="text-sm mt-2">Click "Show Preview" to see the template</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}