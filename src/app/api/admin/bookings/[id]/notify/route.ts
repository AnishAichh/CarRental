import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
// import nodemailer from 'nodemailer';

export async function POST(request: NextRequest, context: { params: { id: string } }) {
    try {
        const bookingId = context.params.id;
        const { location, time, notes } = await request.json();

        // Fetch booking, user, and vehicle info
        const { rows } = await pool.query(`
      SELECT b.id, b.user_id, b.start_date, b.end_date, u.email AS user_email, u.name AS user_name, v.name AS vehicle_name
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vehicles v ON v.id = b.vehicle_id
      WHERE b.id = $1
    `, [bookingId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }
        const booking = rows[0];

        // Update booking status to 'confirmed'
        await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['confirmed', bookingId]);

        // Create notification for the user
        await pool.query(
            'INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)',
            [
                booking.user_id,
                'Booking Confirmed!',
                `Your booking for ${booking.vehicle_name} is confirmed!\nPickup Info: ${location}, ${time}. ${notes || ''}`
            ]
        );

        // Simulate sending notification and email
        console.log('Simulated notification/email to user:', {
            to: booking.user_email,
            subject: `Your DriveX Booking Pickup Details`,
            text: `Hello ${booking.user_name || ''},\n\nYour booking for ${booking.vehicle_name} is confirmed!\n\nPickup Location: ${location}\nPickup Time: ${time}\n${notes ? `Notes: ${notes}\n` : ''}\nBooking Dates: ${booking.start_date} to ${booking.end_date}\n\nThank you for choosing DriveX!`,
        });

        // Always return success for now
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Notify user error:', error);
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
} 