const { pool } = require('../config/database');

const resetDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('Resetting database...');
    
    await client.query('BEGIN');
    
    // Drop all tables in reverse order (to handle foreign key constraints)
    const dropQueries = [
      'DROP TABLE IF EXISTS review_helpfulness CASCADE',
      'DROP TABLE IF EXISTS reviews CASCADE',
      'DROP TABLE IF EXISTS stores CASCADE',
      'DROP TABLE IF EXISTS categories CASCADE',
      'DROP TABLE IF EXISTS users CASCADE',
      'DROP TABLE IF EXISTS migrations CASCADE',
      'DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE',
      'DROP FUNCTION IF EXISTS update_store_rating_stats() CASCADE',
      'DROP FUNCTION IF EXISTS update_review_helpful_count() CASCADE'
    ];
    
    for (const query of dropQueries) {
      await client.query(query);
    }
    
    await client.query('COMMIT');
    console.log('✓ Database reset completed');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('✗ Database reset failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

// Run reset if called directly
if (require.main === module) {
  resetDatabase().finally(() => {
    pool.end();
  });
}

module.exports = { resetDatabase };