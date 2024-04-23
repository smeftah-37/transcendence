import React, { useState, useEffect } from 'react';
import './chatBar.css';
import { useSocket, useUser } from '../../SocketContext.tsx'

interface Friend {
  id: string;
  username: string;
  Status: boolean;
}

const ChatBar: React.FC = () => {
  const { user, updateUser, token, updateToken } = useUser();
  const { socket, updateSocket } = useSocket();
  const [friends, setFriends] = useState<Friend[]>([]);

  if (!socket.current) {
    socket.current = updateSocket();
  }
  if (!user.current) {
    user.current = updateUser(user.current);
  }
  if(!token.current)
    token.current = updateToken(token.current);
  useEffect(() => {
    const fetchData = async () => {

      if(!token.current)
        token.current = updateToken(token.current);
      console.log(token.current)
      if(user.current){
      const response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/${user.current.id}/friends/`, {

        headers: {
          'authorization': token.current,// Specify the content type of the request body
          // Add any other headers you need, such as authorization headers
        }
      })

      if (!response.ok) {
        throw new Error('Failed to patch resource');
      }
      const data = await response.json();
      setFriends(data);
    }}
    fetchData();
    socket.current.on('new-friend', () => {
      fetchData();
    })
    socket.current.on('status', (message) => {
      if (user.current.friends && user.current.friends.includes(message.userId));
      fetchData();
    })
  }, [user.current, socket.current])
  return (
    <>
      <div className="friendinput">
        <div className="input-group">
          <input type="text" id="myInput" className="input-group__input" placeholder='Search' />
        </div></div>
      <div className="listfriend">
        {friends ? (friends.map((friend) => (
          <div className="Userfriend">
            <div className="com1"><div className="th1"  ><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${friend.id}`} /></div></div>

            <div className='FrContent'>
              <p>{friend.username}</p>
              {friend.Status ?
                <img src="https://cdn1.iconfinder.com/data/icons/tech-1-2-flat/234/internet-online-offline-web-512.png" />
                : <img src="https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/offline-internet-icon.png" />}
              {/* https://cdn-icons-png.flaticon.com/512/10264/10264703.png */}
              <img src="https://cdn-icons-png.freepik.com/512/10265/10265398.png" />
              <img src="https://cdn4.iconfinder.com/data/icons/sports-57/32/ping_pong-512.png" />
              <img src="https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/254000/45-512.png" />
            </div>
          </div>))) : <></>}


      </div>
    </>
  );
};

export default ChatBar;