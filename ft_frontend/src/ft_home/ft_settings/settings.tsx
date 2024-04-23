import React, { useEffect, useRef, useState } from 'react';
import './settings.css'
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { useSocket, useUser } from '../../SocketContext.tsx';

interface BlockedUser {
  id: number;
  username: string;
}

function Settings() {
  const { updateUser, user, token,updateToken } = useUser();
  const { socket, updateSocket } = useSocket();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [toggleState, setToggleState] = useState<boolean>(false);
  const [blockedList, setBlocked] = useState<BlockedUser[]>([]);
  const [tokeninho, setTokeninho] = useState<string>('');
  const [secretKey, setSecretKey] = useState<string>('');

  const [qrStatus, setQrStatus] = useState(false);
  if (!socket.current)
    socket.current = updateSocket();
  if (!user.current) {
    user.current = updateUser(user.current);
  }
  if(!token.current)
    token.current = updateToken(token.current);
  const [name, setName] = useState<string>(user.current.username);

  const DebloqueUser = async (userid: number, friendid: number) => {
    await socket.current.emit('Debloque', { userId: userid, friendId: friendid });
  }
  
  useEffect(() => {
    const BlockedUser = async () => {
      if (user.current && user.current.id !== -1) {
        const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/getblocked/' + user.current.id, {
          headers: {
            'authorization': token.current,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to patch resource');
        }
        const blocked = await response.json();
        setBlocked(blocked);
      };
    };

    BlockedUser();
    socket.current.on('Debloque', () => { BlockedUser() });
    socket.current.on('change-userA2f', (message) => {
      if (message.secret.length > 0)
        setTokeninho(message.secret);
    });
    socket.current.on('notValid', () => {
      alert('notValid');
    });
    socket.current.on('validKey', (message) => {
      console.log('im heeeeeeeeeeeeereeeeee');
      user.current= message.user;
      user.current.A2f = true;
      updateUser(message.user);
      setToggleState(message.user.A2f);
      setQrStatus(false);
    });
    socket.current.on('secret-generated', (message) => {
      user.current.secretKey = message.secret;
      setQrStatus(true);
    });


    socket.current.on('change-globalP',(message: any) => {
      if(message && message.user)
      {
        console.log('im heere and ==>',message.user);
        user.current = message.user;
        updateUser(user.current);
      }
    }) ;
  }, [user.current.id,socket.current]);

  const handleChange = async () => {
    if (user.current.A2f === false) {
      // generate code  
      updateUser(user.current);
      socket.current.emit('change-A2f', { userId: user.current.id, userA2f: true});
    } else {
      socket.current.emit('change-A2f', { userId: user.current.id, userA2f: false });
      user.current.A2f = false;
      user.current.secretKey = null;
     user.current =  updateUser(user.current);
      setSecretKey(secretKey);
      setToggleState(false);
    }

  };

  const handleSaveSecret = (secretKey: string) => {
    console.log('kiki haar');
    socket.current.emit('check-secret', { userId: user.current.id, secret: secretKey });
  };

  const ChangeElement = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files[0]) {
      console.error('No files selected');
      return;
    }

    const chosenFile = event.target.files[0];

    const formData = new FormData();
    formData.append('avatar', chosenFile);

    try {
      const response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/${user.current.id}`, {
        method: 'POST',
        body: formData,
        headers: {
          'authorization': token.current,
        },
      });

      if (!response.ok) {
        alert("Invalid Picture");
        return;
      }

      const data = await response;
      
      socket.current.emit('change-global',{userId: user.current.id});
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const UpdateUser = async () => {
    user.current.username = name;
    updateUser(user.current);
    socket.current.emit('change-userName', { userId: user.current.id, userName: name });
  };

  const UpdateAvatar = async (chosedfile: File) => {
    user.current.avatar = chosedfile;
    updateUser(user.current);
    socket.current.emit('change-Avatar', { userId: user.current.id, userAvatar: chosedfile });
  };

  const handleEditClick = async () => {
    setIsEditing(true);
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSaveClick = async () => {
    setIsEditing(false);
    UpdateUser();
  };

  return (
    <>

      <div className="Container3">
        {console.log("user ===>",user.current)}
        <h1>Profile Settings</h1>
        <div className='settings'>
          <div className='col1'>
            <div className="user-image1">
              <input type="file" id="file" onChange={ChangeElement} />
              <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${user.current.id}`} id="photo" />
              <label htmlFor="file" id="uploadbtn">
                <FontAwesomeIcon icon={faCamera} className="fa-camera" />
              </label>
            </div>
            <div className="UserName">
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={handleInputChange}
                  />
                  <button onClick={handleSaveClick} className='save'>Save</button>
                </div>
              ) : (
                <h2>
                  {name}
                  <FontAwesomeIcon
                    icon={faPen}
                    className="fa-solid fa-pen"
                    onClick={handleEditClick}
                  />
                </h2>
              )}
            </div>
            <div className="Enable2F">
              <div>
                <div><p>2FA Authenticator</p></div>
              </div>
              <div>
                <label className="switch">
                  
                  <input type="checkbox" onClick={() => { handleChange(); }} />
                  {!user.current.A2f ? (
                    <>
                      <div className="slider slider--2">OFF</div>
                      <div className="slider slider--3">
                        <div></div>
                        <div></div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="slider slider--0"></div>
                      <div className="slider slider--1">ON</div>
                    </>
                  )}
                </label>
               {qrStatus && 
                <div className='c-form'>
                  <img className='auth2fa' src={`http://10.13.1.10:3004/SchoolOfAthensApi/auth/qr-code/${user.current.secretKey}`} />
                  <input className='c-form__input' value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
                  <button className="c-form__button" type="button" onClick={() => { handleSaveSecret(secretKey) }}>Go!</button>
                </div>}
              </div>
            </div>
          </div>
        </div>
        <hr className="vertical-line2" />
        <div className='col2'>
          <p>Blocked Membres</p>
          {blockedList ? blockedList.map((Blockeduser) => (
            <div className='users'>
              <li className="Userfriend-">
                <div className="com1-"><a className="th1-"><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${Blockeduser.id}`} /></a></div>
                <div className='FrContent-'>
                  <p>{Blockeduser.username}</p>
                  <button onClick={async () => { DebloqueUser(user.current.id, Blockeduser.id) }} >Deblock</button>
                </div>
              </li>
            </div>
          )): <></>}
        </div>
      </div>
    </>
  );
}

export default Settings;