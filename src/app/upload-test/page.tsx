'use client'
import React, { useState } from 'react'

export default function UploadTestPage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setImageUrl(null)
        if (!file) {
            setError('Please select an image file.')
            return
        }
        const formData = new FormData()
        formData.append('image', file)
        setUploading(true)
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setImageUrl(data.url)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
                <h1 className="text-2xl font-light text-emerald-700 mb-6 text-center">Test Image Upload to Cloudinary</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-light file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                            disabled={uploading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={uploading || !file}
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-light hover:bg-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                </form>
                {error && <div className="mt-4 text-red-600 text-sm text-center">{error}</div>}
                {imageUrl && (
                    <div className="mt-6 text-center">
                        <div className="mb-2 text-emerald-700 font-light">Uploaded Image URL:</div>
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="break-all text-emerald-600 underline">{imageUrl}</a>
                        <div className="mt-4">
                            <img src={imageUrl} alt="Uploaded preview" className="mx-auto rounded-lg max-h-64 border border-emerald-100 shadow" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 