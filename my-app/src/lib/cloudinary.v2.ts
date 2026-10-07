import { v2 as cloudinary } from 'cloudinary'
import { BadRequestError } from './errors/appError'

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
  resourceType: 'image' | 'raw'
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {

  if (file.size > options.maxSize) {
    throw new BadRequestError("El archivo supera el tamaño máximo permitido")
  }

  if (!options.allowedMimeTypes.includes(file.type)) {
    throw new BadRequestError("El tipo de archivo no está permitido")
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error ?? new Error('Cloudinary upload failed'))
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    ).end(buffer)
  })
}

export async function deleteFile(
  publicId: string,
  resourceType: 'image' | 'raw'
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  })
}