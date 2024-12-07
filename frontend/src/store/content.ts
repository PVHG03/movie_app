import {create} from 'zustand';

export const useContentStore = create((set) => ({
  contentType: 'movie',
  setContentType: (type: 'movie' | 'tv') => set({contentType: type}), 
}));