/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  Sparkles, 
  HelpCircle, 
  MessageSquare, 
  AlertTriangle, 
  ThumbsUp, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AiAssistantProps {
  userId?: string;
}

export default function AiAssistant({ userId }: AiAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello! I am the **Community Hero AI Assistant**, powered by Gemini. 

I can help you:
1. Check the live status of reported complaints in your neighborhood.
2. Locate municipal contact information.
3. Understand civic incentives under our **Clean City Initiative**.

Try clicking any of the quick-assist template questions below, or type your query in the field.`,
      createdAt: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickPrompts = [
    'What is the status of the 14th Street Pothole?',
    'What phone numbers should I call for road repairs?',
    'How do I earn reward points and badges?',
    'Show me active AI predictive hotspots'
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsGenerating(true);

    try {
      const updatedMessages = [...messages, userMsg];
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: updatedMessages,
          userId: userId || 'user_alex'
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        const modelMsg: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          role: 'model',
          content: data.content,
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, modelMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substr(2, 9),
          role: 'model',
          content: 'I apologize, but my core AI connection is currently experiencing high load. Please try checking back in a short moment!',
          createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen flex flex-col">
      
      {/* Header title */}
      <div className="space-y-1.5 border-b border-slate-200 dark:border-slate-850 pb-5 shrink-0 text-left">
        <div className="inline-flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider">
          <Brain className="h-3.5 w-3.5 animate-pulse" />
          <span>Gemini AI Copilot</span>
        </div>
        <h1 className="font-display text-2.5xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Community Hero AI Assistant
        </h1>
        <p className="font-sans text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Ask questions about localized infrastructure damage, trace maintenance crew status, discover municipal directory hotline details, or consult civic incentive schemes.
        </p>
      </div>

      {/* Main Chat split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        
        {/* Chat Thread Container */}
        <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm min-h-[400px]">
          
          {/* Messages block */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 max-h-[360px] pr-2 pb-4 text-left">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div 
                  key={msg.id}
                  className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200/20'
                  }`}>
                    {isUser ? <UserIcon /> : <Brain className="h-4.5 w-4.5" />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 border text-xs leading-relaxed space-y-1 ${
                    isUser 
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-300 border-slate-200/50 dark:border-slate-850 rounded-tl-none'
                  }`}>
                    {/* Render message with basic markdown linebreaks and bold styles */}
                    <div className="whitespace-pre-line font-sans space-y-2">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => (
                        <p key={pIdx}>
                          {paragraph.split('**').map((textPart, partIdx) => {
                            if (partIdx % 2 === 1) {
                              return <strong key={partIdx} className="font-extrabold text-blue-700 dark:text-blue-400">{textPart}</strong>;
                            }
                            return textPart;
                          })}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {isGenerating && (
              <div className="flex items-start gap-3.5">
                <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/20 shrink-0">
                  <Brain className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl px-4 py-3 border border-slate-200/50 dark:border-slate-850 rounded-tl-none flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-150" />
                  <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce delay-300" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Typing input bar */}
          <div className="border-t border-slate-100 dark:border-slate-850/60 pt-4 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
              placeholder="Ask about 14th street, Clean City rules..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 py-2.5 px-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-blue-500 transition-all"
            />
            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={isGenerating}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 p-2.5 text-white transition-all disabled:opacity-50 shrink-0 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Hand: Quick Prompt helpers list */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center space-x-1 text-slate-400">
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span className="font-mono text-[9px] uppercase font-bold tracking-wide">Quick Assistant Templates</span>
          </div>
          
          <div className="space-y-2.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="w-full rounded-xl border border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-750 p-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>{prompt}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150/40 dark:border-slate-900 text-center space-y-2">
            <Activity className="h-5 w-5 text-indigo-500 mx-auto animate-pulse" />
            <h4 className="font-display font-bold text-slate-950 dark:text-white text-[11px]">Dynamic Knowledge Sync</h4>
            <p className="font-sans text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
              Gemini reads live server-side database records. Updates to tickets are instantly searchable in the chat above.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

// Minimal user icon SVG helper
function UserIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
