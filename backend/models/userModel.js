class User {
  static async createIndex(esClient) {
    try {
      const exists = await esClient.indices.exists({ index: 'users' });
      if (!exists) {
        await esClient.indices.create({
          index: 'users',
          body: {
            settings: {
              number_of_shards: 1,
              number_of_replicas: 1
            },
            mappings: {
              properties: {
                email: { type: 'keyword' },
                password: { type: 'keyword' },
                createdAt: { type: 'date' },
                lastLogin: { type: 'date' },
                outlookEmail: { type: 'keyword' },
                isActive: { type: 'boolean' }
              }
            }
          }
        });
        console.log('Users index created successfully');
      }
    } catch (error) {
      console.error('Error creating users index:', error);
      throw error;
    }
  }
}

export { User }; 