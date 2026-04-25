'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    initializeSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function initializeSession() {
    try {
      const response = await axios.post(`${API_URL}/api/chat/session`);
      setSessionId(response.data.sessionId);

      setMessages([
        {
          role: 'assistant',
          content: 'Olá! Bem-vindo ao nosso suporte. Como posso ajudá-lo hoje? 😊',
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

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ]);

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
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">💬 Suporte ao Cliente</h1>
        <p className="text-blue-100 text-sm">Sessão: {sessionId?.slice(0, 15)}...</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg p-4 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none shadow-md'
              }`}
            >
              <p className="text-sm">{msg.content}</p>

              {/* QR Code PIX */}
              {msg.pixQRCode && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs font-semibold text-gray-700 mb-3">
                    Escaneie o QR Code para pagar R$ {paymentState?.amount?.toFixed(2)}
                  </p>
                  <QRCode value={msg.pixQRCode} size={256} level="H" includeMargin={true} />
                  <p className="text-xs text-gray-500 mt-3">
                    ID: {paymentState?.transactionId}
                  </p>
                </div>
              )}

              {msg.waitingForPayment && (
                <div className="mt-3 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                  <p className="text-xs text-yellow-800">
                    ⏳ Aguardando confirmação do pagamento...
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-4 rounded-lg rounded-bl-none shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t border-gray-300 p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg disabled:bg-gray-400 transition"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}
