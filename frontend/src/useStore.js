import {create} from 'zustand';

const useStore = create((set) => ({
  accessToken: sessionStorage.getItem('accessToken') || null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAccessToken: () => {
    sessionStorage.removeItem('accessToken');
    set({ accessToken: null });
  },
  email: null,
  setEmail: (email) => set({ email }),
}));

export default useStore; 