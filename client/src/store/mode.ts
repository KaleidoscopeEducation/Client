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
      // guard for SSR / non-browser
      if (typeof window !== 'undefined') {
        try {
          // Clear mode only on "app startup" (first load of this tab)
          const bootFlag = sessionStorage.getItem('appBooted');
          if (!bootFlag) {
            localStorage.removeItem('mode');       // clear persisted mode
            sessionStorage.setItem('appBooted', '1'); // mark tab as booted
          }

          // Restore (if any) after optional clearing above
          const saved = localStorage.getItem('mode');
          if (saved) setSelf(saved as Mode);

          // Persist on changes
          onSet((val) => {
            if (val === null) {
              localStorage.removeItem('mode');
            } else {
              localStorage.setItem('mode', val);
            }
          });
        } catch {
          // ignore storage errors (private mode, etc.)
        }
      }
    },
  ],
});
