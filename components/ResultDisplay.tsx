import React from 'react';

interface ResultDisplayProps {
  finalResult: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ finalResult }) => {
  if (!finalResult) return null;

  return (
    <div className="mt-8 space-y-8 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-amber-100">
        <div className="bg-gradient-to-r from-amber-700 to-amber-900 p-6 text-white">
          <h2 className="text-2xl font-serif font-bold flex items-center">
            <span className="mr-2 text-3xl">📜</span> 종합 사주 분석 결과
          </h2>
          <p className="text-amber-100 mt-2 text-sm opacity-90">
            사주 구조, 음양오행, 그리고 종합적인 운세 해석을 담았습니다.
          </p>
        </div>
        
        <div className="p-8">
          <div className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:text-amber-900 prose-p:text-stone-700 prose-p:leading-relaxed prose-strong:text-amber-800">
             {/* A simple way to render the markdown-like text nicely without external deps */}
            {finalResult.split('\n').map((line, i) => {
              // Heading detection (### or ##)
              if (line.startsWith('### ')) {
                 return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-amber-800 border-b border-amber-100 pb-2">{line.replace('### ', '')}</h3>
              }
              if (line.startsWith('## ')) {
                 return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-amber-900">{line.replace('## ', '')}</h2>
              }
              if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('- ')) {
                  return <div key={i} className="ml-4 mb-2 flex"><span className="mr-2 text-amber-600 font-bold">•</span><span>{line.replace(/^[0-9]\. |^- /, '')}</span></div>
              }
              // Bold text simulation for **text**
              const parts = line.split(/(\*\*.*?\*\*)/g);
              
              if (line.trim() === '') return <div key={i} className="h-4"></div>;

              return (
                <p key={i} className="mb-2">
                  {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={index} className="text-stone-900 font-bold bg-amber-50 px-1 rounded">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </p>
              );
            })}
          </div>
        </div>

        <div className="bg-stone-50 p-4 border-t border-stone-100 text-center text-stone-500 text-sm">
           ⚠️ 본 서비스는 AI 분석 결과이며, 재미와 참고용으로만 활용해주세요.
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;