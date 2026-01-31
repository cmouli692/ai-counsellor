import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../src/config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  try {
    console.log('🗂️  Running migrations...');
    
    const migrationsDir = path.join(__dirname, '../database/migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        console.log(`  Running ${file}...`);
        await db.query(sql);
        console.log(`  ✅ ${file} completed`);
      }
    }
    
    console.log('\n✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

runMigrations();
