import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, Upload, Check, AlertCircle } from 'lucide-react';
import { BASE_API_URL } from '../context/AuthContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const SendOfferModal = ({ isOpen, onClose, applicationId, candidateEmail, candidateName, onSuccess }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [offerFile, setOfferFile] = useState(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      setError('');
      setSuccessMsg('');
      setSubject('');
      setMessage('');
      setOfferFile(null);
      setSaveAsTemplate(false);
      setTemplateName('');
      setSelectedTemplateId('');
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const response = await axios.get(`${BASE_API_URL}/employer/email-templates`, {
        headers: getTokenHeaders()
      });
      setTemplates(response.data || []);
    } catch (err) {
      console.error('Error fetching email templates:', err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplateId(templateId);
    if (!templateId) {
      setSubject('');
      setMessage('');
      return;
    }
    const template = templates.find((t) => t._id === templateId);
    if (template) {
      setSubject(template.subject || '');
      setMessage(template.body || '');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        setOfferFile(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size cannot exceed 10 MB.');
        setOfferFile(null);
        return;
      }
      setError('');
      setOfferFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Subject and message are required.');
      return;
    }
    if (saveAsTemplate && !templateName.trim()) {
      setError('Please provide a name for the new template.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('saveAsTemplate', saveAsTemplate);
      if (saveAsTemplate) {
        formData.append('templateName', templateName);
      }
      if (offerFile) {
        formData.append('offerFile', offerFile);
      }

      await axios.post(
        `${BASE_API_URL}/employer/applications/${applicationId}/send-offer`,
        formData,
        {
          headers: {
            ...getTokenHeaders(),
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccessMsg('Offer sent successfully to the candidate!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h3 className="text-sm font-extrabold text-[#3f4254] sm:text-base">Send Offer Letter</h3>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">Send a custom offer email with PDF attachment to {candidateName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-5">
          {error && (
            <div className="mb-4 rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-md border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Candidate Email Display */}
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Candidate Email ID</label>
              <input
                type="text"
                disabled
                value={candidateEmail || ''}
                className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500 outline-none"
              />
            </div>

            {/* Template Selector */}
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">
                Choose Email Template {templatesLoading && <Loader className="inline h-3 w-3 animate-spin text-[#6658dd] ml-1" />}
              </label>
              <select
                disabled={loading || templatesLoading}
                value={selectedTemplateId}
                onChange={handleTemplateChange}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-[#6658dd] disabled:opacity-60"
              >
                <option value="">-- Custom Email (No Template) --</option>
                {templates.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Input */}
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Email Subject</label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g. Offer of Employment - Software Engineer"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] disabled:opacity-60"
              />
            </div>

            {/* Message Body Input */}
            <div>
              <label className="mb-1 block text-xs font-extrabold text-slate-500">Email Message / Cover Body</label>
              <textarea
                rows="6"
                required
                disabled={loading}
                placeholder="Write your email body or details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#6658dd] disabled:opacity-60"
              />
            </div>

            {/* PDF Uploader */}
            <div>
              <label className="mb-1.5 block text-xs font-extrabold text-slate-500">Attach Offer Letter (PDF only, Max 10MB)</label>
              <div className="flex items-center gap-3">
                <label className={`flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 hover:bg-slate-50 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="h-4 w-4 text-slate-400" />
                  <span>Choose PDF File</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    disabled={loading}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <span className="text-xs font-semibold text-slate-500 truncate max-w-[280px]">
                  {offerFile ? offerFile.name : 'No file attached'}
                </span>
              </div>
            </div>

            {/* Save as Template Option */}
            <div className="border-t border-slate-100 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="rounded border-slate-300 text-[#6658dd] focus:ring-[#6658dd]"
                />
                <span className="text-xs font-extrabold text-slate-600">Save this message as a template</span>
              </label>
              
              {saveAsTemplate && (
                <div className="mt-3">
                  <label className="mb-1 block text-xs font-extrabold text-slate-500">Template Name</label>
                  <input
                    type="text"
                    required
                    disabled={loading}
                    placeholder="e.g. Standard Developer Offer"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#6658dd]"
                  />
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 pt-3 sm:flex-row">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="h-10 rounded-md bg-slate-100 px-5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:opacity-60"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#6658dd] px-6 text-sm font-extrabold text-white transition hover:bg-[#5848d8] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Sending Offer...</span>
                  </>
                ) : (
                  <span>Send Offer & Select</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
