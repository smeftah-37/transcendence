import { Inject, Injectable, Req, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, Profile } from 'passport-42';
import { AuthService } from "../auth.service";
import { UsersService } from "src/users/users.service";
import { User } from "src/users/entities/User";
import { TokenService } from "../token.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService: AuthService, private readonly usersService: UsersService, private readonly tokenService: TokenService,
    ) {
        super({


            clientID: "u-s4t2ud-cc8524e85c096f3bdd841bcfdc773931d72636d7eab67585841c5c20bb8b4c1a",
            clientSecret: "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",

            callbackURL: "http://10.13.1.10:3004/SchoolOfAthensApi/auth/login/42/return/",

            Scope: ['profile'],
        });
    }
    async validate(accessToken: string, refreshToken: string, profile: Profile) {
        const user = await this.authService.validateUser({
            email: profile.emails[0].value,
            displayName: profile.displayName,
            avatar: profile._json.image.link,
        });
        try {
            if (user.id) {
                await this.usersService.findByUsername(profile.username);

                await this.usersService.create(user);
            }


        }
        catch (error) {

        }

        return user || null;

    }
}
