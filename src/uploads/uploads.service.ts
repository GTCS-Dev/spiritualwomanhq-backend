import { BadRequestException, Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new BadRequestException('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET');
    }

    return await new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER ?? 'spiritualwoman',
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(new BadRequestException('Image upload failed'));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      stream.end(file.buffer);
    });
  }
}
