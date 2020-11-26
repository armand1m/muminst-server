import createStore, { StoreApi } from 'zustand/vanilla';

export type LockState = {
  isLocked: boolean;
  setLocked: (value: boolean) => void;
};

export type LockStore = StoreApi<LockState>;

export const createLockStore = () => {
  const lockStore = createStore<LockState>((set) => ({
    isLocked: false,
    setLocked: (value: boolean) => {
      set({ isLocked: value });
    },
  }));

  return lockStore;
};
