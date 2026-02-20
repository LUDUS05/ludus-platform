import React, { useState, useEffect, useRef } from 'react';
import { AgentMessage, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateAgentResponse } from '../services/ai';
import { MessageSquare, X, Send, Sparkles, Loader2, Mic } from 'lucide-react';
import { gsap } from 'gsap';

interface AgentProps {
  lang: Language;
}

export const AgentOrchestrator: React.FC<AgentProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Initial Welcome Message
    if (messages.length === 0) {
      setMessages([{
        id: 'init',
        role: 'agent',
        content: t.agent_welcome,
        timestamp: Date.now(),
        type: 'text'
      }]);
    }
  }, [lang, t.agent_welcome]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Open/Close Animation
  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(chatContainerRef.current, 
        { y: 50, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: AgentMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    const responseText = await generateAgentResponse(input, "User is exploring app", lang);

    setIsThinking(false);
    const agentMsg: AgentMessage = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      content: responseText,
      timestamp: Date.now(),
      type: 'text'
    };
    setMessages(prev => [...prev, agentMsg]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-10 end-10 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative w-16 h-16 rounded-[2rem] bg-zinc-900 hover:bg-primary text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:rotate-3"
        >
          {isOpen ? <X size={28} /> : <Sparkles size={28} className="animate-pulse" />}
          
          {/* Status Indicator */}
          <span className="absolute -top-1 -end-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-light opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-primary border-4 border-white"></span>
          </span>
        </button>
      </div>

      {/* Chat Interface */}
      {isOpen && (
        <div 
          ref={chatContainerRef}
          className="fixed bottom-32 end-10 w-[90vw] md:w-[420px] max-h-[650px] h-[70vh] bg-white/80 backdrop-blur-3xl border border-white rounded-[3rem] shadow-2xl z-50 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-7 border-b border-zinc-100 bg-white/40 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                   <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="font-black text-base text-zinc-900 tracking-tight">{t.ai_assistant}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{lang === 'ar' ? 'متصل' : 'Active'}</span>
                  </div>
                </div>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-900 p-2.5 bg-zinc-50 rounded-2xl transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div 
                  className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed font-bold shadow-sm border
                    ${msg.role === 'user' 
                      ? 'bg-zinc-900 text-white border-zinc-900 rounded-br-lg' 
                      : 'bg-white text-zinc-800 border-zinc-100 rounded-bl-lg'
                    }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && (
               <div className="flex justify-end">
                 <div className="bg-white border border-zinc-100 px-6 py-4 rounded-[2rem] rounded-bl-lg flex items-center gap-3 shadow-sm">
                    <Loader2 size={18} className="animate-spin text-primary" />
                    <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{t.agent_typing}</span>
                 </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-7 bg-white/40 border-t border-zinc-100">
             <div className="relative flex items-center group">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'ar' ? 'اكتب رسالتك...' : 'Ask anything...'}
                  className="w-full bg-white border border-zinc-200 rounded-[2rem] py-5 ps-7 pe-28 text-sm text-zinc-900 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-zinc-400 font-bold shadow-inner"
                />
                <div className="absolute end-3 flex items-center gap-1">
                  <button className="p-2.5 text-zinc-400 hover:text-primary transition-colors">
                    <Mic size={22} />
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isThinking}
                    className="p-3 bg-primary hover:bg-primary-hover text-white rounded-[1.2rem] transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <Send size={20} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};