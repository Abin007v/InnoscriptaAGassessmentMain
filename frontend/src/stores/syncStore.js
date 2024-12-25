import { create } from 'zustand';

const useSyncStore = create((set, get) => ({
  emails: [],
  isLoading: false,
  error: null,
  lastSyncTime: null,
  selectedFolderId: sessionStorage.getItem('selectedFolderId') || null,
  isSyncing: false,

  setEmails: (emails) => {
    console.log('💾 [Frontend] Updating store with emails:', emails.length);
    set({ 
      emails: Array.isArray(emails) ? emails : [],
      isSyncing: false
    });
  },
  
  setLoading: (isLoading) => {
    console.log('⌛ [Frontend] Loading state:', isLoading);
    set({ 
      isLoading,
      // Clear error when starting new load
      ...(isLoading ? { error: null } : {})
    });
  },

  setSyncing: (isSyncing) => {
    console.log('🔄 [Frontend] Sync state:', isSyncing);
    set({ isSyncing });
  },

  setError: (error) => {
    console.log('❌ [Frontend] Error state:', error);
    set({ 
      error, 
      isLoading: false, 
      isSyncing: false 
    });
  },

  setLastSyncTime: (time) => {
    console.log('⏰ [Frontend] Last sync time:', time);
    set({ lastSyncTime: time });
  },

  setSelectedFolder: (folderId) => {
    console.log('📁 [Frontend] Selected folder:', folderId);
    sessionStorage.setItem('selectedFolderId', folderId);
    set({ 
      selectedFolderId: folderId,
      emails: [],
      error: null,
      isLoading: true
    });
  },

  addEmail: (email) => set((state) => ({
    emails: [email, ...state.emails]
  })),

  updateEmail: (emailId, updates) => set((state) => ({
    emails: state.emails.map(email => 
      email.messageId === emailId ? { ...email, ...updates } : email
    )
  })),

  deleteEmail: (emailId) => set((state) => ({
    emails: state.emails.filter(email => email.messageId !== emailId)
  })),

  // Helper to check if we need to refresh
  shouldRefresh: () => {
    const state = get();
    const lastSync = state.lastSyncTime;
    if (!lastSync) return true;
    
    const now = new Date();
    const syncTime = new Date(lastSync);
    return now - syncTime > 30000; // Refresh if last sync was more than 30 seconds ago
  }
}));

export default useSyncStore; 