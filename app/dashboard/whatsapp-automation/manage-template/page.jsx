'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Trash2, Info, X, Eye, Loader2, Search, Filter, ChevronDown } from 'lucide-react';

export default function ManageTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [message, setMessage] = useState('');

  // Categories for filter
  const categories = ['ALL', 'UTILITY', 'MARKETING', 'AUTHENTICATION'];

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/whatsapp/list-templates', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      
      if (response.ok) {
        setTemplates(data.data || []);
        setMessage('');
      } else {
        setError(data.error || 'Failed to fetch templates');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Delete template
  const deleteTemplate = async (templateId, templateName) => {
    setDeletingTemplate(templateId);
    setMessage('');
    try {
      const response = await fetch(`/api/whatsapp/delete-template/${templateId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      
      if (response.ok) {
        setTemplates(templates.filter(t => t.id !== templateId));
        setMessage(`✅ Template "${templateName}" deleted successfully`);
        setSelectedTemplate(null);
      } else {
        setMessage(`❌ Error: ${data.error || 'Failed to delete template'}`);
      }
    } catch (err) {
      setMessage('❌ Error: Could not connect to server');
    } finally {
      setDeletingTemplate(null);
    }
  };

  // Filtered and searched templates
  const filteredTemplates = templates
    .filter(t => filterStatus === 'ALL' || t.status === filterStatus)
    .filter(t => filterCategory === 'ALL' || t.category === filterCategory)
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Status badge component
  const StatusBadge = ({ status }) => {
    const color = status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                  status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status}
      </span>
    );
  };

  // Quality score badge
  const QualityBadge = ({ score }) => {
    const color = score === 'HIGH' ? 'bg-green-100 text-green-800' : 
                  score === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {score}
      </span>
    );
  };

  // Actions for table row
  const renderActions = (template) => (
    <div className="flex gap-2">
      <button
        onClick={() => {
          setSelectedTemplate(template);
          setShowModal(true);
        }}
        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
        title="Preview"
      >
        <Eye size={16} />
      </button>
      <button
        onClick={() => {
          if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
            deleteTemplate(template.id, template.name);
          }
        }}
        disabled={deletingTemplate === template.id}
        className={`p-1 text-red-600 hover:bg-red-50 rounded ${
          deletingTemplate === template.id ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Delete"
      >
        {deletingTemplate === template.id ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );

  // Render template preview for modal
  const renderPreview = (template) => {
    const bodyComponent = template.components?.find(c => c.type === 'BODY');
    const headerComponent = template.components?.find(c => c.type === 'HEADER');
    const footerComponent = template.components?.find(c => c.type === 'FOOTER');
    const buttonsComponent = template.components?.find(c => c.type === 'BUTTONS');

    let previewBody = bodyComponent?.text || '';
    if (bodyComponent?.example?.body_text?.[0]) {
      bodyComponent.example.body_text[0].forEach((val, idx) => {
        previewBody = previewBody.replace(`{{${idx + 1}}}`, val);
      });
    }

    return (
      <div className="bg-gradient-to-b from-teal-600 to-teal-700 p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4 text-white">
          <span className="font-medium">WhatsApp Preview</span>
          <span className="text-xs bg-teal-800 px-2 py-1 rounded">{template.category}</span>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto overflow-hidden">
          {headerComponent?.format === 'TEXT' && headerComponent.text && (
            <div className="bg-gray-50 px-4 pt-4 pb-2 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">{headerComponent.text}</h3>
            </div>
          )}
          {headerComponent?.format === 'IMAGE' && (
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 h-48 flex items-center justify-center">
              <span className="text-gray-600">📷 Image Header</span>
            </div>
          )}
          {headerComponent?.format === 'VIDEO' && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 h-48 flex items-center justify-center">
              <span className="text-white">🎥 Video Header</span>
            </div>
          )}
          {headerComponent?.format === 'DOCUMENT' && (
            <div className="bg-blue-50 px-4 py-4 flex items-center gap-3 border-b">
              <span className="text-2xl">📄</span>
              <span className="text-blue-900 text-sm font-medium">Document Header</span>
            </div>
          )}
          
          <div className="px-4 py-3">
            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">{previewBody}</p>
          </div>
          
          {footerComponent?.text && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 italic">{footerComponent.text}</p>
            </div>
          )}
          
          {buttonsComponent?.buttons?.length > 0 && (
            <div className="border-t border-gray-200 mt-2">
              {buttonsComponent.buttons.map((btn, idx) => (
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

  // Modal for template details
  const TemplateModal = ({ template, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Template Details: {template.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-6">
          {renderPreview(template)}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Components</h4>
            <div className="space-y-4">
              {template.components?.map((component, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-800">{component.type}</h5>
                  {component.type === 'HEADER' && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Format: {component.format}</p>
                      {component.text && <p>Text: "{component.text}"</p>}
                    </div>
                  )}
                  {component.type === 'BODY' && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Text: "{component.text}"</p>
                      {component.example?.body_text?.[0] && (
                        <div className="mt-2">
                          <p className="font-medium">Sample Values:</p>
                          {component.example.body_text[0].map((val, i) => (
                            <p key={i}>{`{{${i + 1}}}: "${val}"`}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {component.type === 'FOOTER' && (
                    <p className="mt-2 text-sm text-gray-600">Text: "{component.text}"</p>
                  )}
                  {component.type === 'BUTTONS' && (
                    <div className="mt-2">
                      <p className="font-medium text-sm">Buttons:</p>
                      {component.buttons?.map((btn, btnIdx) => (
                        <div key={btnIdx} className="text-sm text-gray-600">
                          {btnIdx + 1}. {btn.type}: "{btn.text}"
                          {btn.url && ` | URL: ${btn.url}`}
                          {btn.phone_number && ` | Phone: ${btn.phone_number}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-600 mt-2">Manage your WhatsApp message templates</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {message && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.includes('Error') || message.includes('❌')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message.includes('✅') ? <CheckCircle size={20} /> : <Info size={20} />}
            {message}
          </div>
        )}

        {/* Header with filters and search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">Templates ({filteredTemplates.length})</h2>
            </div>
            <div className="flex gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
              {/* Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="ALL">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat === 'ALL' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>
              <button
                onClick={fetchTemplates}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Loader2 className={loading ? 'animate-spin' : 'hidden'} size={16} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Templates Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
            <p className="mt-2 text-gray-600">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600">No templates found matching your filters.</p>
            <button
              onClick={fetchTemplates}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => {
                  const createdDate = new Date(template.created_time || Date.now()).toLocaleDateString();
                  const qualityScore = template.quality_score?.score || 'N/A';
                  return (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{template.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{template.language}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={template.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <QualityBadge score={qualityScore} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{createdDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {renderActions(template)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Status Guide</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p><StatusBadge status="APPROVED" /> Ready to send messages</p>
              <p><StatusBadge status="PENDING" /> Under review (1-2 hours)</p>
              <p><StatusBadge status="REJECTED" /> Needs revision</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Use filters to find templates quickly</li>
              <li>• Preview before using in campaigns</li>
              <li>• Delete unused templates to keep organized</li>
            </ul>
          </div>
        </div>
      </div>

      {showModal && selectedTemplate && (
        <TemplateModal template={selectedTemplate} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}