import { Injectable } from '@nestjs/common';
import { User } from './users/entities/User';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
