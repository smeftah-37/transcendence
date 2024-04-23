import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AvatarMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const avatar = req.file;
    const MAX_AVATAR_SIZE = 4 * 1024 * 1024;
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar file is required' });
    }

    if (avatar.size > MAX_AVATAR_SIZE) {
      return res.status(400).json({ message: 'Avatar file is too large' });
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedMimeTypes.includes(avatar.mimetype)) {
      return res.status(400).json({ message: 'Invalid file type. Only JPEG, PNG, and GIF are allowed' });
    }

    next();
  }
}