import { createContext, useContext } from 'react';

export interface SidebarContextType {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  isCategorySelected: boolean;
  setIsCategorySelected: (selected: boolean) => void;
  viewMode: 'home' | 'chat';
  setViewMode: (mode: 'home' | 'chat') => void;
  editingSystem: any | null;
  setEditingSystem: (system: any | null) => void;
  customSystems: any[];
  setCustomSystems: (systems: any[]) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  userPrompt: string;
  setUserPrompt: (prompt: string) => void;
}

export const SidebarContext = createContext<SidebarContextType>({
  activeNav: 'home',
  setActiveNav: () => { },
  isCategorySelected: false,
  setIsCategorySelected: () => { },
  viewMode: 'home',
  setViewMode: () => { },
  editingSystem: null,
  setEditingSystem: () => { },
  customSystems: [],
  setCustomSystems: () => { },
  sidebarCollapsed: false,
  setSidebarCollapsed: () => { },
  userPrompt: '',
  setUserPrompt: () => { },
});

export const useSidebarContext = () => useContext(SidebarContext);
