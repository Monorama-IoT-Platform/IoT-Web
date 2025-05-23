import React from 'react';

function TermsInputGroup({
  termsOfPolicy, setTermsOfPolicy,
  privacyPolicy, setPrivacyPolicy,
  healthDataConsent, setHealthDataConsent,
  airDataConsent, setAirDataConsent,
  localDataTermsOfService, setLocalDataTermsOfService,
  showHealth, showAir
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-indigo-700 mb-1">Terms of Service</label>
        <textarea className="w-full border-2 border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[70px] bg-white shadow-sm" placeholder="Terms of Service" value={termsOfPolicy} onChange={e => setTermsOfPolicy(e.target.value)} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-semibold text-indigo-700 mb-1">Privacy Policy</label>
        <textarea className="w-full border-2 border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[70px] bg-white shadow-sm" placeholder="Privacy Policy" value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} />
      </div>
      {showHealth && (
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-indigo-700 mb-1">Health Data Consent</label>
          <textarea className="w-full border-2 border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[70px] bg-white shadow-sm" placeholder="Health Data Consent" value={healthDataConsent} onChange={e => setHealthDataConsent(e.target.value)} />
        </div>
      )}
      {showAir && (
        <div className="flex flex-col gap-1">
          <label className="font-semibold text-indigo-700 mb-1">Air Data Consent</label>
          <textarea className="w-full border-2 border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[70px] bg-white shadow-sm" placeholder="Air Data Consent" value={airDataConsent} onChange={e => setAirDataConsent(e.target.value)} />
        </div>
      )}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="font-semibold text-indigo-700 mb-1">Location Data Terms of Service</label>
        <textarea className="w-full border-2 border-indigo-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition min-h-[70px] bg-white shadow-sm" placeholder="Location Data Terms of Service" value={localDataTermsOfService} onChange={e => setLocalDataTermsOfService(e.target.value)} />
      </div>
    </div>
  );
}

export default TermsInputGroup;
