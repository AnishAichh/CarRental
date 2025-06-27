import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    const url = request.nextUrl;
    const id = url.pathname.split("/").reverse()[1]; // Extracts the [id] param
    try {
        const { location, time, notes } = await request.json();

        // Fetch booking, user, and vehicle info
        const { rows } = await pool.query(`
      SELECT b.id, b.start_date, b.end_date, u.email AS user_email, u.name AS user_name, v.name AS vehicle_name
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vehicles v ON v.id = b.vehicle_id
      WHERE b.id = $1
    `, [id]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const booking = rows[0];

        // Configure Nodemailer (replace with your SMTP credentials)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.example.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'your@email.com',
                pass: process.env.SMTP_PASS || 'yourpassword',
            },
        });

        const mailOptions = {
            from: process.env.SMTP_FROM || 'noreply@vheego.com',
            to: booking.user_email,
            subject: `Your Vheego Booking Pickup Details`,
            text: `Hello ${booking.user_name || ''},\n\nYour booking for ${booking.vehicle_name} is confirmed!\n\nPickup Location: ${location}\nPickup Time: ${time}\n${notes ? `Notes: ${notes}\n` : ''}\nBooking Dates: ${booking.start_date} to ${booking.end_date}\n\nThank you for choosing Vheego!`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notify user error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
} 