import decart from '../decart.jpg';
import { Link, json } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './ElementMsg.css';
import sendbutton from './aaa.png';
import { useRef } from 'react';
import threedots from './three_dots.png';
import { useLocation } from 'react-router-dom';
import { useOtherState, useSocket, useUser } from '../../SocketContext.tsx';
import { Routes, Route } from 'react-router-dom';
import Info from './Info/Info'
import { Socket } from 'socket.io-client';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

import { faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import Picker from '@emoji-mart/react';


const InputConversation = (props) => {
  const [message, setMessage] = useState('');
  const { socket ,updateSocket} = useSocket();
  const [remainingTime, setRemainingTime] = useState(0);
  let { user, updateUser } = useUser();
  let { room, conv, type, statusB } = props;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [messages, setMessages] = useState([]);
  const [privateMsg, setPrivateMsg] = useState([]);
  const typingTimer = useRef(null);
  const [mute, setMute] = useState({ status: false, start: 0, end: 0, userId: 0, roomId: 0 });
  // const [room, setRoom] = useState(room);
  const [blocked, setBlocked] = useState(null);

  const conversationRef = useRef(null);
  if (!user.current) {

   user.current =  updateUser(user.current);
  }
  if(!socket.current)
    socket.current = updateSocket(socket.current);
  useEffect(() => {

    if(!socket.current)
    socket.current = updateSocket(socket.current);
    if (type === "room") {
      if (room.mutedUser) {
        const mutedUser = room.mutedUser.find(muted => muted.userId === user.current.id);
        if (mutedUser) {
          const value = { status: true, start: mutedUser.startTime, end: mutedUser.endTime, userId: user.current.id, roomId: room.id }
          setMute(value);
        }

      }
      const updatedMessages = room.conversation.chat.map(msg => {
        if ((user && user.current.blocked && user.current.blocked.includes(msg.sender.id)) || (user && user.current.blockedBy && user.current.blockedBy.includes(msg.sender.id))) {
          // Message sender is blocked
          return null; // You can filter out or hndle blocked messages as per your requirement
        } else {
          // Message sender is not blocked
          return {
            message: msg,
            roomId: room.id
          };
        }
      }).filter(msg => msg !== null);
      setMessages(updatedMessages);
      setTimeout(() => {
            if (conversationRef.current) {
              conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
            }
          }, 100);
    }
    else if (type === 'private') {
      if ((user && user.current.blocked && user.current.blocked.includes(conv.friend.id)) || (user && user.current.blockedBy && user.current.blockedBy.includes(conv.friend.id))) {
        setBlocked({ status: true, friendId: conv.friend.id });


      }
      const updatedMessages = conv.chat.map(msg => ({

        message: msg,
        friendId: conv.friend.id,
      }));
      setPrivateMsg(updatedMessages);
      setTimeout(() => {
        if (conversationRef.current) {
          conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [room ? room : conv,socket.current])
  useEffect(() => {

    if (socket.current !== -1) {
      // const updatedMessages = room.conversation.chat.map(msg => ({
      //   message: msg,
      //   roomId: room.id
      // }));
      // setMessages(updatedMessages);
      // socket.current.on('connect', () => {
      //   setIsconnected(true);
      // });


      // socket.current.on('private-message', (newMessage) => {
      //   // setPrivateMsg((prevprivateMsg) => [...prevprivateMsg, newMessage]);

        
      // socket.current.on('room-message', (newMessage) => {
      //   // if ((!user.blocked || !user.blocked.includes(newMessage.message.sender.id)) && (!user.blockedBy || !user.blockedBy.includes(newMessage.message.sender.id))) {
      //   //   console.log('im in the room message of the socket.current');
      //   //   setMessages((prevMessages) => [...prevMessages, newMessage]);

      //  
      //   // }
      // });
      socket.current.on('mute-user', (message) => {
        if (message.userId === user.current.id) {
          const value = { status: true, start: message.timeS, end: message.timeE, userId: message.userId, roomId: message.roomId }
          setMute(value);
        }
      })
      return () => {
        // socket.current.off('connect');


      };
    }
  }, [socket.current]);
  console.log('sockeeeet ---->',socket.current);
  useEffect(() => {
    if(!socket)
      socket.current = updateSocket(socket.current)
    let timerId;

    if (room && (mute.status && mute.roomId === room.id)) {
      const currentTime = new Date().getTime(); // Get current time in milliseconds
      const muteEndTime = new Date(mute.end).getTime(); // Get mute end time in milliseconds
      const timeDifference = muteEndTime - currentTime;
      const remainingSeconds = Math.max(0, Math.floor(timeDifference / 1000)); // Calculate remaining seconds and ensure it's not negative
      setRemainingTime(remainingSeconds); // Set remaining time initially

      if (timeDifference > 0) {
        timerId = setInterval(() => {
          setRemainingTime(prevTime => {
            const newTime = Math.max(0, prevTime - 1); // Decrement remaining time every second
            if (newTime === 0) {
              // If remaining time reaches 0, set mute status to false
              socket.current.emit('delete-mute', { roomId: room.id, userId: user.current.id });
              setMute(prevMute => ({ ...prevMute, status: false }));
            }
            return newTime;
          });
        }, 1000);
      }
    }

    return () => clearInterval(timerId);
  }, [mute])



  useEffect(() => {
    // Scroll to the bottom of the conversation container after component mounts
    setTimeout(() => {
      if (conversationRef.current) {
        conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
      }
    }, 10);
  }, [conv ? conv: room]);
  const sendMessage = () => {
    if (user.current && message) {
      (type === 'room' ?
        (socket.current.emit('room-message', {
          room: room,
          messageU: {
            sender: user.current,
            timeSent: new Date(Date.now()).toLocaleString('en-US'),
            message: message,
          },
        })) : (socket.current.emit('private-message', {
          convId: conv.id,
          senderId: user.current.id,
          receiverId: conv.friend.id,
          sender: user.current.socketId,
          receiver: conv.friend.socketId,

          message: {
            sender: user.current,
            receiver: conv.friend,
            timeSent: new Date(Date.now()).toLocaleString('en-US'),
            message: message,
          },
        })))
    }
    setMessage('');
  };


  const handleWheel = (event) => {
    if (conversationRef.current) {
      const { deltaY } = event;
      conversationRef.current.scrollTop += deltaY;
    }
  };
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };
  // const handleTyping = (typing) => {
  //   setIsTyping(typing);
  //   if (typing) {
  //     // Start typing
  //     socket.emit('typing', { senderId: user.current.id, username: user.current.username, roomId: (room ? room.id : conv.id), typename: type, sender: (conv ? conv.friend.socketId : -1), receiver: user.current.socketId, receiverId: (conv ? conv.friend.id : -1) });
  //   } else {
  //     // Stop typing
  //     socket.emit('stopTyping', { senderId: user.current.id, roomId: (room ? room.id : conv.id) });
  //   }
  // }

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.trim() !== '') {
      socket.current.emit('typing', { senderId: user.current.id, username: user.current.username, roomId: (room ? room.id : conv.id), typename: type, sender: (conv ? conv.friend.socketId : -1), receiver: user.current.socketId, receiverId: (conv ? conv.friend.id : -1) });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socket.current.emit('stop-typing', { senderId: user.current.id, username: user.current.username, roomId: (room ? room.id : conv.id), typename: type, sender: (conv ? conv.friend.socketId : -1), receiver: user.current.socketId, receiverId: (conv ? conv.friend.id : -1) });
      }, 1000); // Set a 1-second delay before emitting "stop typing" event
    } else {
      clearTimeout(typingTimer.current);
      socket.current.emit('stop-typing', { senderId: user.current.id, username: user.current.username, roomId: (room ? room.id : conv.id), typename: type, sender: (conv ? conv.friend.socketId : -1), receiver: user.current.socketId, receiverId: (conv ? conv.friend.id : -1) });
    }
  }
  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.native);
    setShowEmojiPicker(false); // Close the emoji picker after selecting an emoji
  };

  return (
    <>
      <div className='Input-conversation'>
        <div className='Conversation' ref={conversationRef} onWheel={handleWheel}>
          <ul>
            {room ? (
              messages.map((msg, index) => (
                (msg.roomId === room.id ? (

                  <li className="container">
                    <img className={msg.message.sender.id === user.current.id ? 'Myimage' : 'image'} src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${msg.message.sender.id}`} />
                    <h6 className={msg.message.sender.id === user.current.id ? 'Mymessage' : 'message'}>{msg.message.sender.username}: {msg.message.message}</h6>
                  </li>
                ) : <></>)
              ))) : (privateMsg.map((msg, index) => (
                ((user.current.id === msg.message.sender.id || user.current.id === msg.message.receiver.id) && (conv.friend.id === msg.message.sender.id || conv.friend.id === msg.message.receiver.id) ? (
                  <li className='container'>

                    <img className={msg.message.sender.id === user.current.id ? 'Myimage' : 'image'} src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${msg.message.sender.id}`} />

                    <h6 className={msg.message.sender.id === user.current.id ? 'Mymessage' : 'message'}>{((user && user.current.blocked && user.current.blocked.includes(msg.message.sender.id)) || (user && user.current.blockedBy && user.current.blockedBy.includes(msg.message.sender.id))) ? <p style={{ filter: 'blur(0.1em)' }}>'Ths message is unvailable'</p> : msg.message.message}</h6>
                  </li>

                ) : <></>))))}
          </ul>
        </div>
        <div className='send-bar'>
          {room && ((mute.status && mute.roomId === room.id) || room.mutedUser.some(muted => muted.userId === user.current.id)) ? <><h2 style={{ color: 'white' }}>
            You've embarked on a temporary silence, akin to Socrates contemplating in solitude.
            Embrace this moment of reflection until the sands of time release your voice once more.
            {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}
          </h2>
          </> : <>{conv  && user.current && ((user.current.blocked && user.current.blocked.includes(conv.friend.id)) || (user && user.current.blockedBy && user.current.blockedBy.includes(conv.friend.id))) ? <h2 style={{ color: 'white' }}>Silence is the wisdom. You both cannot speak.</h2> : <>
            <input
              type='text'
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleChange(e);
              }}
              placeholder='Compose your own Symposium... 📜'
              className='text-input'
              onKeyDown={handleKeyPress}

              required
            />
            <button className='send-button' onClick={sendMessage}>
              Send
            </button>

            
            {showEmojiPicker && <Picker
              onChange={(newValue) => {
                setMessage((prevMessage) => prevMessage + newValue);
                setShowEmojiPicker(false);
              }}
            />}
          </>}</>}

        </div>
      </div>
    </>
  );
};

const ElementMsg = (props) => {
  const { name, img } = props;
  const location = useLocation();
  const prop = location.state || {};
  const [showBar, setShowBar] = useState(false); // Define state here
  const { socket ,updateSocket} = useSocket();
  const { updateRoomById, updateConvById } = useOtherState();
  let { user, updateUser, token } = useUser();
  const [change, setChange] = useState(false);
  // const [room, setRoom] = useState(prop.room);
  // const [conv, setConv] = useState(prop.conv);

  if(!socket)
    socket.current = updateSocket(socket.current)
  useEffect(() => {
    if(!socket)
      socket.current = updateSocket(socket.current)
    const fetchData = async () => {
      try {
        if (prop.type === 'room' && prop.room) {

          const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/rooms/' + prop.room.id, {

            headers: {
              'authorization': token.current,// Specify the content type of the request body

            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch rooms');
          }
          const data = await response.json();
          // setRoom(data);
          prop.room = data;
          setChange(true);
          updateRoomById(prop.room.id, data);
          //room.conversation = data.conversation;


        }
        else if (prop.type === 'private' && prop.conv) {

          const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/conversation/' + prop.conv.id, {

            headers: {
              'authorization': token.current,// Specify the content type of the request body

            }
          });


          if (!response.ok) {
            throw new Error('Failed to fetch rooms');
          }
          const data = await response.json();
          prop.conv = data;
          setChange(true);
          updateConvById(prop.conv.id, data);




        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


    socket.current.on('block-friend', (message) => {
      user.current.blocked = message.blocked;
      user.current.blockedBy = message.blockedBy;
      updateUser(user.current);
      fetchData();

    });
    fetchData();
    socket.current.on('change-room', () => {
      fetchData();
    });

    socket.current.on('room-message', async (newMessage) => {

      fetchData();
    });
    socket.current.on('private-message', (newMessage) => {
      fetchData();
    });
    socket.current.on('Debloque', (newMessage) => {
      user.current = newMessage;
      updateUser(newMessage);
      fetchData();

    });
    socket.current.on('remove-friend', (message) => {
      user.current.friends = message.friends;
      
      updateUser(user.current);
      setChange(true);

    })
    socket.current.on('status', (message) => {
      fetchData();
      setChange(true);

    })
    return () => {
      socket.current.off('change-room');
      socket.current.off('private-message');
      socket.current.off('block-friend');
      socket.current.off('remove-friend');


    };
  }, [socket.current, prop,user.current]);
  return (
    <>{change ? <></>: <></>}
      {prop.room || prop.conv ? <>
        <div>
          <HeaderChat room={prop.room} conv={prop.conv} name={(prop.room ? prop.room.roomName : prop.conv.friend.username)} img={prop.conv ? prop.img : <></>} showBar={showBar} setShowBar={setShowBar} user={prop.user} />


          <InputConversation room={prop.room} conv={prop.conv} user={prop.user} socket={prop.socket} type={prop.type} /></div>
        <div className=' MsgInfo'>
          {showBar && <Info room={prop.room} conv={prop.conv} user={user} />}
        </div></> : <></>}
    </>
  );
};

const HeaderChat = (props) => {
  const { room, name, img, showBar, setShowBar, user,conv } = props;

  const handleClick = () => {
    const divClassMsg = document.querySelector('.Element-chat');
    if (divClassMsg) {
      if (divClassMsg.style.gridTemplateColumns === '1fr 1fr') {
        divClassMsg.style.gridTemplateColumns = '2fr';
        setShowBar(false);
      } else {
        divClassMsg.style.gridTemplateColumns = '1fr 1fr';
        setShowBar(true);
      }
    }
  };

  return (
    <div>
      <div className='Header-chat'>
        {console.log(room)}
        <img src={room ? (room.avatar && room.avatar.length > 0 ? `http://10.13.1.10:3004/SchoolOfAthensApi/rooms/avatar/${room.id}` : decart) : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${conv.friend.id}`} alt='User Avatar' />
        <h3>{name}</h3>
        <p className='status'>
          <small></small>
        </p>
        <span className="plus_info_dots" onClick={handleClick}><FontAwesomeIcon icon={faEllipsisVertical} /></span>
      </div>
    </div>
  );
};


export default ElementMsg;
