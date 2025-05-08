// client/src/App.jsx
import React, { useState, useRef } from 'react';
import SegmentBuilder from './components/SegmentBuilder';
import CampaignCreator from './components/CampaignCreator';
import CampaignHistory from './pages/CampaignHistory';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('segments');
  const campaignCreatorRef = useRef();

  const handleSegmentSave = () => {
    if (campaignCreatorRef.current?.refreshSegments) {
      campaignCreatorRef.current.refreshSegments();
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'segments':
        return (
          <div className="bg-white rounded-lg shadow">
            <SegmentBuilder onSave={handleSegmentSave} />
          </div>
        );
      case 'campaigns':
        return (
          <div className="bg-white rounded-lg shadow">
            <CampaignCreator ref={campaignCreatorRef} />
          </div>
        );
      case 'history':
        return <CampaignHistory />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-800">XenoReach CRM</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {[
                  { id: 'segments', label: 'Segment Builder' },
                  { id: 'campaigns', label: 'Campaign Creator' },
                  { id: 'history', label: 'Campaign History' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {[
              { id: 'segments', label: 'Segment Builder' },
              { id: 'campaigns', label: 'Campaign Creator' },
              { id: 'history', label: 'Campaign History' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium w-full text-left`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <Toaster position="top-right" />
    </div>
  );
}
