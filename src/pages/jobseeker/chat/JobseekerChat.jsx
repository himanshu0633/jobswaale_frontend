import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send
} from 'lucide-react';

const initialConversations = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'HR Manager at Microsoft',
    color: '#e63946',
    initials: 'PS',
    time: '2 min ago',
    unread: 2,
    messages: [
      { id: 1, sender: 'received', text: 'Hi Rahul! Thank you for applying to Frontend Developer at Microsoft.', time: '10:15 AM' },
      { id: 2, sender: 'sent', text: "Thank you! I'm very excited about this opportunity.", time: '10:18 AM' },
      { id: 3, sender: 'received', text: "Great! We've reviewed your portfolio and would like to schedule an interview. Are you available this Friday at 11:00 AM?", time: '10:20 AM' },
      { id: 4, sender: 'sent', text: 'Yes, Friday at 11:00 AM works perfectly for me. Should I prepare for any specific topics?', time: '10:22 AM' },
      { id: 5, sender: 'received', text: "The interview will cover React, JavaScript fundamentals, and a small coding exercise. You'll receive a calendar invite with the meeting link shortly.", time: '10:25 AM' },
      { id: 6, sender: 'received', text: 'Looking forward to speaking with you!', time: '10:26 AM' },
      { id: 7, sender: 'sent', text: 'Perfect, thank you! Looking forward to it too. 😊', time: '10:30 AM' }
    ]
  },
  {
    id: 2,
    name: 'Amit Verma',
    role: 'Recruiter at TCS',
    color: '#1d70b8',
    initials: 'AV',
    time: '1 hour ago',
    unread: 1,
    messages: [
      { id: 1, sender: 'received', text: "We've reviewed your profile and would like to move forward with the next round.", time: '9:10 AM' }
    ]
  },
  {
    id: 3,
    name: 'Neha Gupta',
    role: 'Talent Acquisition at Amazon',
    color: '#8e44ad',
    initials: 'NG',
    time: '3 hours ago',
    unread: 0,
    messages: [
      { id: 1, sender: 'received', text: "Thank you for applying. We'll get back to you soon.", time: '7:45 AM' }
    ]
  },
  {
    id: 4,
    name: 'Ravi Singh',
    role: 'HR at Wipro',
    color: '#e67e22',
    initials: 'RS',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 1, sender: 'received', text: 'Can you confirm your availability for tomorrow?', time: 'Yesterday' }
    ]
  },
  {
    id: 5,
    name: 'Sneha Patel',
    role: 'HR Coordinator at Infosys',
    color: '#2e7d32',
    initials: 'SP',
    time: '2 days ago',
    unread: 0,
    messages: [
      { id: 1, sender: 'received', text: 'Unfortunately, the position has been filled...', time: '2 days ago' }
    ]
  }
];


const getTimeNow = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};


export const JobseekerChat = () => {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0].id);
  const [search, setSearch] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);

  const activeConversation = conversations.find(c => c.id === activeId);

  const filteredConversations = conversations.filter(c => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const lastMessage = c.messages[c.messages.length - 1]?.text || '';
    return (
      c.name.toLowerCase().includes(q) ||
      lastMessage.toLowerCase().includes(q)
    );
  });


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [activeId, activeConversation?.messages.length]);


  const openChat = (id) => {
    setActiveId(id);
    setConversations(prev =>
      prev.map(c => (c.id === id ? { ...c, unread: 0 } : c))
    );
    setMobileView('chat');
  };


  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;

    const newMessage = {
      id: Date.now(),
      sender: 'sent',
      text,
      time: getTimeNow()
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMessage] }
          : c
      )
    );
    setChatInput('');

    // Simulate a reply
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'received',
        text: "Thank you for your message. We'll get back to you shortly.",
        time: getTimeNow()
      };

      setConversations(prev =>
        prev.map(c =>
          c.id === activeId
            ? { ...c, messages: [...c.messages, reply] }
            : c
        )
      );
    }, 1500);
  };


  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };


  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[500px] overflow-hidden rounded-xl border border-[#e2e8f0] bg-white max-md:relative max-md:h-[calc(100vh-140px)] max-md:min-h-[400px]">


      {/* Conversation List */}

      <div
        className={`w-full shrink-0 flex-col border-r border-[#e2e8f0] md:flex md:w-[340px] ${
          mobileView === 'list' ? 'flex' : 'hidden'
        } max-md:absolute max-md:inset-0 max-md:z-[5] max-md:bg-white`}
      >

        <div className="border-b border-[#e2e8f0] p-4">

          <div className="relative">
            <Search className="pointer-events-none absolute left-[0.8rem] top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] py-[0.6rem] pl-[2.4rem] pr-4 text-[0.85rem] text-[#0f172a] outline-none transition-colors focus:border-[#0047C7]"
            />
          </div>

        </div>

        <div className="flex-1 overflow-y-auto">

          {filteredConversations.length === 0 && (
            <div className="p-6 text-center text-sm font-semibold text-[#94a3b8]">
              No conversations found.
            </div>
          )}

          {filteredConversations.map(conv => (

            <button
              key={conv.id}
              type="button"
              onClick={() => openChat(conv.id)}
              className={`flex w-full items-center gap-3 border-b border-[#e2e8f0] px-4 py-[0.85rem] text-left transition-colors ${
                conv.id === activeId ? 'bg-[#eef2ff]' : 'hover:bg-[#f8fafc]'
              }`}
            >

              <div
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                style={{ background: conv.color }}
              >
                {conv.initials}
              </div>

              <div className="min-w-0 flex-1 overflow-hidden">

                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[0.9rem] font-semibold text-[#0f172a]">
                    {conv.name}
                  </span>
                  <span className="shrink-0 text-[0.7rem] font-normal text-[#94a3b8]">
                    {conv.time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 overflow-hidden text-ellipsis">
                  <span className="truncate text-[0.82rem] text-[#94a3b8]">
                    {conv.messages[conv.messages.length - 1]?.text}
                  </span>
                  {conv.unread > 0 && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0047C7] text-[0.6rem] font-bold text-white">
                      {conv.unread}
                    </span>
                  )}
                </div>

              </div>

            </button>

          ))}

        </div>

      </div>




      {/* Chat Main Window */}

      <div
        className={`flex-1 flex-col md:flex ${
          mobileView === 'chat' ? 'flex' : 'hidden'
        } max-md:w-full`}
      >

        {activeConversation ? (

          <>

            {/* Chat Header */}

            <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-[0.85rem]">

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="text-[1.2rem] text-[#0f172a] md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full text-[0.85rem] font-bold text-white"
                  style={{ background: activeConversation.color }}
                >
                  {activeConversation.initials}
                </div>

                <div>
                  <div className="text-[0.95rem] font-semibold text-[#0f172a]">
                    {activeConversation.name}
                  </div>
                  <div className="text-[0.75rem] text-[#10b981]">
                    Online
                  </div>
                </div>

              </div>

              <div className="flex items-center gap-2">
                <button type="button" title="Call" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] transition-all hover:border-[#0047C7] hover:text-[#0047C7]">
                  <Phone className="h-4 w-4" />
                </button>
                <button type="button" title="Video" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] transition-all hover:border-[#0047C7] hover:text-[#0047C7]">
                  <Camera className="h-4 w-4" />
                </button>
                <button type="button" title="More options" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#475569] transition-all hover:border-[#0047C7] hover:text-[#0047C7]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

            </div>


            {/* Messages */}

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#f8fafc] p-5">

              <div className="flex justify-center">
                <span className="rounded-full border border-[#e2e8f0] bg-[#f8fafc] px-4 py-[0.2rem] text-[0.75rem] text-[#94a3b8]">
                  Today
                </span>
              </div>

              {activeConversation.messages.map(msg => (

                <div
                  key={msg.id}
                  className={`flex max-w-[70%] flex-col max-md:max-w-[85%] ${msg.sender === 'sent' ? 'self-end items-end' : 'self-start items-start'}`}
                >

                  <div
                    className={`rounded-2xl px-4 py-[0.7rem] text-[0.88rem] leading-relaxed ${
                      msg.sender === 'sent'
                        ? 'rounded-br-[4px] bg-[#0047C7] text-white'
                        : 'rounded-bl-[4px] border border-[#e2e8f0] bg-white text-[#0f172a]'
                    }`}
                  >
                    {msg.text}
                  </div>

                  <span
                    className={`mt-1 px-1 text-[0.65rem] ${
                      msg.sender === 'sent' ? 'text-black/40' : 'text-[#94a3b8]'
                    }`}
                  >
                    {msg.time}
                  </span>

                </div>

              ))}

              <div ref={messagesEndRef} />

            </div>


            {/* Chat Input */}

            <div className="flex items-center gap-2.5 border-t border-[#e2e8f0] bg-white px-5 py-4">

              <button
                type="button"
                title="Attach file"
                className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#94a3b8] transition-all hover:border-[#0047C7] hover:text-[#0047C7]"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Type your message..."
                className="flex-1 rounded-full border border-[#e2e8f0] px-4 py-[0.65rem] text-[0.88rem] text-[#0f172a] outline-none transition-colors focus:border-[#0047C7]"
              />

              <button
                type="button"
                onClick={sendMessage}
                title="Send message"
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#0047C7] text-white transition-colors hover:bg-[#0039a3]"
              >
                <Send className="h-[1.1rem] w-[1.1rem]" />
              </button>

            </div>

          </>

        ) : (

          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-[#94a3b8]">
            <div className="mb-4 text-[4rem] opacity-40">💬</div>
            <h5 className="mb-2 font-bold text-[#0f172a]">No conversation selected</h5>
            <p className="max-w-[300px] text-[0.9rem]">Select a conversation to start chatting.</p>
          </div>

        )}

      </div>

    </div>
  );
};


export default JobseekerChat;