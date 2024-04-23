import { Conversation } from "src/conversation/entities/conversation";
import { Game } from "src/game/entities/game";
import { Room } from "src/room/entities/Room";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Rank } from "./Rank";

@Entity({name: 'users'})
export class User{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable: true})
    username:string;

    @Column({nullable: true})
    displayName:string;

    @Column({nullable: true})
    email:string;
    
    @Column({nullable: true})
    avatar:string;
    
    @Column({ nullable: true })

    secretKey: string;
    @Column({ default: false })
    A2f: boolean;
    
    @Column({nullable: true})
    GameStatus:number;

    @Column({nullable: true})
    Status:number;

    @Column({nullable: true})
    charachter:string;

    @Column({nullable: true})
    socketId:string;

    @Column({type:"integer",  array: true ,nullable: true})
    friends:number[];

    @Column({type:"integer",  array: true ,nullable: true})
    blocked:number[];


    @Column({type:"integer",  array: true ,nullable: true})
    blockedBy:number[];

    @Column({type:"integer",  array: true ,nullable: true})
    pendingInvitation:number[];

    @Column({type:"integer",  array: true ,nullable: true})
    pendingGame:number[];

    @ManyToMany(() => Room,{cascade: true},)
    @JoinTable()
    rooms: Room[];

    @Column({type:"integer",  array: true ,nullable: true})
    games: number[];
    

    @Column({default : 0})
    played:number;
    @Column({default : 0})
    won:number;
    @Column({default : 0})
    lost:number;
    @Column({default : 0})
    lvl:number;
    @Column({default : 0})
    xp:number;

    @OneToMany(() => Conversation, conversation => conversation.user,{eager: true,cascade: true,nullable:true},)
    @JoinTable()
    ConversationHistories: Conversation[];

}