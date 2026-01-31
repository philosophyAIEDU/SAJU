import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ServiceType } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  serviceType?: ServiceType;
}

// 서비스 타입별 추천 질문
const getSuggestedQuestions = (serviceType?: ServiceType): string[] => {
  switch (serviceType) {
    case ServiceType.BASIC:
      return [
        "제 성격의 장단점을 더 자세히 알려주세요",
        "올해 조심해야 할 점이 있을까요?",
        "저에게 맞는 행운의 색깔과 숫자는?",
        "건강 관리에서 특히 신경 써야 할 부분은?"
      ];
    case ServiceType.COMPATIBILITY:
      return [
        "서로 갈등이 생기면 어떻게 해결하면 좋을까요?",
        "상대방과 잘 맞는 점과 조심해야 할 점은?",
        "우리 관계를 더 좋게 만드는 방법은?",
        "서로에게 도움이 되는 역할 분담이 있을까요?"
      ];
    case ServiceType.FORTUNE:
      return [
        "이 해에 특히 좋은 달은 언제인가요?",
        "재물운을 높이는 방법이 있을까요?",
        "올해 피해야 할 것들이 있나요?",
        "중요한 결정은 언제 하면 좋을까요?"
      ];
    case ServiceType.CAREER:
      return [
        "제가 피해야 할 직종이 있을까요?",
        "창업과 취업 중 어느 쪽이 더 맞을까요?",
        "직장에서 성공하려면 어떤 점을 개선해야 할까요?",
        "부업이나 투자는 저에게 맞을까요?"
      ];
    default:
      return [
        "내년 운세가 어떨까요?",
        "저에게 맞는 색깔은 무엇인가요?",
        "재물운을 높이는 방법이 있을까요?",
        "건강 관리에서 주의할 점은?"
      ];
  }
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading, serviceType }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestedQuestions = getSuggestedQuestions(serviceType);

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
          <div className="flex flex-col items-center justify-center h-full text-stone-400 space-y-6">
            <svg className="w-16 h-16 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
            <div className="text-center">
              <p className="font-serif text-lg text-stone-600 mb-4">무엇이 궁금하신가요?</p>
              <p className="text-sm text-stone-500 mb-4">아래 질문을 클릭하거나 직접 입력해보세요</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(question)}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-white border border-amber-300 text-amber-800 rounded-full hover:bg-amber-50 hover:border-amber-400 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {question}
                  </button>
                ))}
              </div>
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