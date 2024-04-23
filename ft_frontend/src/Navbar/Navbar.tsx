import React from 'react';
import messge from './chat.png';
import hyp from './Hypatia.png';
import rooms from './rooms.png';
import settings from './settings.png'
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, } from 'react-router-dom';
import notif from './notif.png';
import { useOtherState, useSocket, useUser } from '../SocketContext.tsx';
import '../Navbar/Navbar_.css';
import { Link, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import Messages from '../Messages/Messages.tsx';
import { useAuth } from '../SocketContext.tsx';
import UserInformation from '../UserInformation/UserInformation.tsx';
import Rooms from '../Rooms/Rooms.tsx';
import ElementMsg from '../Messages/ElementMsg/ElementMsg';
import CreateChannel from '../Rooms/CreateChannel/CreateChannel.tsx';
import Info from '../Messages/ElementMsg/Info/Info';
import img from './im.gif'
import { SocketProvider } from '../SocketContext.tsx';

interface NavbarProps {}

const GenerateRandomString = (): string => {
  const charac: string = "ABCDEFJHIJKLMNOPQRSIUVQSWZabcdefghijklmnopqrsiov1234567890";
  let result: string = '';
  for (let i: number = 0; i < 8; i++) {
    const ranind: number = Math.floor(Math.random() * charac.length);
    result += charac.charAt(ranind);
  }
  return result;
}

interface DefaultComponentProps {
  img: string;
}

const DefaultComponent: React.FC<DefaultComponentProps> = ({ img }) => {
  return (
    <div className='in'>
      <h2>Embrace the wisdom of the ancients! Share your thoughts and moments with friends or a circle of enlightened minds through photos and private messages.</h2>
      <img src={img} alt="Image" />
    </div>
  );
}


const Navbar: FC<NavbarProps> = (props) => {
  let { socket, updateSocket } = useSocket();
  let navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  let { updateRooms, updateRoomsNotBelong, conversation, updateConversation } = useOtherState();
  let { user, updateUser, token, updateToken } = useUser();

  if (!token.current) {
    token.current = updateToken(null);
  }

  if (!user.current) {
    updateUser(user.current);
  }

  if (!socket.current) {
    socket.current = updateSocket();
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.current.id) {
          const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/conversation/', {
            headers: {
              'authorization': token.current,
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch rooms');
          }
          const data = await response.json();
          updateConversation(data);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }

      socket.current.on('creation-of-conv', (message) => {
        fetchData();
      });

      socket.current.on('remove-conv', (message) => {
        navigate('./Messages');

        fetchData();
      });
    };

    const links = document.querySelectorAll('.items-a');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        activeLink(link);
      });
    });

    fetchData();

    return () => {};
  }, [user.current, socket]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.current.id) {
          const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/rooms/', {
            headers: {
              'authorization': token.current,
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch rooms');
          }
          const data = await response.json();
          updateRooms(data);

          const response1 = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/rooms/otherRooms/' + user.current.id, {
            headers: {
              'authorization': token.current,
            }
          });

          const data1 = await response1.json();
          updateRoomsNotBelong(data1);
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchData();

    socket.current.on('join-event', (message) => {
      if (message.userId === user.current.id) {
        fetchData();
      }
    });

    socket.current.on('delete-room', (message) => {
      if (message.userId === user.current.id) {
        fetchData();
        navigate('./Rooms');
      }
    });

    socket.current.on('create-room', (message) => {
      fetchData();
      navigate('./Rooms');

    });

    socket.current.on('change1-room', (message) => {
      fetchData();
    });

    return () => {
      socket.current.off('join-event');
      socket.current.off('delete-room');
      socket.current.off('create-room');
    };
  }, [user.current.id, socket]);

  const activeLink = (linkActive: HTMLElement) => {
    const links = document.querySelectorAll('.items-a');
    links.forEach(link => {
      link.classList.remove('active');
      linkActive.classList.add('active');
    });
  };

  return (
    <>
      <div className="Chat">
        <div className="sidebar">
          <div className='ProfileIcon items-a'>
            <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${user.current.id}`} />
          </div>
          <div className='fourItems'>
            <Link to={"Messages"} className='MessageIcon items-a' >
              <img src={messge} />
            </Link>
            <Link to={"Rooms"} className='RoomIcon items-a'>
              <img src={rooms} />
            </Link>
            <Link to={"UserInformation"} className='NotifIcon items-a'>
              <img src={notif} />
            </Link>
          </div>
        </div>
        <div className='Allchat'>
          <Routes>
            <Route path="Messages/*" element={<Messages />} >
              <Route path="ElementMsg" element={<ElementMsg />} />
            </Route>
            <Route path="UserInformation" element={<UserInformation />} />
            <Route path="Rooms/*" element={<Rooms />} >
              <Route path="ElementMsg/*" element={<ElementMsg />} >
                <Route path="Info" element={<Info />} />
              </Route>
              <Route path="CreateChannel" element={<CreateChannel />} />
            </Route>
            <Route path="*" element={<DefaultComponent img={img} />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default Navbar;