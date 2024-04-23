import { Conversation } from "src/conversation/entities/conversation";
import { Message } from "src/message/entities/message";
import { User } from "src/users/entities/User";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MutedUser } from "./MutedUser";


@Entity({ name: 'room' })
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    description: string;

    @Column()
    roomName: string;

    @Column()
    type: string;

    @OneToOne(() => Message, { nullable: true, eager: true, cascade: true })
    @JoinColumn()
    last_message: Message;

    @Column()
    avatar: string;

    @Column({ nullable: true })
    password: string;

    @Column({ type: "integer", array: true, nullable: true })
    banUsers: number[];

    @ManyToOne(() => User, { cascade: true, nullable: true })
    @JoinColumn()
    owner: User;

    @ManyToMany(() => User, { cascade: true })
    @JoinTable()
    admin: User[];

    @ManyToMany(() => User, { cascade: true })
    @JoinTable()
    users: User[];

    @OneToMany(() =>MutedUser, mutedUser => mutedUser.room, { nullable: true , eager: true, cascade: true}) // Define the inverse side of the relationship
    @JoinColumn()
    mutedUser: MutedUser[];

    @OneToOne(() => Conversation, conversation => conversation.room, { nullable: true, eager: true, cascade: true })
    @JoinColumn()
    conversation: Conversation;

}