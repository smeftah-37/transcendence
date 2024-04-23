import { Conversation } from "src/conversation/entities/conversation";
import { Game } from "src/game/entities/game";
import { Room } from "src/room/entities/Room";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity({name: 'rank'})
export class Rank{
    @PrimaryGeneratedColumn()
    id:number;

    @OneToOne(() => User)
    user: User;

    @Column()
    Xp: number;

    @Column()
    level: number;

}