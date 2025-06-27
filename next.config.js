/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['pg'],
    images: {
        domains: [
            'www.hondacarindia.com',
            'imgd.aeplcdn.com',
            'www.marutisuzuki.com',
            'images.unsplash.com',
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
}

module.exports = nextConfig
