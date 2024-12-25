import esClient from '../config/database.js';

class BaseModel {
  static async createIndex(indexName, mappings) {
    try {
      const indexExists = await esClient.indices.exists({ index: indexName });
      if (!indexExists) {
        await esClient.indices.create({
          index: indexName,
          body: {
            mappings: {
              properties: mappings
            }
          }
        });
        console.log(`📝 Created ${indexName} index`);
      }
    } catch (error) {
      console.error(`❌ Error creating ${indexName} index:`, error);
      throw error;
    }
  }

  static async bulkIndex(indexName, operations) {
    try {
      if (operations.length > 0) {
        const bulkResponse = await esClient.bulk({
          refresh: true,
          body: operations
        });

        if (bulkResponse.errors) {
          const errorItems = bulkResponse.items.filter(item => item.index.error);
          throw new Error(`Failed to index ${errorItems.length} items`);
        }
      }
    } catch (error) {
      console.error(`❌ Error in bulk indexing ${indexName}:`, error);
      throw error;
    }
  }
}

export { BaseModel }; 