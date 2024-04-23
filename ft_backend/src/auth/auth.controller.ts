
import { Body, Controller, Get,Param, Post, Redirect, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthenticatedGuard, FTAuthGuard } from './utils/Guards';
import { User } from 'src/users/entities/User';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { UserDetails } from './utils/types';
import { FortyTwoStrategy } from './utils/42Strategy';
import { PassportSerializer } from '@nestjs/passport';
import { SessionSerializer } from './utils/Serializer';
import { TokenService } from './token.service';
import { TwoFactorAuthService } from './A2f/A2f.service';
import { Response } from 'express';
import { authenticator } from 'otplib'; // Import authenticator from otplib
import * as qrcode from 'qrcode';

@Controller('auth')
export class AuthController {

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private readonly twoFactorAuthService: TwoFactorAuthService 
  ){}

  @Get('login/42/')
  @UseGuards(FTAuthGuard)
  async auth42(@Req() req,@Res() res) {
    
  }
  
  @Get('login/42/return/')
  @UseGuards(FTAuthGuard)
  async Hello(@Req() req , @Res() res) {
    res.redirect('http://10.13.1.10:3000/'); // Replace '/' with your actual home page URL
  }
  
  @Get('logged')
  async status(@Req() req,@Res() res) {
    await this.authService.login(req.user);
    
    // Assuming this.authService.userlog is the JSON object you want to return
    // Set the response body and status
    let token = null;
    if(this.authService.userlog)
      token = this.tokenService.generateToken(this.authService.userlog.id.toString());
    await  res.status(200).json({user: this.authService.userlog,token});
  }


  @Get('logout')
  async logout(@Req() req, @Res() res) {
    // Destroy the session and log the user out
    await res.clearCookie('access_token'); // Example for clearing a cookie

    // Redirect to the home page or login page after logout
    await res.redirect('/');
  }

  @Get('qr-code/:secret')
  async getQRCode(@Param('secret') secret: string, @Res() res: Response) {
    return  await this.twoFactorAuthService.generateQRCode(secret,res)
    
    
  }

}
