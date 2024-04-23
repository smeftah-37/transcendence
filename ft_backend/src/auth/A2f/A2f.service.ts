import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { User } from 'src/users/entities/User';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { toFileStream } from 'qrcode';


@Injectable()
export class TwoFactorAuthService {
  constructor() {}

  async generateSecret(): Promise<string> {
    const secret = authenticator.generateSecret();
    return secret; // Return base32 encoded secret
  }

  async generateQRCode(secretKey: string, stream: Response) {
    const otpauthUrl = authenticator.keyuri('amal.lagmiri@gmail.com', "pingponggame", secretKey);
    return await toFileStream(stream, otpauthUrl);
  }

  async verifyToken(secretKey: string, token: string): Promise<boolean> {
    // Verify the provided token using the secret key
    const as =  authenticator.verify({
      token:secretKey,
      secret: token,
    })
    return as;
  }
}

