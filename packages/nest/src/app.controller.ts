import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { DatabaseService } from './config/database.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly dbService: DatabaseService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('init-db')
  async initDb() {
    try {
      // Créer l'enum
      await this.dbService.query(`
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
                CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
            END IF;
        END $$;
      `);

      // Créer la table
      await this.dbService.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            status user_status DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Créer les index
      await this.dbService.query(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      `);

      // Insérer des données de test
      await this.dbService.query(`
        INSERT INTO users (name, email, status) 
        VALUES 
            ('John Doe', 'john@example.com', 'active'),
            ('Jane Doe', 'jane@example.com', 'active'),
            ('Bob Smith', 'bob@example.com', 'pending')
        ON CONFLICT (email) DO NOTHING;
      `);

      return { message: 'Database initialized successfully' };
    } catch (error) {
      return { error: error.message };
    }
  }
}
