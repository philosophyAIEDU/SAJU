import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Autofocus when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="mt-8 bg-[#fffcf5] rounded-xl shadow-xl overflow-hidden border border-amber-200 flex flex-col h-[600px] animate-fade-in-up">
      <div className="bg-[#4a4036] p-4 text-amber-50 border-b border-amber-800 flex justify-between items-center shadow-md">
        <div className="flex items-center space-x-3">
           <div className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center text-xl border border-amber-600">
             🧙‍♂️
           </div>
           <div>
             <h3 className="font-serif font-bold text-lg leading-tight">박운명 코치</h3>
             <p className="text-xs text-amber-200/80">당신의 운명에 대해 대화해보세요</p>
           </div>
        </div>
        <div className="bg-amber-900/50 text-[10px] px-2 py-1 rounded border border-amber-700/50 text-amber-200">
            Gemini Pro 3
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-stone-50/50 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-4 opacity-80">
            <svg className="w-16 h-16 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <div className="text-center">
              <p className="font-serif text-lg text-stone-600 mb-2">무엇이 궁금하신가요?</p>
              <p className="text-sm">"내년 재물운이 어떨까요?"</p>
              <p className="text-sm">"저에게 맞는 색깔은 무엇인가요?"</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`rounded-2xl px-5 py-3 shadow-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-amber-700 text-white rounded-tr-none ml-2'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none mr-2'
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-stone-500 border border-stone-200 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
              <div className="flex space-x-2 items-center">
                <span className="text-xs font-serif text-amber-800 mr-2">운명 읽는 중</span>
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-amber-100">
        <div className="flex space-x-2 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="추가로 궁금한 점을 입력해주세요..."
            className="flex-1 border border-stone-300 rounded-xl pl-4 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-stone-50 text-stone-800 placeholder-stone-400 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-amber-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center"
          >
            <span>전송</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;