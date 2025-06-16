import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function runMigrations() {
    const client = await pool.connect()
    try {
        // Create migrations table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `)

        // Get list of migration files
        const migrationsDir = path.join(process.cwd(), 'src', 'lib', 'migrations')
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort()

        // Get executed migrations
        const { rows: executedMigrations } = await client.query(
            'SELECT name FROM migrations'
        )
        const executedMigrationNames = new Set(executedMigrations.map(m => m.name))

        // Run pending migrations
        for (const file of files) {
            if (!executedMigrationNames.has(file)) {
                console.log(`Running migration: ${file}`)
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')

                await client.query('BEGIN')
                try {
                    await client.query(sql)
                    await client.query(
                        'INSERT INTO migrations (name) VALUES ($1)',
                        [file]
                    )
                    await client.query('COMMIT')
                    console.log(`Completed migration: ${file}`)
                } catch (error) {
                    await client.query('ROLLBACK')
                    console.error(`Failed to run migration ${file}:`, error)
                    throw error
                }
            }
        }

        console.log('All migrations completed successfully')
    } finally {
        client.release()
        await pool.end()
    }
}

// Run migrations if this file is executed directly
if (require.main === module) {
    runMigrations().catch(console.error)
}

export default runMigrations 