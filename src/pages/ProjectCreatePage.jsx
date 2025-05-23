import React, { useState } from 'react';
import ProjectTypeSelector from '../components/project/create/ProjectTypeSelector';
import TermsInputGroup from '../components/project/create/TermsInputGroup';
import DataCollectionSection from '../components/project/create/DataCollectionSection';
import AirMetaDataList from '../components/project/create/AirMetaDataList';

function ProjectCreatePage() {
  const [projectType, setProjectType] = useState('BOTH');
  const [title, setTitle] = useState('');
  const [participant, setParticipant] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const [termsOfPolicy, setTermsOfPolicy] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [healthDataConsent, setHealthDataConsent] = useState('');
  const [airDataConsent, setAirDataConsent] = useState('');
  const [localDataTermsOfService, setLocalDataTermsOfService] = useState('');

  const [personalInfo, setPersonalInfo] = useState({
    gender: false, birthDate: false, bloodType: false,
    height: false, weight: false, email: false, id: false, name: false
  });
  const [healthData, setHealthData] = useState({ steps: false, heartRate: false });
  const [airData, setAirData] = useState({ pm25: false, pm10: false });

  const [airMetaDataItems, setAirMetaDataItems] = useState([{ dataName: '', dataType: 'INTEGER' }]);

  const updateMetaDataItem = (index, field, value) => {
    const updated = [...airMetaDataItems];
    updated[index][field] = value;
    setAirMetaDataItems(updated);
  };

  const addMetaData = () => {
    setAirMetaDataItems([...airMetaDataItems, { dataName: '', dataType: 'INTEGER' }]);
  };

  const removeMetaData = (index) => {
    const updated = [...airMetaDataItems];
    updated.splice(index, 1);
    setAirMetaDataItems(updated);
  };

  const showHealth = projectType === 'HEALTH_DATA' || projectType === 'BOTH';
  const showAir = projectType === 'AIR_QUALITY' || projectType === 'BOTH';

  return (
    <div className="bg-neutral-200  min-h-screen p-8 text-gray-800">
      <div className=" mx-auto min-w-[890px] bg-white shadow-md rounded-lg p-8 space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold">Register a New Project</h1>
          <p className="text-gray-500">Fill in the details below to start a new data collection project.</p>
        </header>

        <section>
          <h2 className="text-xl font-bold mb-4">Project Type</h2>
          <ProjectTypeSelector projectType={projectType} setProjectType={setProjectType} />
        </section>

        <hr />

        <section>
          <h2 className="text-xl font-bold mb-4">Project Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Title</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Participant</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={participant} onChange={e => setParticipant(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">Start Date</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block font-medium mb-1">End Date</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Description</label>
              <textarea className="w-full border rounded px-3 py-2" value={description} onChange={e => setDescription(e.target.value)}></textarea>
            </div>
          </div>
        </section>

        <hr />

        <section>
          <h2 className="text-xl font-bold mb-4">Agreement to Terms</h2>
          <TermsInputGroup
            termsOfPolicy={termsOfPolicy} setTermsOfPolicy={setTermsOfPolicy}
            privacyPolicy={privacyPolicy} setPrivacyPolicy={setPrivacyPolicy}
            healthDataConsent={healthDataConsent} setHealthDataConsent={setHealthDataConsent}
            airDataConsent={airDataConsent} setAirDataConsent={setAirDataConsent}
            localDataTermsOfService={localDataTermsOfService} setLocalDataTermsOfService={setLocalDataTermsOfService}
            showHealth={showHealth} showAir={showAir}
          />
        </section>

        <hr />

        <section>
          <h2 className="text-xl font-bold mb-4">Data Collection Item</h2>
          <DataCollectionSection
            personalInfo={personalInfo} setPersonalInfo={setPersonalInfo}
            healthData={healthData} setHealthData={setHealthData}
            airData={airData} setAirData={setAirData}
            showHealth={showHealth} showAir={showAir}
          />
        </section>

        {showAir && <>
        <hr />
        <section>
          <h2 className="text-xl font-bold mb-4">Air Meta Data</h2>
          <AirMetaDataList
            airMetaDataItems={airMetaDataItems}
            updateMetaDataItem={updateMetaDataItem}
            addMetaData={addMetaData}
            removeMetaData={removeMetaData}
          />
        </section></>}

        <div className="text-right">
          <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-2 rounded">Register</button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCreatePage;