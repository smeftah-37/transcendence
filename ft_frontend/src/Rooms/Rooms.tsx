import React, { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './Rooms.css';
import moment from 'moment';
import ElementMsg from "../Messages/ElementMsg/ElementMsg.js";
import CreateChannel from './CreateChannel/CreateChannel.tsx';
import { useOtherState, useSocket, useUser } from '../SocketContext.tsx';
import decart from '../Navbar/rooms.png'
import img from '../Navbar/im.gif'

interface ChannelBarProps {
    user: string;
}

const ChannelBar: React.FC<ChannelBarProps> = (props) => {
    return (
        <>
            <Link to={'CreateChannel'} state={props.user} style={{ textDecoration: 'none' }}>
                <div className='CreateChannel-class'>
                    Create New Room
                    <span></span><span></span><span></span><span></span>
                </div>
            </Link>
        </>
    )
}
const DefaultComponent: React.FC<DefaultComponentProps> = ({ img }) => {
    return (
      <div className='in'>
        <h2>Embrace the wisdom of the ancients! Share your thoughts and moments with friends or a circle of enlightened minds through photos and private messages.</h2>
        <img src={img} alt="Image" />
      </div>
    );
  }
interface JoinRoomProps {
    img: string;
    name: string;
    desc: string;
    userId: string;
    roomId: string;
    type: string;
    password: string;
}

const JoinRoom: React.FC<JoinRoomProps> = (props) => {
    const { img, name, desc, userId, roomId, type } = props;
    const [addpassword, setPassword] = useState('');
    const { socket } = useSocket();

    const handleClick = () => {
        if (type !== 'protected') {
            socket.current.emit('join-room', {
                roomId, userId, status: 0
            });
        } else {
            socket.current.emit('join-room', {
                roomId, userId, status: 1, password: addpassword
            });
        }
    }

    return (
        <>
            <br />
            <div className="JoinRoom">
                <img src={img && img.length > 0 ? `http://10.13.1.10:3004/SchoolOfAthensApi/rooms/avatar/${roomId}` :  decart } alt={''} />
                <div className="hermomo1">
                    <h4 className="name-class">{name}</h4>
                    <h5 className="mesg">{desc}</h5>
                </div>
                {type === "protected" && (
                    <div>
                        <input
                            type="password"
                            value={addpassword}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                )}
                <button className='button-chat' onClick={handleClick}>+</button>
            </div>
        </>
    );
}

interface ChannelElementProps {
    user: string;
    imgparam: string;
    name: string;
    msg: string;
    timestamp: string;
    room: string;
}

const ChannelElement: React.FC<ChannelElementProps> = (props) => {
    const {  imgparam, name, msg, timestamp, room } = props;
    const relativeTime = moment(timestamp).fromNow();
 

    const changeMsg = (message: string) => {
        if (message.length > 10) {
            message = message.substring(0, 9) + '...';
        }
        return message;
    }

    return (
        <>
            <div className="Element-class">
                {console.log(room.avatar, room.avatar.length)}
                <img src={room.avatar && room.avatar.length > 0 ? `http://10.13.1.10:3004/SchoolOfAthensApi/rooms/avatar/${room.id}` : decart} alt={name} />
                <h4 className="name-class">{name}</h4>
                <h6 className="date">{relativeTime}</h6>
                <h5 className="mesg">{changeMsg(msg)}</h5>
            </div>
        </>
    );
}

const Rooms: React.FC = (props) => {
    const { socket,updateSocket } = useSocket();
    let { user, updateUser } = useUser();
    const { rooms, roomsNotBelong } = useOtherState();

    const [isTyping, setisTyping] = useState([]);
    const [lastMessage, setLastMessage] = useState([]);
    const navigate = useNavigate();

    if (!user.current) {
        user.current = updateUser(user.current);
    }
    if(!socket.current)
        socket.current = updateSocket(socket.current);
    useEffect(() => {
        if(!socket.current)
            socket.current = updateSocket(socket.current);
        socket.current.on('typing', (newTyping) => { setisTyping(newTyping) });
        socket.current.on('stop-typing', (newTyping) => { setisTyping([]) });
        socket.current.on('password-failed', () => {
            alert('incorrect password');
        })

        return () => {
            socket.current.off('typing');
            socket.current.off('stop.typing');
        };
    }, []);

    const handleClick = (room: string) => {
        navigate('ElementMsg', {
            state: {
                type: 'room',
                room: room,
                name: room.roomName,
                img: room.avatar,
            }
        });
    }

    return (
        <>
            <div className='Room-chat'>
                <div className="div-class">
                    <div className="Rooms">
                        <ChannelBar user={user} />
                        <div className="Appearmsg">
                            <ul className='AddNewElement'>
                                {rooms ? (
                                    rooms.map((room) => (
                                        <li key={room.id} onClick={() => handleClick(room)}>
                                            {console.log("avatar ==>", room.avatar)}
                                            <ChannelElement
                                                user={user}
                                                img={room.avatar}
                                                name={room.roomName}
                                                msg={((isTyping && user.current.blocked && user.current.blocked.includes(isTyping.senderId)) || (room.last_message && user.current.blocked && user.current.blocked.includes(room.last_message.sender.id))) ? <></> : (isTyping && isTyping.roomId === room.id ? (isTyping.username + ": Typing ...") : (room.last_message ? (": " + room.last_message.message) : <></>))}
                                                room={room}
                                                timestamp={(lastMessage && lastMessage.roomId === room.id ? (lastMessage.message.timeSent) : room.last_message.timeSent)}
                                            />
                                            <br />
                                        </li>
                                    ))
                                ) : (
                                    <><h1>{rooms}</h1></>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className='public_protected'>
                        <hr className='line' />
                        <ul className='AddNewElement'>
                            {roomsNotBelong && roomsNotBelong[0] ? (
                                roomsNotBelong.map((room) => (
                                    <li key={room.id} className="Joinhinho">
                                        <JoinRoom
                                            img={room.avatar}
                                            name={room.roomName}
                                            desc={room.description}
                                            roomId={room.id}
                                            userId={user.current.id}
                                            type={room.type}
                                            password={room.password}
                                        />
                                        <br />
                                    </li>
                                ))
                            ) : (
                                <><h1>{roomsNotBelong}</h1></>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <div className='Element-chat'>
                <Routes>
                    <Route path="ElementMsg" element={<ElementMsg />} />
                    <Route path="CreateChannel" element={<CreateChannel />} />
                    <Route path="*" element={<DefaultComponent img={img} />} />
                    
                </Routes>
            </div>
        </>
    );
}

export default Rooms;