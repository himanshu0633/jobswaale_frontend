/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Loader,
  Lock,
  Paperclip,
  Reply,
  Search,
  Send,
  X
} from 'lucide-react';
import { BASE_API_URL } from '../../../context/AuthContext';
import { useMessageSocket } from '../../../context/MessageSocketContext';

const getTokenHeaders = () => {
  const token = localStorage.getItem('publicToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const portalConfig = {
  jobseeker: {
    endpoint: `${BASE_API_URL}/jobseeker/messages`,
    emptyTitle: 'No conversations yet',
    emptyText: 'Messages open after an employer shortlists you, schedules an interview, or selects you.'
  },
  employer: {
    endpoint: `${BASE_API_URL}/employer/messages`,
    emptyTitle: 'No candidate conversations yet',
    emptyText: 'Conversations appear for candidates who applied to your active jobs.'
  }
};

const sortThreadsByRecentMessage = (threads = []) => (
  [...threads].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0))
);

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]);
const ALLOWED_ATTACHMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp']);

const formatFileSize = (bytes = 0) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const JobseekerChat = ({ portal = 'jobseeker' }) => {
  const config = portalConfig[portal] || portalConfig.jobseeker;
  const { socket, refreshUnread } = useMessageSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeId, setActiveId] = useState('');
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [mobileView, setMobileView] = useState('list');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const incomingTypingTimerRef = useRef(null);
  const outgoingTypingTimerRef = useRef(null);

  const activeConversation = threads.find(thread => String(thread.id) === String(activeId));

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase().trim();
    return threads.filter(thread => {
      const matchesJob = !jobFilter || String(thread.jobId) === String(jobFilter);
      const matchesSearch = !q || (
        thread.name.toLowerCase().includes(q) ||
        thread.jobTitle.toLowerCase().includes(q) ||
        thread.lastMessage.toLowerCase().includes(q)
      );
      return matchesJob && matchesSearch;
    });
  }, [threads, search, jobFilter]);

  const jobOptions = useMemo(() => {
    const map = new Map();
    threads.forEach(thread => {
      if (thread.jobId && !map.has(String(thread.jobId))) {
        map.set(String(thread.jobId), thread.jobTitle);
      }
    });
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [threads]);

  const loadThreads = async (preferredId = activeId) => {
    setLoadingThreads(true);
    setError('');
    try {
      const response = await axios.get(config.endpoint, { headers: getTokenHeaders() });
      const nextThreads = sortThreadsByRecentMessage(response.data?.threads || []);
      setThreads(nextThreads);
      const nextActive = nextThreads.some(thread => String(thread.id) === String(preferredId))
        ? preferredId
        : '';
      setActiveId(nextActive);
      if (nextActive) {
        setSearchParams({ application: nextActive });
      } else if (searchParams.get('application')) {
        setSearchParams({});
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Messages could not be loaded.');
    } finally {
      setLoadingThreads(false);
    }
  };

  const loadMessages = async (applicationId) => {
    if (!applicationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError('');
    try {
      const response = await axios.get(`${config.endpoint}/${applicationId}`, { headers: getTokenHeaders() });
      setMessages(response.data?.messages || []);
      setThreads(current => sortThreadsByRecentMessage(current.map(thread => (
        String(thread.id) === String(applicationId)
          ? { ...thread, ...(response.data?.thread || {}), unread: 0 }
          : thread
      ))));
    } catch (err) {
      setError(err.response?.data?.message || 'Conversation could not be loaded.');
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadThreads('');
  }, [portal]);

  useEffect(() => {
    loadMessages(activeId);
    setReplyTo(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [activeId]);

  useEffect(() => {
    if (!socket || !activeId) return undefined;
    socket.emit('message:join', { applicationId: activeId });

    return () => {
      socket.emit('message:leave', { applicationId: activeId });
    };
  }, [socket, activeId]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleNewMessage = (payload) => {
      if (String(payload?.applicationId) !== String(activeId)) {
        setThreads(current => sortThreadsByRecentMessage(current.map(thread => (
          String(thread.id) === String(payload?.applicationId)
            ? { ...thread, ...(payload.thread || {}) }
            : thread
        ))));
        return;
      }

      if (payload?.message) {
        setMessages(current => (
          current.some(message => String(message.id) === String(payload.message.id))
            ? current
            : [...current, payload.message]
        ));
      }
      if (payload?.thread) {
        setThreads(current => sortThreadsByRecentMessage(current.map(thread => (
          String(thread.id) === String(payload.applicationId)
            ? { ...thread, ...payload.thread, unread: 0 }
            : thread
        ))));
      }
      setTyping(null);
      loadMessages(payload.applicationId);
    };

    const handleTyping = (payload) => {
      if (String(payload?.applicationId) !== String(activeId)) return;
      if (payload?.actor === portal) return;
      setTyping(payload?.isTyping ? payload.actor : null);
      if (payload?.isTyping) {
        window.clearTimeout(incomingTypingTimerRef.current);
        incomingTypingTimerRef.current = window.setTimeout(() => setTyping(null), 2500);
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:typing', handleTyping);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:typing', handleTyping);
    };
  }, [socket, activeId, portal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [activeId, messages.length]);

  useEffect(() => () => {
    window.clearTimeout(incomingTypingTimerRef.current);
    window.clearTimeout(outgoingTypingTimerRef.current);
  }, []);

  const openChat = (id) => {
    setActiveId(id);
    setSearchParams({ application: id });
    setMobileView('chat');
  };

  const sendMessage = async () => {
    const text = chatInput.trim();
    if ((!text && !selectedFile) || !activeConversation?.canMessage || sending) return;

    setSending(true);
    setError('');
    try {
      socket?.emit('message:typing', { applicationId: activeConversation.id, isTyping: false });
      const payload = new FormData();
      payload.append('message', text);
      if (replyTo?.id) payload.append('replyTo', replyTo.id);
      if (selectedFile) payload.append('attachment', selectedFile);

      const response = await axios.post(
        `${config.endpoint}/${activeConversation.id}`,
        payload,
        { headers: getTokenHeaders() }
      );
      setMessages(current => [...current, response.data.message]);
      setThreads(current => sortThreadsByRecentMessage(current.map(thread => (
        String(thread.id) === String(activeConversation.id)
          ? { ...thread, ...(response.data.thread || {}) }
          : thread
      ))));
      setChatInput('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setReplyTo(null);
      refreshUnread();
    } catch (err) {
      setError(err.response?.data?.message || 'Message could not be sent.');
    } finally {
      setSending(false);
    }
  };

  const emitTyping = (value) => {
    setChatInput(value);
    if (!socket || !activeConversation?.canMessage) return;

    socket.emit('message:typing', {
      applicationId: activeConversation.id,
      isTyping: Boolean(value.trim())
    });

    window.clearTimeout(outgoingTypingTimerRef.current);
    outgoingTypingTimerRef.current = window.setTimeout(() => {
      socket.emit('message:typing', { applicationId: activeConversation.id, isTyping: false });
    }, 1200);
  };

  const handleAttachmentChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type) && !ALLOWED_ATTACHMENT_EXTENSIONS.has(extension)) {
      setError('Only PDF, DOC, DOCX, and image files are allowed.');
      event.target.value = '';
      return;
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setError('Attachment cannot exceed 10 MB.');
      event.target.value = '';
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === 'Enter') sendMessage();
  };

  const getReplyAuthor = (message) => {
    if (!message) return '';
    if (message.sender === 'sent') return 'You';
    return portal === 'employer' ? 'Jobseeker' : 'Employer';
  };

  const renderReplyPreview = (reply, inSentBubble = false) => {
    if (!reply) return null;
    const author = reply.sender === 'sent'
      ? 'You'
      : portal === 'employer' ? 'Jobseeker' : 'Employer';

    return (
      <div className={`mb-2 max-w-full rounded-lg border-l-4 px-3 py-2 text-xs ${
        inSentBubble
          ? 'border-white/70 bg-white/15 text-white/90'
          : 'border-[#0047C7] bg-slate-50 text-slate-600'
      }`}>
        <div className={`mb-0.5 font-black ${inSentBubble ? 'text-white' : 'text-[#0047C7]'}`}>{author}</div>
        <div className="line-clamp-2 break-words">{reply.text}</div>
      </div>
    );
  };

  const renderAttachment = (attachment, inSentBubble = false) => {
    if (!attachment?.url) return null;
    const isImage = attachment.fileType === 'image' || String(attachment.mimeType || '').startsWith('image/');
    const label = attachment.originalName || 'Attachment';

    if (isImage) {
      return (
        <a href={attachment.url} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded-xl">
          <img src={attachment.url} alt={label} className="max-h-64 w-full max-w-[320px] object-cover" />
        </a>
      );
    }

    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noreferrer"
        className={`mt-2 flex max-w-[320px] items-center gap-3 rounded-xl border px-3 py-2 text-xs font-bold transition ${
          inSentBubble
            ? 'border-white/25 bg-white/15 text-white hover:bg-white/20'
            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
        }`}
      >
        <FileText className="h-5 w-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </a>
    );
  };

  const isThreadActive = (id) => String(id) === String(activeId);

  return (
    <div className="chat-page space-y-3">
      {error && (
        <div className="rounded-md border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </div>
      )}

      <div className="chat-shell flex h-[calc(100vh-160px)] min-h-[500px] overflow-hidden rounded-xl border border-slate-200 bg-white max-md:relative max-md:h-[calc(100vh-140px)] max-md:min-h-[400px]">
        <div
          className={`chat-list-panel w-full shrink-0 flex-col border-r border-slate-200 md:flex md:w-[360px] ${
            mobileView === 'list' ? 'flex' : 'hidden'
          } max-md:absolute max-md:inset-0 max-md:z-[5] max-md:bg-white`}
        >
          <div className="chat-list-filters border-b border-slate-200 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-[0.8rem] top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, job, or message..."
                className="chat-control w-full rounded-[10px] border border-slate-200 bg-[#f8fafc] py-[0.6rem] pl-[2.4rem] pr-4 text-[0.85rem] text-[#0f172a] outline-none transition-colors focus:border-[#0047C7]"
              />
            </div>
            <select
              value={jobFilter}
              onChange={(event) => setJobFilter(event.target.value)}
              className="chat-control mt-3 w-full rounded-[10px] border border-slate-200 bg-white px-3 py-[0.6rem] text-[0.85rem] font-semibold text-[#475569] outline-none transition-colors focus:border-[#0047C7]"
            >
              <option value="">All jobs</option>
              {jobOptions.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingThreads ? (
              <div className="flex h-full items-center justify-center">
                <Loader className="h-7 w-7 animate-spin text-[#0047C7]" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm font-extrabold text-[#0f172a]">{config.emptyTitle}</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-[#94a3b8]">{config.emptyText}</p>
              </div>
            ) : (
              filteredThreads.map(thread => {
                const active = isThreadActive(thread.id);
                return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => openChat(thread.id)}
                  className={`chat-thread flex w-full items-center gap-3 border-b border-slate-200 px-4 py-[0.9rem] text-left transition-colors ${active ? 'is-active bg-slate-100' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#0047C7] text-base font-bold text-white">
                    {thread.initials || 'U'}
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className="chat-thread-name truncate text-[0.9rem] font-semibold text-[#0f172a]">{thread.name}</span>
                      <span className="chat-thread-time shrink-0 text-[0.68rem] font-normal text-[#94a3b8]">{thread.time}</span>
                    </div>
                    <div className="chat-thread-job mt-0.5 flex items-center gap-1 text-[0.72rem] font-bold text-[#0047C7]">
                      <Briefcase className="h-3 w-3 shrink-0" />
                      <span className="truncate">{thread.jobTitle}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2 overflow-hidden text-ellipsis">
                      <span className="chat-thread-message truncate text-[0.82rem] text-[#94a3b8]">{thread.lastMessage}</span>
                      {thread.unread > 0 && (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0047C7] text-[0.6rem] font-bold text-white">
                          {thread.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
              })
            )}
          </div>
        </div>

        <div className={`chat-detail-panel flex-1 flex-col md:flex ${mobileView === 'chat' ? 'flex' : 'hidden'} max-md:w-full`}>
          {activeConversation ? (
            <>
              <div className="chat-detail-header flex items-center justify-between border-b border-slate-200 px-5 py-[0.85rem]">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="text-[1.2rem] text-[#0f172a] md:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#0047C7] text-[0.85rem] font-bold text-white">
                    {activeConversation.initials || 'U'}
                  </div>

                  <div>
                    <div className="chat-detail-name text-[0.95rem] font-semibold text-[#0f172a]">{activeConversation.name}</div>
                    <div className="chat-detail-job flex items-center gap-1 text-[0.75rem] font-semibold text-[#64748b]">
                      <Briefcase className="h-3.5 w-3.5" />
                      {activeConversation.jobTitle}
                    </div>
                  </div>
                </div>
                <span className="chat-status rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                  {activeConversation.status}
                </span>
              </div>

              <div className="chat-messages flex flex-1 flex-col gap-4 overflow-y-auto bg-[#f8fafc] p-5">
                {loadingMessages ? (
                  <div className="flex flex-1 items-center justify-center">
                    <Loader className="h-7 w-7 animate-spin text-[#0047C7]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center text-center">
                    <div>
                      <p className="text-sm font-extrabold text-[#0f172a]">No messages yet</p>
                      <p className="mt-1 text-xs font-semibold text-[#94a3b8]">Start the conversation for this job application.</p>
                    </div>
                  </div>
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`group flex max-w-[70%] flex-col max-md:max-w-[85%] ${message.sender === 'sent' ? 'self-end items-end' : 'self-start items-start'}`}
                    >
                      <button
                        type="button"
                        onClick={() => setReplyTo(message)}
                        className="chat-reply-button mb-1 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[0.65rem] font-bold text-[#64748b] opacity-100 shadow-sm ring-1 ring-slate-100 transition hover:text-[#0047C7] md:opacity-0 md:group-hover:opacity-100"
                      >
                        <Reply className="h-3 w-3" />
                        Reply
                      </button>
                      <div
                        className={`rounded-2xl px-4 py-[0.7rem] text-[0.88rem] leading-relaxed ${
                          message.sender === 'sent'
                            ? 'chat-bubble chat-bubble-sent rounded-br-[4px] bg-[#0047C7] text-white'
                            : 'chat-bubble chat-bubble-received rounded-bl-[4px] border border-slate-200 bg-white text-[#0f172a]'
                        }`}
                      >
                        {renderReplyPreview(message.replyTo, message.sender === 'sent')}
                        {message.text && <div className="break-words">{message.text}</div>}
                        {renderAttachment(message.attachment, message.sender === 'sent')}
                      </div>
                      <span className={`chat-message-time mt-1 px-1 text-[0.65rem] ${message.sender === 'sent' ? 'text-black/40' : 'text-[#94a3b8]'}`}>
                        {message.time}
                      </span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-composer border-t border-slate-200 bg-white px-5 py-4">
                {typing && (
                  <div className="mb-2 text-xs font-bold text-[#64748b]">
                    {typing === 'employer' ? 'Employer' : 'Jobseeker'} is typing...
                  </div>
                )}
                {replyTo && (
                  <div className="chat-reply-preview mb-3 flex items-start justify-between gap-3 rounded-xl border border-[#dbeafe] bg-[#eff6ff] px-3 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 text-xs font-black text-[#0047C7]">
                        <Reply className="h-3.5 w-3.5" />
                        Replying to {getReplyAuthor(replyTo)}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs font-semibold text-[#64748b]">{replyTo.text}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="rounded-full p-1 text-[#64748b] transition hover:bg-white hover:text-[#0f172a]"
                      aria-label="Cancel reply"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {!activeConversation.canMessage && (
                  <div className="mb-3 flex items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">
                    <Lock className="h-4 w-4" />
                    {activeConversation.disabledReason || 'Messaging is closed for this application.'}
                  </div>
                )}
                {selectedFile && (
                  <div className="chat-file-preview mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-600">
                      {selectedFile.type.startsWith('image/') ? <ImageIcon className="h-4 w-4 shrink-0" /> : <FileText className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="shrink-0 text-slate-400">{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="rounded-full p-1 text-[#64748b] transition hover:bg-white hover:text-[#0f172a]"
                      aria-label="Remove attachment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAttachmentChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!activeConversation.canMessage || sending}
                    title="Attach file"
                    className="chat-attach-button flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[#64748b] transition-colors hover:border-[#0047C7] hover:text-[#0047C7] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Paperclip className="h-[1.1rem] w-[1.1rem]" />
                  </button>
                  <input
                    type="text"
                    value={chatInput}
                    disabled={!activeConversation.canMessage || sending}
                    onChange={(event) => emitTyping(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={activeConversation.canMessage ? 'Type your message...' : 'Messaging unavailable'}
                    className="chat-input flex-1 rounded-full border border-slate-200 px-4 py-[0.65rem] text-[0.88rem] text-[#0f172a] outline-none transition-colors focus:border-[#0047C7] disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!activeConversation.canMessage || sending || (!chatInput.trim() && !selectedFile)}
                    title="Send message"
                    className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#0047C7] text-white transition-colors hover:bg-[#0039a3] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? <Loader className="h-[1.1rem] w-[1.1rem] animate-spin" /> : <Send className="h-[1.1rem] w-[1.1rem]" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#94a3b8]">
              <h5 className="mb-2 font-bold text-[#0f172a]">No conversation selected</h5>
              <p className="max-w-[300px] text-[0.9rem]">Select a conversation to view job-specific messages.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobseekerChat;
