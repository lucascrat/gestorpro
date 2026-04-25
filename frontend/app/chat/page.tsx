'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  pixQRCode?: string;
  waitingForPayment?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function initializeSession() {
    try {
      const response = await axios.post(`${API_URL}/api/chat/session`);
      setSessionId(response.data.sessionId);
      setMessages([
        {
          role: 'assistant',
          content: 'Olá! Bem-vindo(a) ao nosso suporte. Como posso te ajudar hoje?',
        },
      ]);
    } catch (error) {
      console.error('Erro ao inicializar sessão:', error);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !sessionId) return;

    const userMessage = input;
    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await axios.post(`${API_URL}/api/chat/message`, {
        sessionId,
        message: userMessage,
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.data.content,
        pixQRCode: response.data.pixQRCode,
        waitingForPayment: response.data.waitingForPayment,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (response.data.pixQRCode) {
        setPaymentState({
          transactionId: response.data.transactionId,
          amount: response.data.amount,
          qrCode: response.data.pixQRCode,
        });
      }
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Desculpe, ocorreu um erro. Pode tentar novamente?',
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden animated-gradient">
      {/* Blobs */}
      <div className="absolute -top-40 -left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob pointer-events-none" />
      <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-blob animation-delay-2000 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 glass border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">Suporte Gestor</h1>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
                <p className="text-[11px] text-slate-400">Online · IA Gemini</p>
              </div>
            </div>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            ← Início
          </Link>
        </div>
      </header>

      {/* Mensagens */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 mt-1 shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-md lg:max-w-lg ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-indigo-500/20'
                    : 'glass text-slate-100 rounded-2xl rounded-bl-sm'
                } px-4 py-3`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {msg.pixQRCode && (
                  <div className="mt-4 p-5 rounded-2xl bg-white text-slate-900 shadow-inner">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold">
                        R$ {paymentState?.amount?.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-xl flex justify-center">
                      <QRCodeSVG value={msg.pixQRCode} size={200} level="H" includeMargin={false} />
                    </div>
                    <p className="text-[10px] text-slate-500 text-center mt-3 font-mono">
                      ID: {paymentState?.transactionId?.slice(0, 16)}...
                    </p>
                  </div>
                )}

                {msg.waitingForPayment && (
                  <div className="mt-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <p className="text-xs text-amber-300 font-medium">Aguardando confirmação...</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 mt-1 shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" style={{ animationDelay: '0.15s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="relative z-10 glass border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                disabled={loading}
                className="w-full px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-[10px] text-slate-500 text-center mt-2">
            Sessão segura · {sessionId?.slice(0, 8)}...
          </p>
        </div>
      </div>
    </div>
  );
}
