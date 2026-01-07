import React from 'react';

function DataCollectionSection({
  personalInfo, setPersonalInfo,
  healthData, setHealthData,
  airData, setAirData,
  showHealth, showAir,
  readOnly = false
}) {
  
  const REQUIRED_KEYS = [
    'watchDeviceLatitude', 'watchDeviceLongitude', 
    'picoDeviceLatitude', 'picoDeviceLongitude'
  ];

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const handleSelectAll = (section, isAllSelected) => {
    if (readOnly) return;

    const setter = 
      section === 'personal' ? setPersonalInfo :
      section === 'health' ? setHealthData : setAirData;
    
    const currentData = 
      section === 'personal' ? personalInfo :
      section === 'health' ? healthData : airData;

    const newState = Object.keys(currentData).reduce((acc, key) => {
      // ✅ 필수 항목(위경도)은 Select All/Deselect All과 상관없이 항상 true 유지
      if (REQUIRED_KEYS.includes(key)) {
        acc[key] = true;
      } else {
        acc[key] = !isAllSelected;
      }
      return acc;
    }, {});

    setter(newState);
  };

  const handleCheckboxChange = (section, key) => {
    // ✅ 위경도 키인 경우 변경 불가능하게 차단
    if (readOnly || REQUIRED_KEYS.includes(key)) return;

    const updateFn =
      section === 'personal' ? setPersonalInfo :
      section === 'health' ? setHealthData : setAirData;

    const current =
      section === 'personal' ? personalInfo :
      section === 'health' ? healthData : airData;

    const newValue = !current[key];
    const updated = { ...current, [key]: newValue };

    if (key.endsWith('Value') || key.endsWith('Level')) {
      const pairKey = key.endsWith('Value')
        ? key.replace('Value', 'Level')
        : key.replace('Level', 'Value');
        
      if (pairKey in updated) {
        updated[pairKey] = newValue;
      }
    }

    updateFn(updated);
  };

  const renderSection = (title, data, sectionKey) => {
    // 필수 항목을 제외한 나머지 항목들의 선택 상태 확인
    const nonRequiredKeys = Object.keys(data).filter(k => !REQUIRED_KEYS.includes(k));
    const isAllSelected = nonRequiredKeys.every(k => data[k] === true);
    const hasData = nonRequiredKeys.length > 0;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h4 className="font-bold text-indigo-800">{title}</h4>
          {!readOnly && hasData && (
            <button
              type="button"
              onClick={() => handleSelectAll(sectionKey, isAllSelected)}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded transition"
            >
              {isAllSelected ? 'Deselect Optional' : 'Select All Optional'}
            </button>
          )}
        </div>
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.keys(data).map(key => {
          const isRequired = REQUIRED_KEYS.includes(key);
          const isChecked = isRequired ? true : data[key];
          const fullLabel = formatLabel(key); // 전체 데이터명

          return (
              <label key={key} className={`flex items-center gap-3 group ${isRequired ? 'cursor-default' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(sectionKey, key)}
                  className={`w-4 h-4 rounded border-gray-300 text-indigo-600 ${
                    isRequired ? 'bg-indigo-100' : 'focus:ring-indigo-500'
                  }`}
                  // ✅ 위경도 항목은 disabled 처리하여 변경 불가능하게 함
                  disabled={readOnly || isRequired}
                />
                <div className="flex items-center justify-between flex-1 min-w-0">
                {/* ✅ title 속성을 추가하여 마우스 오버 시 전체 이름이 보이게 함 */}
                <span 
                  title={fullLabel} 
                  className={`text-sm whitespace-nowrap overflow-hidden text-ellipsis mr-2 ${
                    isChecked ? 'text-gray-900 font-medium' : 'text-gray-500'
                  } transition-colors`}
                >
                  {fullLabel}
                </span>
                
                {isRequired && (
                  <span className="flex-shrink-0 text-[9px] text-indigo-500 font-extrabold border border-indigo-200 px-1 py-0.5 rounded-sm bg-indigo-50 leading-none">
                    REQUIRED
                  </span>
                )}
              </div>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {renderSection('Personal Info', personalInfo, 'personal')}
      {showHealth && renderSection('Health Data', healthData, 'health')}
      {showAir && renderSection('Air Quality Data', airData, 'air')}
    </div>
  );
}

export default DataCollectionSection;