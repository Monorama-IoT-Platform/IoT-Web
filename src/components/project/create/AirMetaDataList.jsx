import React from 'react';

function AirMetaDataList({ airMetaDataItems, updateMetaDataItem, addMetaData, removeMetaData }) {
  return (
    <>
      {airMetaDataItems.map((item, index) => (
        <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center mb-2">
          <input type="text" className="border rounded px-3 py-2" placeholder="Data Name" value={item.dataName} onChange={(e) => updateMetaDataItem(index, 'dataName', e.target.value)} />
          <select className="border rounded px-3 py-2" value={item.dataType} onChange={(e) => updateMetaDataItem(index, 'dataType', e.target.value)}>
            <option value="INTEGER">INTEGER</option>
            <option value="DOUBLE">DOUBLE</option>
            <option value="STRING">STRING</option>
          </select>
          <button type="button" className="text-xl" onClick={addMetaData}>+</button>
          {airMetaDataItems.length > 1 && (
            <button type="button" className="text-xl text-red-500" onClick={() => removeMetaData(index)}>-</button>
          )}
        </div>
      ))}
    </>
  );
}

export default AirMetaDataList;
