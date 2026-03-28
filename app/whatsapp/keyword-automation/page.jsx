'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Key,
  MessageSquare,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function KeywordAutomation() {
  const { data: session, status } = useSession();
  const [automations, setAutomations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [incomingMessages, setIncomingMessages] = useState([]);
  const [messageStatuses, setMessageStatuses] = useState([]);
  const [showMessages, setShowMessages] = useState(true); // Expanded by default
  const [showStatuses, setShowStatuses] = useState(true); // Expanded by default
  const [messagesPage, setMessagesPage] = useState(1);
  const [statusesPage, setStatusesPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [statusesTotal, setStatusesTotal] = useState(0);
  const [messagesLimit] = useState(10);
  const [statusesLimit] = useState(10);

  const [formData, setFormData] = useState({
    keyword: '',
    matchType: 'exact',
    templateId: '',
    templateName: '',
    language: '',
    parameters: {},
    isActive: true,
    priority: 0,
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      console.log('Fetching data for user:', session.user.id);
      fetchTemplates();
      fetchAutomations();
      fetchIncomingMessages(messagesPage);
      fetchMessageStatuses(statusesPage);
    }
  }, [status, session, messagesPage, statusesPage]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/whatsapp/list-templates');
      const data = await response.json();
      if (response.ok) {
        setTemplates(data.data.filter((t) => t.status === 'APPROVED'));
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      setMessage('Error fetching templates');
    }
  };

  const fetchAutomations = async () => {
    try {
      const response = await fetch('/api/whatsapp/keyword-automation');
      const data = await response.json();
      if (response.ok) {
        setAutomations(data.data);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching automations:', error);
      setMessage('Error fetching automations');
    }
  };

  const fetchIncomingMessages = async (page) => {
    try {
      const response = await fetch(`/api/whatsapp/incoming-messages?page=${page}&limit=${messagesLimit}`);
      const data = await response.json();
      if (response.ok) {
        console.log('Incoming messages fetched:', data.data);
        setIncomingMessages(data.data);
        setMessagesTotal(data.total);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching incoming messages:', error);
      setMessage('Error fetching incoming messages');
    }
  };

  const fetchMessageStatuses = async (page) => {
    try {
      const response = await fetch(`/api/whatsapp/message-statuses?page=${page}&limit=${statusesLimit}`);
      const data = await response.json();
      if (response.ok) {
        console.log('Message statuses fetched:', data.data);
        setMessageStatuses(data.data);
        setStatusesTotal(data.total);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error fetching message statuses:', error);
      setMessage('Error fetching message statuses');
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const bodyComponent = template.components.find((c) => c.type === 'BODY');
      const headerComponent = template.components.find((c) => c.type === 'HEADER');

      const params = {};

      if (bodyComponent?.text) {
        const variables = bodyComponent.text.match(/{{[1-9][0-9]*}}/g) || [];
        variables.forEach((variable, index) => {
          const exampleValue = bodyComponent.example?.body_text?.[0]?.[index] || '';
          params[variable] = exampleValue;
        });
      }

      if (headerComponent && ['DOCUMENT', 'IMAGE', 'VIDEO'].includes(headerComponent.format)) {
        params['header_url'] = headerComponent.example?.header_handle?.[0] || '';
        params['header_type'] = headerComponent.format.toLowerCase();
      }

      setFormData((prev) => ({
        ...prev,
        templateId: template.id,
        templateName: template.name,
        language: template.language,
        parameters: params,
      }));
    }
  };

  const handleSave = async () => {
    if (status !== 'authenticated') {
      setMessage('Error: You must be logged in to save automations');
      return;
    }

    try {
      const url = '/api/whatsapp/keyword-automation';
      const method = editingId ? 'PUT' : 'POST';
      const payload = editingId ? { ...formData, id: editingId } : { ...formData, userId: session.user.id };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Automation ${editingId ? 'updated' : 'created'} successfully!`);
        fetchAutomations();
        resetForm();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving automation:', error);
      setMessage('Error saving automation');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;

    try {
      const response = await fetch(`/api/whatsapp/keyword-automation?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Automation deleted successfully!');
        fetchAutomations();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting automation:', error);
      setMessage('Error deleting automation');
    }
  };

  const handleEdit = (automation) => {
    setEditingId(automation.id);
    setIsAddingNew(true);
    setFormData({
      keyword: automation.keyword,
      matchType: automation.matchType,
      templateId: automation.templateId,
      templateName: automation.templateName,
      language: automation.language,
      parameters: automation.parameters ? JSON.parse(automation.parameters) : {},
      isActive: automation.isActive,
      priority: automation.priority,
    });
  };

  const handleToggleActive = async (automation) => {
    try {
      const response = await fetch('/api/whatsapp/keyword-automation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: automation.id,
          isActive: !automation.isActive,
        }),
      });

      if (response.ok) {
        fetchAutomations();
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error toggling automation:', error);
      setMessage('Error toggling automation');
    }
  };

  const resetForm = () => {
    setFormData({
      keyword: '',
      matchType: 'exact',
      templateId: '',
      templateName: '',
      language: '',
      parameters: {},
      isActive: true,
      priority: 0,
    });
    setIsAddingNew(false);
    setEditingId(null);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Please log in to manage automations
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Key size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Keyword Automation</h1>
          <p className="text-gray-600">Manage automated responses and view message activity</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Add New Button */}
        {!isAddingNew && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="mb-6 flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Add New Automation
          </button>
        )}

        {/* Add/Edit Form */}
        {isAddingNew && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">{editingId ? 'Edit Automation' : 'New Automation'}</h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keyword</label>
                <input
                  type="text"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., hello, price, support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
                <select
                  value={formData.matchType}
                  onChange={(e) => setFormData({ ...formData, matchType: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="exact">Exact Match</option>
                  <option value="contains">Contains</option>
                  <option value="startsWith">Starts With</option>
                  <option value="endsWith">Ends With</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.language})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">Higher priority checked first</p>
              </div>
            </div>

            {Object.keys(formData.parameters).length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Parameters</label>
                <div className="space-y-2">
                  {Object.entries(formData.parameters).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs text-gray-600 mb-1">{key}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            parameters: { ...formData.parameters, [key]: e.target.value },
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={!formData.keyword || !formData.templateId}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Save size={20} />
                {editingId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Automations List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Active Automations</h2>
          </div>

          {automations.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>No automations configured yet</p>
              <p className="text-sm mt-2">Click "Add New Automation" to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {automations.map((automation) => (
                <div key={automation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {automation.keyword}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {automation.matchType}
                        </span>
                        {automation.isActive ? (
                          <CheckCircle size={18} className="text-green-500" />
                        ) : (
                          <XCircle size={18} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-medium">Template:</span> {automation.templateName} ({automation.language})
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Priority:</span> {automation.priority}
                      </p>
                      {automation.parameters && (
                        <div className="mt-2">
                          <details className="text-xs text-gray-600">
                            <summary className="cursor-pointer font-medium">View Parameters</summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                              {JSON.stringify(JSON.parse(automation.parameters), null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(automation)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          automation.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {automation.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => handleEdit(automation)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(automation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <span className="font-semibold">How it works:</span> When a user sends a message that{' '}
                      <span className="font-medium">
                        {automation.matchType === 'exact'
                          ? 'exactly matches'
                          : automation.matchType === 'contains'
                          ? 'contains'
                          : automation.matchType === 'startsWith'
                          ? 'starts with'
                          : 'ends with'}
                      </span>{' '}
                      the keyword "<span className="font-medium">{automation.keyword}</span>", the template "
                      <span className="font-medium">{automation.templateName}</span>" will be automatically sent.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Messages Section */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <button
            onClick={() => {
              console.log('Toggling Incoming Messages, showMessages:', !showMessages);
              setShowMessages(!showMessages);
            }}
            className="w-full p-6 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Incoming Messages</h2>
              {incomingMessages.length > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {incomingMessages.length}
                </span>
              )}
            </div>
            {showMessages ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showMessages && (
            <div className="p-6">
              {console.log('Rendering Incoming Messages:', incomingMessages)}
              {incomingMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No incoming messages yet</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {incomingMessages.map((msg) => (
                      <div key={msg.id} className="py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">From:</span> {msg.fromPhone}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Message:</span> {msg.textBody || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Type:</span> {msg.messageType}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Received:</span>{' '}
                              {new Date(msg.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setMessagesPage((prev) => Math.max(prev - 1, 1))}
                      disabled={messagesPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>
                    <p className="text-sm text-gray-600">
                      Page {messagesPage} of {Math.ceil(messagesTotal / messagesLimit)}
                    </p>
                    <button
                      onClick={() => setMessagesPage((prev) => prev + 1)}
                      disabled={messagesPage * messagesLimit >= messagesTotal}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Message Statuses Section */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <button
            onClick={() => {
              console.log('Toggling Message Statuses, showStatuses:', !showStatuses);
              setShowStatuses(!showStatuses);
            }}
            className="w-full p-6 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Message Statuses</h2>
              {messageStatuses.length > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                  {messageStatuses.length}
                </span>
              )}
            </div>
            {showStatuses ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
          {showStatuses && (
            <div className="p-6">
              {console.log('Rendering Message Statuses:', messageStatuses)}
              {messageStatuses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No message statuses yet</p>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-200">
                    {messageStatuses.map((status) => (
                      <div key={status.id} className="py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Message ID:</span> {status.messageId}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Recipient:</span> {status.recipientPhone}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Status:</span> {status.status}
                            </p>
                            {status.error && (
                              <p className="text-sm text-red-600">
                                <span className="font-medium">Error:</span> {status.error}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Updated:</span>{' '}
                              {new Date(status.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setStatusesPage((prev) => Math.max(prev - 1, 1))}
                      disabled={statusesPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>
                    <p className="text-sm text-gray-600">
                      Page {statusesPage} of {Math.ceil(statusesTotal / statusesLimit)}
                    </p>
                    <button
                      onClick={() => setStatusesPage((prev) => prev + 1)}
                      disabled={statusesPage * statusesLimit >= statusesTotal}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Next
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* How to Use Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">How to Use Keyword Automation</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Set Keywords</h4>
                <p className="text-sm text-gray-600">Choose keywords that users might send (e.g., "hello", "price", "support", "menu")</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Choose Match Type</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Exact:</span> "hello" matches only "hello" <br />
                  <span className="font-medium">Contains:</span> "hello" matches "hello there", "say hello" <br />
                  <span className="font-medium">Starts With:</span> "hello" matches "hello world" <br />
                  <span className="font-medium">Ends With:</span> "world" matches "hello world"
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Select Template</h4>
                <p className="text-sm text-gray-600">Choose which WhatsApp template to send when the keyword is matched</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Set Priority</h4>
                <p className="text-sm text-gray-600">If multiple keywords match, higher priority automations will be triggered first</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Configure Parameters</h4>
                <p className="text-sm text-gray-600">Fill in template parameters that will be sent with the message</p>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Note:</span> Keywords are case-insensitive. "Hello", "HELLO", and "hello" all match the same keyword.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}