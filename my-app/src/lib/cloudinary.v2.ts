import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export type UploadResult = {
  url: string
  publicId: string
}

type UploadOptions = {
  folder: string
  maxSize: number
  allowedMimeTypes: string[]
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  if (file.size > options.maxSize) {
    throw new Error('File size exceeds the allowed limit')
  }

  if (!options.allowedMimeTypes.includes(file.type)) {
    throw new Error('File type is not allowed')
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: options.folder },
      (error, result) => {
        if (error || !result) {
          return reject(error)
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    ).end(buffer)
  })
}

export async function deleteFile(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}