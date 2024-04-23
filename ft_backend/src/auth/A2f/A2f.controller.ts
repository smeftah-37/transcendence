import { Controller, Post, Body } from '@nestjs/common';
import { TwoFactorAuthService } from './A2f.service';

@Controller('2fa')
export class TwoFactorAuthController {
  constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

  @Post('generate-secret')
  generateSecret() {
    const secretKey = this.twoFactorAuthService.generateSecret();
    return { secretKey };
  }

  @Post('verify-token')
  verifyToken(@Body() body: { secretKey: any; token: string }) {
    const { secretKey, token } = body;
    const isValid = this.twoFactorAuthService.verifyToken(secretKey, token);
    return { isValid };
  }
}