import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';

const MetaDataFormPage = ({ projectId }) => {
  const [metaDataItems, setMetaDataItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const fetchMetaDataItems = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/metadata/${projectId}/item`);
        const items = response.data.data.metaDataItemList;
        setMetaDataItems(items);

        const initialData = {};
        items.forEach(item => {
          initialData[item.metaDataItemId] = '';
        });
        setFormData(initialData);
      } catch (error) {
        console.error('메타데이터 항목 조회 실패:', error);
      }
    };

    fetchMetaDataItems();
  }, [projectId]);

  const handleChange = (e, itemId) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      metaDataList: Object.entries(formData).map(([id, value]) => ({
        metaDataItemId: Number(id),
        value: value,
      })),
    };

    try {
      await axiosInstance.post('/api/v1/metadata/${projectId}', payload);
      setIsSubmitted(true);
      alert('메타데이터가 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('메타데이터 저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-4 bg-white rounded-2xl shadow">
      <h2 className="text-lg font-bold mb-4 border-b pb-2">Meta Data</h2>

      {metaDataItems.map(item => (
        <div className="mb-4" key={item.metaDataItemId}>
          <label className="block font-medium mb-1">{item.dataName}</label>
          <input
            type="text"
            value={formData[item.metaDataItemId] || ''}
            onChange={(e) => handleChange(e, item.metaDataItemId)}
            className="w-full px-3 py-2 border rounded bg-gray-100"
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={isSubmitted}
        className="w-full py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition disabled:opacity-50"
      >
        {isSubmitted ? 'Submitted' : 'Save'}
      </button>
    </div>
  );
};

export default MetaDataFormPage;
