import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export const config = {
    api: {
        bodyParser: false,
    },
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const urls: Record<string, string> = {}

        // Process each file in the form data
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const file = value

                // Check file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    return NextResponse.json(
                        { error: 'File size must be less than 5MB' },
                        { status: 400 }
                    )
                }

                // Check file type
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
                if (!validTypes.includes(file.type)) {
                    return NextResponse.json(
                        { error: 'Invalid file type. Only JPEG, PNG, and PDF files are allowed' },
                        { status: 400 }
                    )
                }

                const bytes = await file.arrayBuffer()
                const buffer = Buffer.from(bytes)

                // Create unique filename
                const uniqueId = uuidv4()
                const extension = file.name.split('.').pop()
                const filename = `${uniqueId}.${extension}`

                // Save file to public/uploads directory
                const uploadDir = join(process.cwd(), 'public', 'uploads')
                const filepath = join(uploadDir, filename)
                await writeFile(filepath, buffer)

                // Add URL to response with the original field name as key
                urls[key] = `/uploads/${filename}`
            }
        }

        return NextResponse.json({ urls })
    } catch (error) {
        console.error('Error uploading files:', error)
        return NextResponse.json(
            { error: 'Failed to upload files' },
            { status: 500 }
        )
    }
} 