import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export function useProjectCreateForm() {
  const [projectType, setProjectType] = useState('BOTH');
  const [title, setTitle] = useState('');
  const [participant, setParticipant] = useState('');
  const [startDate, setStartDateInternal] = useState('');
  const [endDate, setEndDateInternal] = useState('');
  const [description, setDescription] = useState('');

  const [termsOfPolicy, setTermsOfPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [healthDataConsent, setHealthDataConsent] = useState('');
  const [airDataConsent, setAirDataConsent] = useState('');
  const [localDataTermsOfService, setLocalDataTermsOfService] = useState('');

  const [personalInfo, setPersonalInfo] = useState({
    gender: false, birthDate: false, bloodType: false,
    height: false, weight: false, email: false, phoneNumber: false, name: false, nationalCode: false
  });

  const [healthData, setHealthData] = useState({
    steps: false, heartRate: false, runningSpeed: false, basalEnergyBurned: false, activeEnergyBurned: false, 
    sleepAnalysis: false, oxygenSaturation: false, bloodPressureSystolic: false, bloodPressureDiastolic: false, 
    respiratoryRate: false, bodyTemperature: false, ecgData: false, watchDeviceLatitude: true, watchDeviceLongitude: true,
  });

  const [airData, setAirData] = useState({
    pm25Value: false, pm25Level: false, pm10Value: false, pm10Level: false, temperature: false, 
    temperatureLevel: false, humidity: false, humidityLevel: false, co2Value: false, co2Level: false, 
    vocValue: false, vocLevel: false, picoDeviceLatitude: true, picoDeviceLongitude: true
  });

  const [airMetaDataItems, setAirMetaDataItems] = useState([]);
  const [errors, setErrors] = useState({});

  const showHealth = projectType === 'HEALTH_DATA' || projectType === 'BOTH';
  const showAir = projectType === 'AIR_QUALITY' || projectType === 'BOTH';

  const handleDateChange = (value, setter) => {
    if (!value) {
      setter("");
      return;
    }
    const year = value.split("-")[0];
    // 연도가 4자리를 초과하면(5자리 이상) 업데이트를 무시함
    if (year && year.length <= 4) {
      setter(value);
    }
  };

  const addMetaData = () => {
    setAirMetaDataItems(prev => [...prev, { id: uuidv4(), dataName: '', dataType: 'INTEGER' }]);
  };

  const removeMetaData = (idToRemove) => {
    setAirMetaDataItems(prev => prev.filter(item => item.id !== idToRemove));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[`airMetaDataItems.${idToRemove}.dataName`];
      return newErrors;
    });
  };

  const updateMetaDataItem = (index, field, value) => {
    const updated = [...airMetaDataItems];
    updated[index][field] = value;
    setAirMetaDataItems(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    const todayStr = new Date().toISOString().split('T')[0];

    // ✅ 모든 메시지를 한국어에서 영어로 변경
    if (!title) newErrors.title = 'Please enter the project title';
    if (!participant) newErrors.participant = 'Please enter the number of participants';
    
    // Start Date Validation
    if (!startDate) {
      newErrors.startDate = 'Please select a start date';
    } else if (startDate < todayStr) {
      newErrors.startDate = 'Start date cannot be in the past';
    }

    // End Date Validation
    if (!endDate) {
      newErrors.endDate = 'Please select an end date';
    } else if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = 'End date must be after the start date';
    }

    if (!description) newErrors.description = 'Please enter a project description';
    if (!termsOfPolicy) newErrors.termsOfPolicy = 'Please enter the Terms of Service';
    if (!privacyPolicy) newErrors.privacyPolicy = 'Please enter the Privacy Policy';
    if (!localDataTermsOfService) newErrors.localDataTermsOfService = 'Please enter the Location Data Terms';
    
    // Consent Messages
    if (showHealth && !healthDataConsent) newErrors.healthDataConsent = 'Please enter the Health Data Consent';
    if (showAir && !airDataConsent) newErrors.airDataConsent = 'Please enter the Air Quality Data Consent';

    // Item Selection Validation
    if (showHealth && !Object.values(healthData).some(Boolean)) {
      newErrors.healthData = 'Please select at least one health data item';
    }
    if (showAir && !Object.values(airData).some(Boolean)) {
      newErrors.airData = 'Please select at least one air quality data item';
    }

    // Metadata Validation
    if (showAir) {
      airMetaDataItems.forEach(item => {
        if (!item.dataName?.trim()) {
          newErrors[`airMetaDataItems.${item.id}.dataName`] = 'Please enter the data name';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const newErrors = { ...errors };
    if (projectType === 'HEALTH_DATA') {
      setAirMetaDataItems([]);
      setAirData(prev => Object.fromEntries(Object.keys(prev).map(k => [k, false])));
      setAirDataConsent('');
    } else if (projectType === 'AIR_QUALITY') {
      setHealthData(prev => Object.fromEntries(Object.keys(prev).map(k => [k, false])));
      setHealthDataConsent('');
    }
    setErrors(newErrors);
  }, [projectType]);

  return {
    projectType, setProjectType, title, setTitle, participant, setParticipant,
    startDate, setStartDate: (val) => handleDateChange(val, setStartDateInternal), endDate, setEndDate: (val) => handleDateChange(val, setEndDateInternal), description, setDescription,
    termsOfPolicy, setTermsOfPolicy, privacyPolicy, setPrivacyPolicy,
    healthDataConsent, setHealthDataConsent, airDataConsent, setAirDataConsent,
    localDataTermsOfService, setLocalDataTermsOfService, personalInfo, setPersonalInfo,
    healthData, setHealthData, airData, setAirData, airMetaDataItems, setAirMetaDataItems,
    updateMetaDataItem, addMetaData, removeMetaData, showHealth, showAir, errors, validateForm
  };
}