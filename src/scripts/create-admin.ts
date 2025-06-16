import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

async function createAdminUser() {
    try {
        const email = 'admin@drivex.com'  // Replace with your desired admin email
        const password = 'admin123'  // Replace with your desired password
        const name = 'Admin User'  // Replace with your desired admin name

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insert admin user
        const result = await pool.query(
            `INSERT INTO users (
                email,
                password,
                name,
                role,
                is_admin,
                is_kyc_verified
            ) VALUES ($1, $2, $3, 'admin', true, true)
            RETURNING id, email, name, role, is_admin`,
            [email, hashedPassword, name]
        )

        console.log('✅ Admin user created successfully:', result.rows[0])
    } catch (error) {
        console.error('❌ Error creating admin user:', error)
    } finally {
        process.exit()
    }
}

createAdminUser() 