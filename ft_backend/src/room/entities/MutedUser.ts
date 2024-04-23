import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Room } from "./Room";





@Entity({ name: 'mutedUser' })
export class MutedUser {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({nullable:true})
    userId:number;

    @Column({nullable:true})
    startTime:Date;

    @Column({nullable:true})
    endTime:Date;
    

    @ManyToOne(() =>Room, room => room.mutedUser) 
    @JoinColumn()// Define the inverse side of the relationship
    room: Room[];

}


