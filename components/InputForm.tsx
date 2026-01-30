import React from 'react';
import { UserInput, ServiceType } from '../types';

interface InputFormProps {
  serviceType: ServiceType;
  inputData: UserInput;
  setInputData: React.Dispatch<React.SetStateAction<UserInput>>;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  serviceType,
  inputData,
  setInputData,
  onSubmit,
  isLoading,
}) => {
  const handleChange = (field: keyof UserInput, value: any) => {
    setInputData((prev) => ({ ...prev, [field]: value }));
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-stone-100">
      <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 border-b pb-2 border-stone-200">
        {serviceType} 정보 입력
      </h3>

      <div className="space-y-6">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">생년월일</label>
            <input
              type="date"
              className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
              value={inputData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">태어난 시간</label>
            <div className="flex space-x-2">
              <input
                type="time"
                className="flex-1 rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border disabled:bg-stone-100 disabled:text-stone-400"
                value={inputData.birthTime}
                onChange={(e) => handleChange('birthTime', e.target.value)}
                disabled={inputData.isTimeUnknown}
              />
              <div className="flex items-center">
                <input
                  id="unknownTime"
                  type="checkbox"
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-stone-300 rounded"
                  checked={inputData.isTimeUnknown}
                  onChange={(e) => handleChange('isTimeUnknown', e.target.checked)}
                />
                <label htmlFor="unknownTime" className="ml-2 text-sm text-stone-600">
                  시간 모름
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">성별</label>
            <select
              className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
              value={inputData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <option value="남성">남성</option>
              <option value="여성">여성</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">양력/음력</label>
            <select
              className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
              value={inputData.calendarType}
              onChange={(e) => handleChange('calendarType', e.target.value)}
            >
              <option value="양력">양력</option>
              <option value="음력">음력</option>
            </select>
          </div>
        </div>

        {/* Compatibility Section */}
        {serviceType === ServiceType.COMPATIBILITY && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h4 className="text-lg font-medium text-stone-700 mb-4">상대방 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">상대방 생년월일</label>
                <input
                  type="date"
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                  value={inputData.person2BirthDate || ''}
                  onChange={(e) => handleChange('person2BirthDate', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">상대방 태어난 시간</label>
                <input
                  type="time"
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                  value={inputData.person2BirthTime || ''}
                  onChange={(e) => handleChange('person2BirthTime', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">상대방 성별</label>
                <select
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                  value={inputData.person2Gender || '여성'}
                  onChange={(e) => handleChange('person2Gender', e.target.value)}
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">관계</label>
                <select
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                  value={inputData.relationshipType || '연인/배우자'}
                  onChange={(e) => handleChange('relationshipType', e.target.value)}
                >
                  <option value="연인/배우자">연인/배우자</option>
                  <option value="부모/자녀">부모/자녀</option>
                  <option value="친구">친구</option>
                  <option value="사업 파트너">사업 파트너</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Fortune Section */}
        {serviceType === ServiceType.FORTUNE && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h4 className="text-lg font-medium text-stone-700 mb-4">운세 대상 연도</h4>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">연도 선택</label>
              <input
                type="number"
                min={currentYear}
                max={currentYear + 10}
                className="w-full md:w-1/2 rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                value={inputData.targetYear || currentYear}
                onChange={(e) => handleChange('targetYear', parseInt(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* Career Section */}
        {serviceType === ServiceType.CAREER && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <h4 className="text-lg font-medium text-stone-700 mb-4">추가 정보</h4>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">현재 상태</label>
                <select
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                  value={inputData.currentStatus || '직장인'}
                  onChange={(e) => handleChange('currentStatus', e.target.value)}
                >
                  <option value="학생">학생</option>
                  <option value="취업 준비중">취업 준비중</option>
                  <option value="직장인">직장인</option>
                  <option value="사업자">사업자</option>
                  <option value="이직 준비중">이직 준비중</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">관심 분야 (선택사항)</label>
                <textarea
                  className="w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-200 p-2 border"
                  rows={3}
                  placeholder="예: IT 개발, 디자인, 교육 등 관심있는 분야를 적어주세요."
                  value={inputData.interests || ''}
                  onChange={(e) => handleChange('interests', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={onSubmit}
            disabled={isLoading || !inputData.birthDate}
            className={`w-full py-4 px-6 rounded-lg text-white font-bold text-lg shadow-md transition-all duration-200 
              ${isLoading || !inputData.birthDate
                ? 'bg-stone-400 cursor-not-allowed'
                : 'bg-amber-600 hover:bg-amber-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                천기누설 중...
              </span>
            ) : (
              '🔮 사주 분석 시작'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputForm;