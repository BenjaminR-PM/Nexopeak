// Simple filesystem cache handler for Next.js to optimize Heroku deployments
const fs = require('fs');
const path = require('path');

class FilesystemCacheHandler {
  constructor(options) {
    this.cacheDir = options?.cacheDir || path.join(process.cwd(), '.next/cache/custom');
    this.ttl = options?.ttl || 1000 * 60 * 60 * 24; // 24 hours default
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  async get(key) {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Check if cache has expired
      if (Date.now() > data.expires) {
        fs.unlinkSync(filePath);
        return null;
      }

      return data.value;
    } catch (error) {
      console.warn('Cache read error:', error.message);
      return null;
    }
  }

  async set(key, value) {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      const data = {
        value,
        expires: Date.now() + this.ttl,
        created: Date.now(),
      };

      fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
      return true;
    } catch (error) {
      console.warn('Cache write error:', error.message);
      return false;
    }
  }

  async delete(key) {
    try {
      const filePath = path.join(this.cacheDir, `${key}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (error) {
      console.warn('Cache delete error:', error.message);
      return false;
    }
  }
}

module.exports = FilesystemCacheHandler;
