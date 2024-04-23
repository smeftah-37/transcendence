import { User } from "src/users/entities/User";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'profile'})
export class profil{
    @PrimaryGeneratedColumn()
    id:string;

    @Column()
    total_games:number;

    @Column()
    won_per:number;

    @Column()
    won:number;

    @Column()
    lose:number;

    @Column()
    aces:number;

    @Column()
    friends:User[];

    @Column()
    rank:number;

    @Column()
    bagel:number;

    // @Column()
    // lastMatchs:game[];
}