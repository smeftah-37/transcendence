import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FTAuthGuard extends AuthGuard('42') {
  async canActivate(context: ExecutionContext) {
    try {
      const activate = (await super.canActivate(context)) as boolean;
      const request = context.switchToHttp().getRequest();
      await super.logIn(request);
      return activate;
    } catch (error) {
      
      throw error;
    }
  }
}


@Injectable()
export class AuthenticatedGuard implements CanActivate{
  async canActivate(context: ExecutionContext):Promise<boolean>{
    const req = context.switchToHttp().getRequest();
    return req.isAuthenticated();
  }
}

