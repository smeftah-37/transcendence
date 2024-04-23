import { Injectable, Req } from '@nestjs/common';
import { UserDetails } from './utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/User';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    userlog:User;
    constructor(@InjectRepository(User) private readonly userRepository:Repository<User>,private jwtService: JwtService){}

    async validateUser(details : UserDetails)
    {
    if (!details || !details.displayName) {
        throw new Error('Invalid details provided for user validation.');
    }

    try {
        const user = await this.userRepository.findOne({where:{ displayName: details.displayName }});
        if (user) {
            return user;
        }

        const newUser = await this.userRepository.create(details);
        return await this.userRepository.save(newUser);
    } catch (error) {
        throw new Error(`Error validating user: ${error.message}`);
    }
}
    async findUser(id : number)
    {
        const user = await this.userRepository.findOneBy({id});
        return user;
    }

    async login(user: any) {
        this.userlog  = user;
}
}
