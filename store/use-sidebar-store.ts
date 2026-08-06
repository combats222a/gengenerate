"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  /** Развёрнут ли Sidebar на десктопе: иконки vs полное меню с подписями */
  isExpanded: boolean;
  /** Открыт ли мобильный drawer (Sheet) поверх контента */
  isMobileOpen: boolean;
  toggleExpanded: () => void;
  setExpanded: (value: boolean) => void;
  setMobileOpen: (value: boolean) => void;
}

/**
 * Состояние Sidebar вынесено в Zustand, а не в React Context, потому что:
 *  - оно нужно одновременно Header (кнопка-переключатель) и самому Sidebar;
 *  - предпочтение пользователя (развёрнут/свёрнут) должно переживать
 *    переходы между страницами и перезагрузку — для этого используется
 *    persist-middleware (localStorage), сохраняющий только isExpanded.
 */
export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isExpanded: false,
      isMobileOpen: false,
      toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
      setExpanded: (value) => set({ isExpanded: value }),
      setMobileOpen: (value) => set({ isMobileOpen: value }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({ isExpanded: state.isExpanded }),
    },
  ),
);
