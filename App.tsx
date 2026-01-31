import React, { useState, useRef, useEffect } from 'react';
import { Chat } from "@google/genai";
import { ServiceType, UserInput, WorkflowStep, ChatMessage } from './types';
import InputForm from './components/InputForm';
import ProgressSteps from './components/ProgressSteps';
import ResultDisplay from './components/ResultDisplay';
import ChatInterface from './components/ChatInterface';
import { analyzeStructure, analyzeElements, finalizeFortune, createChatSession, sendChatMessage } from './services/geminiService';

// LocalStorage key for API key
const API_KEY_STORAGE_KEY = 'saju_gemini_api_key';

// Icons
const IconYinYang = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-2.21.9-4.21 2.35-5.65 1.58 2.73 4.52 4.65 7.95 4.65V12c0 2.21 1.79 4 4 4 .33 0 .66-.04.97-.11C18.15 18.12 15.31 20 12 20zm0-16c2.51 0 4.77 1.13 6.3 2.92-1.74 1.73-4.14 2.91-6.8 3.06V11c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4z"/>
    <circle cx="12" cy="7" r="1.5" fill="#fff"/>
    <circle cx="12" cy="17" r="1.5" />
  </svg>
);

const IconKey = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const App: React.FC = () => {
  // API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);

  const [currentService, setCurrentService] = useState<ServiceType>(ServiceType.BASIC);
  const [inputData, setInputData] = useState<UserInput>({
    birthDate: '',
    birthTime: '12:00',
    isTimeUnknown: false,
    gender: '남성',
    calendarType: '양력',
    targetYear: new Date().getFullYear(),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [finalResult, setFinalResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 1, name: '구조 분석', expertName: '김명리 전문가', description: '사주팔자 도출', status: 'pending' },
    { id: 2, name: '오행 분석', expertName: '이오행 전문가', description: '음양오행 조화', status: 'pending' },
    { id: 3, name: '종합 해석', expertName: '박운명 코치', description: '최종 운세 조언', status: 'pending' },
  ]);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  // 채팅 섹션으로 스크롤
  const scrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
      setIsApiKeySet(true);
      setError(null);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey('');
    setIsApiKeySet(false);
  };

  const updateStepStatus = (id: number, status: 'pending' | 'loading' | 'completed') => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };

  const handleServiceChange = (service: ServiceType) => {
    setCurrentService(service);
    setFinalResult('');
    setError(null);
    setSteps(steps.map(s => ({ ...s, status: 'pending' })));
    setChatMessages([]);
    chatSessionRef.current = null;
  };

  const startAnalysis = async () => {
    if (!apiKey || !isApiKeySet) {
      setError("API Key를 먼저 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setFinalResult('');
    setError(null);
    setChatMessages([]);
    chatSessionRef.current = null;

    // Reset steps
    setSteps(prev => prev.map(s => ({...s, status: 'pending'})));

    try {
      // Step 1: Structure
      updateStepStatus(1, 'loading');
      const structureResult = await analyzeStructure(apiKey, currentService, inputData);
      updateStepStatus(1, 'completed');

      // Step 2: Elements
      updateStepStatus(2, 'loading');
      const elementResult = await analyzeElements(apiKey, currentService, inputData, structureResult);
      updateStepStatus(2, 'completed');

      // Step 3: Coach
      updateStepStatus(3, 'loading');
      const fullContext = `${structureResult}\n\n${elementResult}`;
      const finalResultText = await finalizeFortune(apiKey, currentService, inputData, fullContext);
      updateStepStatus(3, 'completed');

      setFinalResult(finalResultText);

      // Initialize Chat Session with full context including final result
      chatSessionRef.current = createChatSession(
        apiKey,
        `=== 구조/오행 분석 ===\n${fullContext}\n\n=== 최종 종합 분석 ===\n${finalResultText}`
      );

    } catch (err: any) {
      setError(err.message || "분석 중 알 수 없는 오류가 발생했습니다.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    // Optimistic UI update
    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setIsChatLoading(true);

    try {
      const response = await sendChatMessage(chatSessionRef.current, text);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "죄송합니다. 오류가 발생하여 답변을 드릴 수 없습니다." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-stone-900 text-amber-50 py-6 shadow-md border-b-4 border-amber-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="text-amber-500 bg-stone-800 p-2 rounded-full">
               <IconYinYang />
             </div>
             <div>
               <h1 className="text-2xl font-serif font-bold tracking-wide">AI 사주팔자 분석 팀</h1>
               <p className="text-xs text-stone-400 font-light">Gemini Pro 3가 분석하는 당신의 운명</p>
             </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Intro Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-stone-200">
           <h2 className="text-lg font-bold text-stone-800 mb-2 font-serif">환영합니다.</h2>
           <p className="text-stone-600 leading-relaxed">
             본 서비스는 <strong>김명리 구조 전문가</strong>, <strong>이오행 오행 전문가</strong>, <strong>박운명 종합 코치</strong>가
             순차적으로 협업하여 깊이 있는 사주 분석을 제공합니다.
           </p>
        </div>

        {/* API Key Input Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-stone-200">
          <div className="flex items-center gap-2 mb-4">
            <div className="text-amber-600">
              <IconKey />
            </div>
            <h3 className="text-lg font-bold text-stone-800 font-serif">API Key 설정</h3>
            {isApiKeySet && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                설정됨
              </span>
            )}
          </div>

          {!isApiKeySet ? (
            <div className="space-y-4">
              <p className="text-sm text-stone-500">
                서비스를 이용하려면 Google Gemini API Key가 필요합니다.
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-amber-600 hover:text-amber-700 underline"
                >
                  API Key 발급받기
                </a>
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Gemini API Key를 입력하세요"
                    className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showApiKey ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim()}
                  className="px-6 py-3 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
                >
                  저장
                </button>
              </div>
              <p className="text-xs text-stone-400">
                API Key는 브라우저에 안전하게 저장되며, 서버로 전송되지 않습니다.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-stone-600 text-sm">API Key: </span>
                <code className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-sm">
                  {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                </code>
              </div>
              <button
                onClick={handleClearApiKey}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          {Object.values(ServiceType).map((type) => (
            <button
              key={type}
              onClick={() => handleServiceChange(type)}
              className={`px-6 py-3 rounded-full text-sm md:text-base font-bold transition-all duration-200 shadow-sm
                ${currentService === type 
                  ? 'bg-amber-700 text-white shadow-md transform scale-105' 
                  : 'bg-white text-stone-600 hover:bg-amber-50 border border-stone-200'}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 gap-8">
          
          <InputForm 
            serviceType={currentService}
            inputData={inputData}
            setInputData={setInputData}
            onSubmit={startAnalysis}
            isLoading={isLoading}
          />

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">오류가 발생했습니다</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading / Progress */}
          {(isLoading || steps[0].status === 'completed') && (
            <ProgressSteps steps={steps} />
          )}

          {/* Final Result */}
          <ResultDisplay
            finalResult={finalResult}
            onScrollToChat={finalResult ? scrollToChat : undefined}
          />

          {/* Chat Interface (Visible only when result is ready) */}
          {finalResult && (
            <div ref={chatSectionRef}>
              <ChatInterface
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                serviceType={currentService}
              />
            </div>
          )}

        </div>
      </main>

      <footer className="mt-12 py-8 bg-stone-100 text-center border-t border-stone-200">
        <p className="text-stone-500 text-sm font-serif">
          Saju AI Analysis Team &copy; {new Date().getFullYear()} <br/>
          운명은 스스로 개척하는 것입니다.
        </p>
      </footer>
    </div>
  );
};

export default App;