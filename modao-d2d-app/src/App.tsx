import { useState, useEffect } from 'react';
import { SidebarContext } from '@/context/SidebarContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Greeting } from '@/components/home/Greeting';
import { PromptInput } from '@/components/home/PromptInput';
import { FeatureCards } from '@/components/home/FeatureCards';
import { DesignSystemPage } from '@/components/home/DesignSystemPage';
import { ChatPage } from '@/components/chat/ChatPage';
import { GlobalStyleCustomizer } from '@/components/home/GlobalStyleCustomizer';
import { MobileApp } from '@/mobile/MobileApp';
import { PublishedSitePage } from '@/components/published/PublishedSitePage';

// Removed: SidebarContext definition (moved to external file)

function parsePublishedSiteSlug(hash: string): string | null {
  const h = hash.split('?')[0];
  if (h.startsWith('#/en/site/')) {
    const slug = decodeURIComponent(h.slice('#/en/site/'.length));
    return slug || null;
  }
  if (h.startsWith('#/site/')) {
    const slug = decodeURIComponent(h.slice('#/site/'.length));
    return slug || null;
  }
  return null;
}

function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const isMobileMode = hash === '#/mobile';
  const isEnglishMode = hash === '#/en';
  const publishedSiteSlug = parsePublishedSiteSlug(hash);

  // Expose locale for translation helper
  if (typeof window !== 'undefined') {
    if (publishedSiteSlug !== null) {
      window.__PRODES_LOCALE__ = hash.startsWith('#/en/site/') ? 'en' : 'zh';
    } else {
      window.__PRODES_LOCALE__ = isEnglishMode ? 'en' : 'zh';
    }
  }

  const [activeNav, setActiveNav] = useState('home');
  const [isCategorySelected, setIsCategorySelected] = useState(false);
  const [viewMode, setViewMode] = useState<'home' | 'chat'>(() => {
    return (localStorage.getItem('modao_d2d_viewMode') as 'home' | 'chat') || 'home';
  });

  useEffect(() => {
    localStorage.setItem('modao_d2d_viewMode', viewMode);
  }, [viewMode]);
  const [editingSystem, setEditingSystem] = useState<any | null>(null);
  const [customSystems, setCustomSystems] = useState<any[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [activeChatLabel, setActiveChatLabel] = useState('');

  const handleSaveSystem = (systemData: any) => {
    if (!systemData.id) {
      const newSystem = {
        ...systemData,
        id: `custom-${Date.now()}`,
        name: systemData.name || 'My New System',
        bg: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
        darkBg: '#0f172a'
      };
      setCustomSystems([...customSystems, newSystem]);
    } else {
      setCustomSystems(customSystems.map(s => s.id === systemData.id ? systemData : s));
    }
    setEditingSystem(null);
  };

  if (isMobileMode) {
    return <MobileApp />;
  }

  if (publishedSiteSlug !== null) {
    return <PublishedSitePage slug={publishedSiteSlug} />;
  }

  return (
    <SidebarContext.Provider value={{
      activeNav, setActiveNav,
      isCategorySelected, setIsCategorySelected,
      viewMode, setViewMode,
      editingSystem, setEditingSystem,
      customSystems, setCustomSystems,
      sidebarCollapsed, setSidebarCollapsed,
      userPrompt, setUserPrompt,
      activeChatLabel, setActiveChatLabel,
    }}>
      <MainLayout>
        {activeNav === 'design-system' ? (
          <DesignSystemPage />
        ) : viewMode === 'chat' ? (
          <ChatPage />
        ) : (
          <>
            <Greeting />
            <PromptInput />
            <FeatureCards />
          </>
        )}
      </MainLayout>

      {/* Global Modals */}
      {editingSystem && (
        <GlobalStyleCustomizer
          designSystem={editingSystem}
          onClose={() => setEditingSystem(null)}
          onSave={() => handleSaveSystem(editingSystem)}
        />
      )}
    </SidebarContext.Provider>
  );
}

export default App
