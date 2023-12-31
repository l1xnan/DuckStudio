import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

import { debounce } from '@/utils';

export type SettingState = {
  precision?: number;
  table_font_family?: string;
};

type SettingAction = {
  setStore: (state: SettingState) => void;
};

export const useSettingStore = create<SettingState & SettingAction>()(
  devtools(
    persist(
      (set) => ({
        precision: 4,
        setStore: debounce((state: object) => set((_) => ({ ...state }))),
      }),
      {
        name: 'settingStore',
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);
