import React from 'react';

function ProjectTypeSelector({ projectType, setProjectType }) {
  const types = ['HEALTH_DATA', 'AIR_QUALITY', 'BOTH'];
  const labels = {
    HEALTH_DATA: 'Health Data',
    AIR_QUALITY: 'Air Data',
    BOTH: 'Health Data & Air Data'
  };

return (
    <div className="flex gap-6">
        {types.map(type => (
            <label
                key={type}
                className={`cursor-pointer flex-1 text-center px-4 py-3 rounded-xl border-2 transition-all duration-200 select-none shadow-sm
                    ${projectType === type
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-400 text-white border-indigo-500 shadow-lg'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50'}
                `}
            >
                <input
                    type="radio"
                    name="projectType"
                    value={type}
                    checked={projectType === type}
                    onChange={() => setProjectType(type)}
                    className="hidden"
                />
                <span className="font-semibold text-lg">{labels[type]}</span>
            </label>
        ))}
    </div>
);
}

export default ProjectTypeSelector;
