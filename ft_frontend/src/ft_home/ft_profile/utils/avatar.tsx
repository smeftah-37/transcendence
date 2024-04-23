import React, { useEffect } from 'react';
import './avatar.css';
import { Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useSocket, useSocketGame, useUser } from '../../../SocketContext.tsx';

interface AvatarProps {
  friend: {
    id: string;
  };
}

const Avatar: React.FC<AvatarProps> = (props) => {
  const navigate = useNavigate();
  const { socketGame, updateSocketGame } = useSocketGame();
  const { user, updateUser, token } = useUser();
  const { socket, updateSocket } = useSocket();

  if (!user.current) {
    user.current = updateUser(user.current);
  }

  if (!socket.current) {
    socket.current = updateSocket(socket.current);
  }

  const handleData = () => {
    navigate('/Home/DataAnalysis', { state: props.friend });
  };

  const handleInvite = async () => {
    const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/Invitation', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'authorization': token.current,
      },
      body: JSON.stringify({
        to: props.friend.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to patch resource');
    }

    socket.current.emit('invitation-game', { userId: props.friend.id });
  };

  const handleClick = () => {
    const headers = document.getElementsByClassName('menu-');

    if (headers.length > 0) {
      for (let i = 0; i < headers.length; i++) {
        headers[i].style.display = 'none';
      }
    }

    socketGame.current = updateSocketGame(socketGame.current);

    socketGame.current.emit('wanna-play', { userId: user.current.id });
    navigate('../Waiting');
  };

  const handleTrain = () => {
    navigate('../AllGame', { state: { userId: user.current.id, info: null } });
  };

  return (
    <>
    
      <div className='Avatar'>
        <img className="img-profile" src={props && props.friend ? `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${props.friend.id}` : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${user.current.id}`} />
        <div className="besideAvatar">
          {props && props.friend ? <>
            <button type="button" className="Playnow" onClick={handleInvite}>Play</button>
            <button type="button" className="Playnow" onClick={handleData}>Data</button></> : <>
            <button type="button" className="Playnow" onClick={handleClick}>Play</button>
            <button type="button" className="Playnow" onClick={handleTrain}>Train</button></>}
        </div>
      </div>
    </>
  );
};

export default Avatar;