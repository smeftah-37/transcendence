// token.service.ts
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class TokenService {
  private readonly secretKey ='malak2025';

  generateToken(userId: string): string {
    const payload = { userId };
    return jwt.sign(payload, this.secretKey, { expiresIn: '1h' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      return null;
    }
  }
}
