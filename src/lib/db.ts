import { Pool } from 'pg'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    const client = await pool.connect()
    try {
        const result = await client.query(text, params)
        return result.rows
    } finally {
        client.release()
    }
}

export async function queryOne<T = any>(
    text: string,
    params?: any[]
): Promise<T | null> {
    const rows = await query<T>(text, params)
    return rows[0] || null
}

export async function transaction<T>(
    callback: (client: any) => Promise<T>
): Promise<T> {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const result = await callback(client)
        await client.query('COMMIT')
        return result
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

export async function checkExists(
    table: string,
    field: string,
    value: any
): Promise<boolean> {
    const result = await queryOne<{ exists: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM ${table} WHERE ${field} = $1) as exists`,
        [value]
    )
    return result?.exists || false
}

export async function getById<T = any>(
    table: string,
    id: number
): Promise<T | null> {
    return queryOne<T>(`SELECT * FROM ${table} WHERE id = $1`, [id])
}

export async function create<T = any>(
    table: string,
    data: Record<string, any>
): Promise<T> {
    const fields = Object.keys(data)
    const values = Object.values(data)
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ')
    const fieldNames = fields.join(', ')

    const result = await queryOne<T>(
        `INSERT INTO ${table} (${fieldNames}) VALUES (${placeholders}) RETURNING *`,
        values
    )

    if (!result) {
        throw new Error(`Failed to create record in ${table}`)
    }

    return result
}

export async function update<T = any>(
    table: string,
    id: number,
    data: Record<string, any>
): Promise<T> {
    const fields = Object.keys(data)
    const values = Object.values(data)
    const setClause = fields
        .map((field, i) => `${field} = $${i + 1}`)
        .join(', ')

    const result = await queryOne<T>(
        `UPDATE ${table} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
        [...values, id]
    )

    if (!result) {
        throw new Error(`Failed to update record in ${table}`)
    }

    return result
}

export async function remove(
    table: string,
    id: number
): Promise<void> {
    const result = await queryOne(
        `DELETE FROM ${table} WHERE id = $1 RETURNING id`,
        [id]
    )

    if (!result) {
        throw new Error(`Failed to delete record from ${table}`)
    }
}

export default pool
