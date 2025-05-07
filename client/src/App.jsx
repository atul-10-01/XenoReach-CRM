// client/src/App.jsx
import React from 'react';
import SegmentBuilder from './components/SegmentBuilder';

export default function App() {
  const handleSave = (ruleJson) => {
    console.log('✍️ Saved rule tree:', ruleJson);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-10">
      <SegmentBuilder onSave={handleSave} />
    </div>
  );
}
