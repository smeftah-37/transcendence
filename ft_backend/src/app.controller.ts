import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { FTAuthGuard} from './auth/utils/Guards';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  
}

