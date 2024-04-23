import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany,OneToOne,PrimaryGeneratedColumn } from "typeorm";
import { Point} from "./point";
import { User } from "src/users/entities/User";
import { JoinAttribute } from "typeorm/query-builder/JoinAttribute";

@Entity({name: 'game'})
export class Game{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToMany(() => User)
    @JoinTable()
    Players:User[]
    @Column({default:0})
    Playerscore1:number;

    @Column({default:0})
    Playerscore2:number;
    @Column({nullable:true})
    Time:string;

    @Column()
    status:number;



    
    @Column({nullable:true})
    Duration:string;

    @Column("int", { array: true ,nullable:true})
    Winner:number[];

    @Column("int", { array: true ,nullable:true})
    Loser:number[];
    @OneToMany(() => Point, DataPlayers => DataPlayers.game, { cascade: true })
    @JoinColumn()
    DataPlayers: Point[];
    


   


}