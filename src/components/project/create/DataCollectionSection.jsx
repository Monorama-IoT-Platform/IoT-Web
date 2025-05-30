import React from 'react';

function DataCollectionSection({
  personalInfo, setPersonalInfo,
  healthData, setHealthData,
  airData, setAirData,
  showHealth, showAir,
  readOnly = false
}) {
  const handleCheckboxChange = (section, key) => {
    if (readOnly) return;

    const updateFn =
      section === 'personal' ? setPersonalInfo :
      section === 'health' ? setHealthData :
      setAirData;

    const current =
      section === 'personal' ? personalInfo :
      section === 'health' ? healthData :
      airData;

    updateFn({ ...current, [key]: !current[key] });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <h4 className="font-medium mb-2">Personal Info</h4>
        {Object.keys(personalInfo).map(key => (
          <label key={key} className="block">
            <input
              type="checkbox"
              checked={personalInfo[key]}
              onChange={() => handleCheckboxChange('personal', key)}
              className="mr-2"
              disabled={readOnly}
            />
            {key}
          </label>
        ))}
      </div>
      {showHealth && (
        <div>
          <h4 className="font-medium mb-2">Health Data</h4>
          {Object.keys(healthData).map(key => (
            <label key={key} className="block">
              <input
                type="checkbox"
                checked={healthData[key]}
                onChange={() => handleCheckboxChange('health', key)}
                className="mr-2"
                disabled={readOnly}
              />
              {key}
            </label>
          ))}
        </div>
      )}
      {showAir && (
        <div>
          <h4 className="font-medium mb-2">Air Data</h4>
          {Object.keys(airData).map(key => (
            <label key={key} className="block">
              <input
                type="checkbox"
                checked={airData[key]}
                onChange={() => handleCheckboxChange('air', key)}
                className="mr-2"
                disabled={readOnly}
              />
              {key}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default DataCollectionSection;
