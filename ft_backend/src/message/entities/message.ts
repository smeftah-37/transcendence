import { Conversation } from "src/conversation/entities/conversation";
import { User } from "src/users/entities/User";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'message'})
export class Message{
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    timeSent:string;

    @CreateDateColumn({ type: "timestamp" })
    timestamp: Date;
    
    @Column()
    message:string;
    
    @ManyToOne(() => User)
    sender: User;
  
    @ManyToOne(() => User, { nullable: true })
    receiver: User;

    @ManyToOne(() => Conversation, conversation => conversation.chat)
    conversation: Conversation;
}


