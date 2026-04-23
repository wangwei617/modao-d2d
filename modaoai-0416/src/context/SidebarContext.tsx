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
  homeDraftPrompt: string;
  setHomeDraftPrompt: (prompt: string) => void;
  /** 左侧栏当前选中的历史对话标题，用于与发布/删除等项目级操作关联 */
  activeChatLabel: string;
  setActiveChatLabel: (label: string) => void;
  homeActiveTab: string | null;
  setHomeActiveTab: (tab: string | null) => void;
  homeSelectedTag: string | null;
  setHomeSelectedTag: (tag: string | null) => void;
  /** 墨刀AI 子产品 vs 父级墨刀工作台（与左侧栏、顶栏、主区一一对应） */
  appSurface: 'ai-home' | 'workbench-home';
  setAppSurface: (s: 'ai-home' | 'workbench-home') => void;
  /** 父级工作台侧栏子项：首页=工作台大首页，其余为占位/后续扩展 */
  workbenchView: string;
  setWorkbenchView: (v: string) => void;
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
  homeDraftPrompt: '',
  setHomeDraftPrompt: () => { },
  activeChatLabel: '',
  setActiveChatLabel: () => { },
  homeActiveTab: null,
  setHomeActiveTab: () => { },
  homeSelectedTag: null,
  setHomeSelectedTag: () => { },
  appSurface: 'ai-home',
  setAppSurface: () => { },
  workbenchView: 'home',
  setWorkbenchView: () => { },
});

export const useSidebarContext = () => useContext(SidebarContext);
