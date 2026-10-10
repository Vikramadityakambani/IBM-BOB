import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './app/Layout';
import { AIStudioView } from './features/ai-studio/AIStudioView';
import { LibraryView } from './features/library/LibraryView';
import { ReviewQueueView } from './features/approvals/ReviewQueueView';
import { CampaignsView } from './features/campaigns/CampaignsView';
import { CalendarView } from './features/calendar/CalendarView';
import { BrandVoiceView } from './features/brand-voice/BrandVoiceView';
import { SettingsView } from './features/settings/SettingsView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'ai-studio':
      return <AIStudioView />;
    case 'library':
      return <LibraryView />;
    case 'approvals':
      return <ReviewQueueView />;
    case 'campaigns':
      return <CampaignsView />;
    case 'calendar':
      return <CalendarView />;
    case 'brand-voice':
      return <BrandVoiceView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <AIStudioView />;
  }
};

export function App() {
  return (
    <AppProvider>
      <Layout>
        <MainContent />
      </Layout>
    </AppProvider>
  );
}

export default App;
