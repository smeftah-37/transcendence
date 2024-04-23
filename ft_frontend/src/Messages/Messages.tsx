import React, { FC, useState, useEffect, useRef } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import ElementMsg from "./ElementMsg/ElementMsg";
import Info from './ElementMsg/Info/Info';
import { SocketProvider, useAuth, useOtherState, useSocket, useUser } from '../SocketContext.tsx';
import img from '../Navbar/im.gif'

import './Messages.css';
import '../Navbar/Navbar_.css'

interface MessageElementProps {
    user: any;
    imgparam: string;
    name: string;
    msg: string;
    timestamp: string;
    conv: any;
}

const DefaultComponent: React.FC<DefaultComponentProps> = ({ img }) => {
    return (
      <div className='in'>
        <h2>Embrace the wisdom of the ancients! Share your thoughts and moments with friends or a circle of enlightened minds through photos and private messages.</h2>
        <img src={img} alt="Image" />
      </div>
    );
  }
  

const MessageElement: FC<MessageElementProps> = (props) => {
    const { user, imgparam, name, msg, timestamp, conv } = props;
    const relativeTime = moment(timestamp).fromNow();
    const addProps = {
        type: 'private',
        conv: conv,
        name: name,
        img: imgparam,
    };
    const changeMsg = (message: string) => {
        if (message.length > 10) {
            message = message.substring(0, 9) + '...';
        }
        return message;
    }
    return (
        <Link to={'ElementMsg'} state={addProps} style={{ textDecoration: 'none' }}>
            <div className="Element-class">
                <img src={imgparam} alt={name} />

                <h4 className="name-class">{name}</h4>
                <h5 className="mesg">{changeMsg(msg)}</h5>
                <h6 className="date">{relativeTime}</h6>
            </div>
        </Link>
    );
}

const Messages: FC = () => {
    const location = useLocation();
    const { socket, updateSocket } = useSocket();
    let { user, updateUser, token } = useUser();
    const { conversation } = useOtherState();
    const [isTyping, setisTyping] = useState<any[]>([]);
    const [lastMessage, setLastMessage] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
    const searchBarRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    if (!user.current) {
       user.current =  updateUser(user.current);
    }
    if(!socket.current)
        socket.current = updateSocket(socket.current);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the clicked element is not a child of the search bar
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                // Clicked outside the search bar, hide the search results
                setUserSuggestions([]);
            }
        };

        // Add event listener to handle clicks outside the search bar
        document.addEventListener('click', handleClickOutside);

        // Cleanup the event listener when component unmounts
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        socket.current.on('search-users', (matchingUsers: any[]) => {
            setUserSuggestions(matchingUsers);
        });
        socket.current.on('typing', (newTyping: any[]) => { setisTyping(newTyping) });
        socket.current.on('stop-typing', (newTyping: any[]) => { setisTyping([]) });

        return () => {
            socket.current.off('typing');
            socket.current.off('stop-typing');
            socket.current.off('search-users');
            socket.current.off('users-found');
            socket.current.off('newMessage');
        };
    }, [user.current, socket.current]);

    const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        socket.current.emit('search-users', { term: term, userId: user.current.id });
    };

    const CreateConversation = async (userS: any) => {
        const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/createConversation', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'authorization': token.current,
            },
            body: JSON.stringify({
                userId: user.current.id,
                friendId: userS.id,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to patch resource');
        }
        const data = await response.json();
        navigate('./ElementMsg', { state: { conv: data.id ? data : { id: -2, chat: [], friend: userS }, type: 'private' } });
    };

    return (
        <>
            <div className='Message-chat'>
                <div className="div-class1">
                    <div className="title-chat" ref={searchBarRef}>
                        <input type="text" placeholder="search..." value={searchTerm} onChange={(event) => handleInputChange(event)} />
                        <ul className='searchedUsers'>
                            {userSuggestions.map((userS) => (
                                <li key={userS.id} onClick={async () => { await CreateConversation(userS); }}>
                                    {console.log(userS.username)}
                                    <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${userS.id}`} />
                                    {userS.username}
                                    <br />
                                    <p>{userS.displayName}</p>
                                    <br />
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="Messages">
                        <div className="Appearmsg">
                            <ul className='AddNewElement'>
                                {conversation ? (conversation.map((conv: any) => (
                                    <li key={conv.id}>
                                        {conv.chat && conv.chat[0] ? (
                                            <MessageElement
                                                user={user}
                                                imgparam={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${conv.friend.id}`}
                                                name={conv.friend.username}
                                                msg={(isTyping && (isTyping.roomId === conv.id || isTyping.senderId === conv.friend.id) ? (": Typing ...") : (conv.chat && conv.chat[0] ? (": " + conv.chat[conv.chat.length - 1].message) : <></>))}
                                                conv={conv}
                                                timestamp={conv.chat && conv.chat[0] ? conv.chat[conv.chat.length - 1].timestamp : <></>}
                                            />
                                        ) : <></>}
                                        <br />
                                    </li>
                                ))) : <><h1>{conversation}</h1></>}</ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className='Element-chat'>
                <Routes>
                    <Route path="ElementMsg" element={<ElementMsg />} >
                        <Route path='Info' element={<Info />} />
                    </Route>
            <Route path="*" element={<DefaultComponent img={img} />} />

                </Routes>
            </div>
        </>
    );
}

export default Messages;