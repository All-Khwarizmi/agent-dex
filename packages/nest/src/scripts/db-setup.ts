// apps/api/src/scripts/db-setup.ts
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function initializeDb() {
  // Log connection string for debugging
  console.log('Using connection string:', process.env.DATABASE_URL);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Testing connection...');
    await pool.query('SELECT NOW()');
    console.log('Connection successful');

    console.log('Initializing database...');

    // Vérifier si l'enum existe déjà
    const checkEnum = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'user_status'
      );
    `);

    if (!checkEnum.rows[0].exists) {
      await pool.query(`
        CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
      `);
      console.log('Created user_status enum');
    }

    // Créer la table si elle n'existe pas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        status user_status DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Ensured users table exists');

    // Créer les index s'ils n'existent pas
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    `);
    console.log('Ensured indexes exist');

    // Insérer des données de test si la table est vide
    const count = await pool.query('SELECT COUNT(*) FROM users');
    if (count.rows[0].count === '0') {
      await pool.query(`
        INSERT INTO users (name, email, status) VALUES 
        ('John Doe', 'john@example.com', 'active'),
        ('Jane Doe', 'jane@example.com', 'active'),
        ('Bob Smith', 'bob@example.com', 'pending')
        ON CONFLICT (email) DO NOTHING;
      `);
      console.log('Added test data');
    }

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Permettre l'exécution directe avec node
if (require.main === module) {
  initializeDb().catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
}
