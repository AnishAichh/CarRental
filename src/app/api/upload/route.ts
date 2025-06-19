import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { IncomingForm } from 'formidable'
import { promises as fs } from 'fs'
import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

export const config = {
    api: {
        bodyParser: false,
    },
}

// Enable dynamic route for streaming/multipart
export const dynamic = 'force-dynamic'

// Initialize Cloudinary from env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

async function parseForm(req: Request) {
    // Convert web Request to Node stream for Formidable
    const form = new IncomingForm({ multiples: false })
    const stream = Readable.fromWeb(req.body as any)
    return new Promise<{ fields: formidable.Fields; files: formidable.Files }>((res, rej) => {
        form.parse(stream as any, (err, fields, files) => {
            if (err) return rej(err)
            res({ fields, files })
        })
    })
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const file = formData.get('image') as File | null
        if (!file) {
            console.error('No file uploaded. formData:', formData)
            return NextResponse.json({ error: 'No file uploaded. Please select an image file.' }, { status: 400 })
        }

        // Validate file type & size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            console.error('Unsupported file type:', file.type)
            return NextResponse.json({ error: 'Unsupported file type. Allowed: jpeg, png, webp.' }, { status: 400 })
        }
        const maxSizeInBytes = 5 * 1024 * 1024 // 5 MB
        if (file.size > maxSizeInBytes) {
            console.error('File too large:', file.size)
            return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })
        }

        // Convert file to buffer
        let arrayBuffer, buffer
        try {
            arrayBuffer = await file.arrayBuffer()
            buffer = Buffer.from(arrayBuffer)
        } catch (err) {
            console.error('Failed to convert file to buffer:', err)
            return NextResponse.json({ error: 'Failed to process file upload.' }, { status: 500 })
        }

        // Upload to Cloudinary
        let uploadResult
        try {
            uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: 'vheego_uploads',
                        use_filename: true,
                        unique_filename: false,
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error)
                            return reject(error)
                        }
                        resolve(result)
                    }
                ).end(buffer)
            })
        } catch (err) {
            console.error('Cloudinary upload failed:', err)
            return NextResponse.json({ error: 'Cloudinary upload failed.' }, { status: 500 })
        }

        // @ts-ignore
        return NextResponse.json({ url: uploadResult.secure_url })
    } catch (err: any) {
        console.error('Unexpected error in upload API:', err)
        return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
    }
} 