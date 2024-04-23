import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  async upload(file: Express.Multer.File): Promise<string> {
    const uploadDir = './uploads'; // Directory where files will be uploaded

    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate a unique filename to avoid conflicts
    const filename = `${Date.now()}-${file.originalname}`;

    // Define the file path where the uploaded file will be saved
    const filePath = path.join(uploadDir, filename);

    // Write the file to the file system
    fs.writeFileSync(filePath, file.buffer);

    // Return the relative file path (or the full URL if applicable)
    return filePath;
  }
}
