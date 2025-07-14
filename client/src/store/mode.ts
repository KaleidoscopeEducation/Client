import { atom } from 'recoil';

/**
 * null  → no mode chosen yet  
 * "start" | "student" | "classroom"  → one of the three buttons was clicked
 */
export type Mode = 'start' | 'student' | 'classroom' | null;

export const modeState = atom<Mode>({
  key: 'mode',
  default: null,
  // optional: remember the last choice after refresh
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      const saved = localStorage.getItem('mode');
      if (saved) setSelf(saved as Mode);
      onSet((val) =>
        val === null ? localStorage.removeItem('mode') : localStorage.setItem('mode', val),
      );
    },
  ],
});
