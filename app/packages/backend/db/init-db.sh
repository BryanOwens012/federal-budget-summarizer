#!/bin/bash
set -e

echo "Starting database initialization at $(date)"

# First run migrations
echo "Running migrations..."
for migration in /docker-entrypoint-initdb.d/migrations/*up.sql; do
    echo "Running migration: $migration"
    if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration"; then
        echo "✓ Migration $migration completed successfully"
    else
        echo "✗ Migration $migration failed"
        exit 1
    fi
done

# Verify migrations created the tables
echo "Verifying tables after migrations:"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "\dt"

# Then run seeds
echo "Running seeds..."
for seed in /docker-entrypoint-initdb.d/seeds/*.sql; do
    echo "Running seed: $seed"
    if psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$seed"; then
        echo "✓ Seed $seed completed successfully"
    else
        echo "✗ Seed $seed failed"
        exit 1
    fi
done

# Verify data was seeded by showing row counts
echo "Verifying seeded data:"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns,
       (SELECT count(*) FROM (SELECT 1 FROM pg_class c WHERE c.relname = t.table_name) as x) as rows
FROM (
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public' 
    AND table_type='BASE TABLE'
) t
ORDER BY table_name;"

echo "Database initialization completed at $(date)"