import { Module } from "@nestjs/common";
import { MyGateway } from "./gateway";
import { RoomService } from "../room/room.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/users/entities/User";
import { Room } from "src/room/entities/Room";
import { Conversation } from "src/conversation/entities/conversation";
import { Message } from "src/message/entities/message";
import { MessageService } from "src/message/message.service";
import { ConversationService } from "src/conversation/conversation.service";
import { UsersService } from "src/users/users.service";
import { MyGameGateway } from "./gatewayGame";
import { GameService } from "src/game/game.service";
import { Game } from "src/game/entities/game";
import { MutedUser } from "src/room/entities/MutedUser";
import { DashbordService } from "src/dashbord/dashbord.service";
import { StorageService } from "src/room/storage.service";
import { TokenService } from "src/auth/token.service";
import { TwoFactorAuthService } from "src/auth/A2f/A2f.service";
import { TwoFactorAuthController } from "src/auth/A2f/A2f.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([Room ,User,Conversation,Message,Game, MutedUser]), // Import repositories into GatewayModule
        // Other imports...
      ],

    providers: [MyGateway, RoomService,MessageService,ConversationService,TwoFactorAuthService,UsersService,MyGameGateway,GameService,DashbordService,StorageService,TokenService],
})
export class GatewayModule {
}