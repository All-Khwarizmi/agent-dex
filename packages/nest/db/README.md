# Documentation Base de Données

## 📊 Schema

### Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status user_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 📈 Indexes

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
```

## 🔧 Procédures Stockées

### get_user_with_status

```sql
CREATE OR REPLACE FUNCTION get_user_with_status(p_status user_status)
RETURNS TABLE (id INTEGER, name VARCHAR, email VARCHAR)
```

## 💾 Backup & Restore

```bash
# Backup
pg_dump -h localhost -U postgres myapp > backup.sql

# Restore
psql -h localhost -U postgres myapp < backup.sql
```

## 🔍 Maintenance

### Analyse des performances

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE status = 'active';
```

### Vacuum

```sql
VACUUM ANALYZE users;
```
