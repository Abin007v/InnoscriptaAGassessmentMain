export const retryWithBackoff = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let retries = 0;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      if (retries > maxRetries) {
        throw error;
      }

      // Check if it's a rate limit error
      if (error.statusCode === 429) {
        const retryAfter = error.headers?.['retry-after'] || 
          error.headers?.['Retry-After'] || 
          Math.pow(2, retries) * initialDelay;
        
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        continue;
      }

      throw error;
    }
  }
}; 