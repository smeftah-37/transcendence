import { Message } from "src/message/entities/message";
import { Room } from "src/room/entities/Room";
import { User } from "src/users/entities/User";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'conversation'})
export class Conversation
{
    @PrimaryGeneratedColumn()
    id:number;
 
    @Column({nullable:true})
    type: string;
    
    @CreateDateColumn({ type: "timestamp" })
    timestamp: Date;
    
    @ManyToOne(() => User,user => user.ConversationHistories)
    friend: User;

    @OneToOne(()=> Room)
    room: Room;

    @OneToMany(() => Message, message => message.conversation,{  nullable: true, cascade: true})
    chat: Message[];

    @ManyToOne(() => User, user => user.ConversationHistories)
    user: User[];
}