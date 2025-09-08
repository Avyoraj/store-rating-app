const { Client } = require('pg');
const path = require('path');

// Load setup environment configuration
require('dotenv').config({ path: path.join(__dirname, '..', '.env.setup') });

// Database setup configuration
const setupConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

const createDatabase = async (databaseName) => {
  const client = new Client(setupConfig);
  
  try {
    await client.connect();
    console.log(`Connected to PostgreSQL server`);
    
    // Check if database exists
    const checkResult = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );
    
    if (checkResult.rows.length === 0) {
      // Create database
      await client.query(`CREATE DATABASE "${databaseName}"`);
      console.log(`Database "${databaseName}" created successfully`);
    } else {
      console.log(`Database "${databaseName}" already exists`);
    }
    
  } catch (error) {
    console.error(`Error creating database "${databaseName}":`, error.message);
    throw error;
  } finally {
    await client.end();
  }
};

const setupDatabases = async () => {
  try {
    console.log('Setting up databases...');
    
    // Create development database
    const devDbName = process.env.DB_NAME || 'store_rating_dev';
    await createDatabase(devDbName);
    
    // Create test database
    const testDbName = process.env.NODE_ENV === 'test' 
      ? process.env.DB_NAME 
      : 'store_rating_test';
    await createDatabase(testDbName);
    
    console.log('Database setup completed successfully!');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  }
};

// Run setup if called directly
if (require.main === module) {
  setupDatabases();
}

module.exports = { setupDatabases, createDatabase };