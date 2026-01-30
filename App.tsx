import React, { useState } from 'react';
import { ServiceType, UserInput, WorkflowStep } from './types';
import InputForm from './components/InputForm';
import ProgressSteps from './components/ProgressSteps';
import ResultDisplay from './components/ResultDisplay';
import { analyzeStructure, analyzeElements, finalizeFortune } from './services/geminiService';

// Icons
const IconYinYang = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-2.21.9-4.21 2.35-5.65 1.58 2.73 4.52 4.65 7.95 4.65V12c0 2.21 1.79 4 4 4 .33 0 .66-.04.97-.11C18.15 18.12 15.31 20 12 20zm0-16c2.51 0 4.77 1.13 6.3 2.92-1.74 1.73-4.14 2.91-6.8 3.06V11c-2.21 0-4-1.79-4-4 0-2.21 1.79-4 4-4z"/>
    <circle cx="12" cy="7" r="1.5" fill="#fff"/>
    <circle cx="12" cy="17" r="1.5" />
  </svg>
);

const App: React.FC = () => {
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

  const updateStepStatus = (id: number, status: 'pending' | 'loading' | 'completed') => {
    setSteps(prev => prev.map(step => step.id === id ? { ...step, status } : step));
  };

  const handleServiceChange = (service: ServiceType) => {
    setCurrentService(service);
    setFinalResult('');
    setError(null);
    setSteps(steps.map(s => ({ ...s, status: 'pending' })));
  };

  const startAnalysis = async () => {
    if (!process.env.API_KEY) {
        setError("API Key가 설정되지 않았습니다. 환경 변수를 확인해주세요.");
        return;
    }

    setIsLoading(true);
    setFinalResult('');
    setError(null);
    
    // Reset steps
    setSteps(prev => prev.map(s => ({...s, status: 'pending'})));

    try {
      // Step 1: Structure
      updateStepStatus(1, 'loading');
      const structureResult = await analyzeStructure(currentService, inputData);
      updateStepStatus(1, 'completed');

      // Step 2: Elements
      updateStepStatus(2, 'loading');
      const elementResult = await analyzeElements(currentService, inputData, structureResult);
      updateStepStatus(2, 'completed');

      // Step 3: Coach
      updateStepStatus(3, 'loading');
      const finalResultText = await finalizeFortune(currentService, inputData, `${structureResult}\n\n${elementResult}`);
      updateStepStatus(3, 'completed');

      setFinalResult(finalResultText);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "분석 중 알 수 없는 오류가 발생했습니다.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
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
               <p className="text-xs text-stone-400 font-light">3명의 AI 전문가가 분석하는 당신의 운명</p>
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
          <ResultDisplay finalResult={finalResult} />

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