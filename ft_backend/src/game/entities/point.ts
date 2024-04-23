
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./game";

@Entity({name: 'point'})
export class Point{
    @PrimaryGeneratedColumn()
    id:number;

    @Column({nullable:true})

    Playerid:number;
    @Column("float", { array: true ,nullable:true})
    Start:number[];
    @Column("float", { array: true ,nullable:true})
    C1:number[];
    @Column("float", { array: true ,nullable:true})
    C2:number[];
    @Column("float", { array: true ,nullable:true})
    End:number[];
    @ManyToOne(() => Game, {nullable:true})
    game: Game;
    







}
export default Point;