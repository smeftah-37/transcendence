import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from './token.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly tokenService: TokenService) {}

  private readonly excludedPaths = ['/SchoolOfAthensApi/auth/login/42/', '/SchoolOfAthensApi/auth/*','/SchoolOfAthensApi/auth/logged']; // Define excluded paths

  use(req: Request, res: Response, next: NextFunction) {
    const path = req.path; // Get the request path

    // Check if the request path is in the excluded paths
    if (this.isExcludedPath(path)) {
      // If it's an excluded path, skip authentication and proceed to the next middleware
      return next();
    }

    // Proceed with authentication logic for non-excluded paths
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    const decodedToken = this.tokenService.verifyToken(token);
    if (!decodedToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Attach the decoded token to the request object for use in subsequent middleware or controllers
    req.user = decodedToken;
    next();
  }

  private isExcludedPath(path: string): boolean {
    // Check if the request path matches any of the excluded paths
    return this.excludedPaths.some(excludedPath => path.startsWith(excludedPath));
  }
}
