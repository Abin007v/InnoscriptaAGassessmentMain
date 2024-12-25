export const emailMapping = {
  mappings: {
    properties: {
      messageId: { type: 'keyword' },
      userId: { type: 'keyword' },
      subject: { type: 'text' },
      bodyPreview: { type: 'text' },
      body: { type: 'text' },
      sender: {
        properties: {
          name: { type: 'text' },
          address: { type: 'keyword' }
        }
      },
      receivedDateTime: { type: 'date' },
      isRead: { type: 'boolean' },
      isDraft: { type: 'boolean' },
      flag: { type: 'object' },
      folderId: { type: 'keyword' },
      lastSyncTime: { type: 'date' }
    }
  }
};

export const syncStateMapping = {
  mappings: {
    properties: {
      userId: { type: 'keyword' },
      deltaLink: { type: 'keyword' },
      lastSync: { type: 'date' }
    }
  }
}; 