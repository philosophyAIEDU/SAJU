import React from 'react';
import { WorkflowStep } from '../types';

interface ProgressStepsProps {
  steps: WorkflowStep[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps }) => {
  return (
    <div className="w-full mb-8">
       <h4 className="text-center font-serif text-stone-600 mb-4 text-lg">AI 전문가 팀 분석 진행상황</h4>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-stone-200">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isPending = step.status === 'pending';
          const isLoading = step.status === 'loading';
          const isCompleted = step.status === 'completed';

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-1 items-center w-full md:w-auto mb-4 md:mb-0">
                <div className="relative flex flex-col items-center flex-1">
                  
                  {/* Icon Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-500
                      ${isCompleted ? 'bg-amber-100 border-amber-600 text-amber-700' : ''}
                      ${isLoading ? 'bg-amber-500 border-amber-600 text-white animate-pulse' : ''}
                      ${isPending ? 'bg-stone-100 border-stone-300 text-stone-400' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    ) : (
                      <span className="font-bold font-serif">{step.id}</span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="mt-2 text-center">
                    <div className={`font-bold text-sm ${isPending ? 'text-stone-400' : 'text-stone-800'}`}>
                      {step.expertName}
                    </div>
                    <div className={`text-xs ${isPending ? 'text-stone-300' : 'text-stone-500'}`}>
                      {step.name}
                    </div>
                    {isLoading && (
                       <div className="text-xs text-amber-600 font-medium animate-pulse mt-1">분석 중...</div>
                    )}
                  </div>
                </div>
                
                {/* Connector Line (Mobile hidden, Desktop visible) */}
                {!isLast && (
                  <div className="hidden md:block flex-1 h-0.5 mx-4 bg-stone-200 relative top-[-20px]">
                    <div 
                      className={`h-full bg-amber-500 transition-all duration-1000 ease-out`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSteps;