import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Info.css';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { faPersonRunning } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faBan } from '@fortawesome/free-solid-svg-icons';
import { faTableTennisPaddleBall } from '@fortawesome/free-solid-svg-icons';
import { useSocket, useUser } from '../../../SocketContext.tsx';

import { faUserTie } from '@fortawesome/free-solid-svg-icons';
import { faUserSlash } from '@fortawesome/free-solid-svg-icons';
import { faVolumeXmark } from '@fortawesome/free-solid-svg-icons';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';



const ThreeDotBar = (props) => {
  const [showInfo, setShowInfo] = useState(false);
  const { socket,updateSocket } = useSocket();
  const { token, user } = useUser();
  const [mute, setMute] = useState(false);

    if(!socket)
      socket.current = updateSocket(socket.current);
  const handleMakeItAdmin = async () => {

    const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/rooms/MakeAdmin/' + props.room.id, {


      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'authorization': token.current,// Specify the content type of the request body
        // Specify the content type of the request body
        // Add any other headers you need, such as authorization headers
      },
      body: JSON.stringify({
        // Include the data you want to update in the request body
        userId: props.user.id,
        // Add other fields as needed
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to patch resource');
    }
    await socket.current.emit('change-room', { roomId: props.room.id });

  };
  const handleKickOut = async (status) => {
    console.log('im heere in the kick out and the status is ', status);

    socket.current.emit('kick-user-out', { roomId: props.room.id, userId: props.user.id, ban: status });

  };
  const handleMuteIt = (number) => {
    console.log("im heere in the mute");
    const startTime = new Date();
    socket.current.emit('mute-user', { roomId: props.room.id, userId: props.user.id, timeS: startTime, timeE: new Date(startTime.getTime() + number * 60000) });

  };

  return (<>{showInfo ? <></> : (
    <div className='plus_info' >
      <ul className='threedot-element' style={{ listStyleType: 'none', display: 'flex' }}>
        {mute ? <><li><h4 onClick={() => { handleMuteIt(1) }} style={{ width: 'calc(2.5vw + 2.5vh)', margin: '0 0 0 30px' }}>1min</h4></li><li><h4 onClick={() => { handleMuteIt(10) }} style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 35px' }}>10min</h4></li><li><h4 onClick={() => { handleMuteIt(30) }} style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 35px' }}>30min</h4></li><li><h4 onClick={() => { handleMuteIt(1440) }} style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 30px' }}>24hour</h4></li></> : <>
          <li ><FontAwesomeIcon style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 0' }} onClick={() => { handleMakeItAdmin() }} icon={faUserTie} /></li><li ><FontAwesomeIcon style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 3px' }} onClick={() => { handleKickOut(false) }} icon={faUserSlash} /></li><li ><FontAwesomeIcon style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 3px' }} onClick={() => { handleKickOut(true) }} icon={faBan} /></li><li ><FontAwesomeIcon style={{ width: 'calc(3vw + 3vh)', margin: '0 0 0 3px' }} onClick={() => { setMute(true) }} icon={faVolumeXmark} /></li>
        </>}
      </ul>

    </div>)}</>
  );
}


const Info = (props) => {
  const [file, setFile] = useState(null);
  const [searchToAdd, setSearch] = useState(false);

  const [newRoomName, setNewRoomName] = useState(props.room ? props.room.roomName : '');
  const { user } = useUser();
  const { token,updateToken } = useUser();

  const [showBar, setShowbar] = useState({});
  const { socket,updateSocket } = useSocket();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [userSuggestions, setUserSuggestions] = useState([]);
  const searchBarRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordChange, setPasswordChange] = useState(false);

  if(!token.current)
    token.current = updateToken(token.current);
  if(!socket.current)
    socket.current = updateSocket(socket.current);
    useEffect(() => {

    const handleClickOutside = (event) => {
      // Check if the clicked element is not a child of the search bar
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        // Clicked outside the search bar, hide the search results
        setUserSuggestions([]);
      }
    };

    // Add event listener to handle clicks outside the search bar
    document.addEventListener('click', handleClickOutside);
    socket.current.on('search-users', (matchingUsers) => {
      setUserSuggestions(matchingUsers);
    });
    socket.current.on('invalid-password',() =>
    {
      alert('invalid password');
 
    })

  },[socket.current])
  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = async (e) => {

    setNewRoomName(e.target.value);

  };
  const handleChangePassword = (event) => {
    event.preventDefault();

    if (newPassword !== '') {
      setPasswordChange(false);
      socket.current.emit('change-password', { roomId: props.room.id, password: newPassword })

    }
  };
  const handleSavePassword = () => {
    // Implement logic to handle saving password
  };

  const handleRemovePassword = () => {
    socket.current.emit('remove-password', { roomId: props.room.id })

    // Implement logic to handle removing password
  };

  const addPassword = () => {
    // Implement logic to handle adding password
  };



  const handleSaveClick = async () => {
    // Save the new room name (e.g., send a request to update the room name)
    // After saving, update the UI or perform any necessary actions
    // For now, we'll just log the new room name to the console

    // Reset editing mode
    setIsEditing(false);


    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json', // Specify the content type of the request body
    //     // Add any other headers you need, such as authorization headers
    //   },
    //   body: JSON.stringify({
    //     // Include the data you want to update in the request body
    //     name: newRoomName,
    //     // Add other fields as needed
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error('Failed to patch resource');
    // }
    socket.current.emit('change-room', { roomId: props.room.id, newName: newRoomName });
  };
  const handleRemoveConversation = async () => {
    if (props.conv) {

      const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + "/DeleteConversation", {


        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json', // Specify the content type of the request body
          'authorization': token.current,// Specify the content type of the request body
          // Add any other headers you need, such as authorization headers
        },
        body: JSON.stringify({
          // Include the data you want to update in the request body
          convId: props.conv.id,
          // Add other fields as needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to patch resource');
      }
    }
    socket.current.emit('remove-conv', { convId: props.conv.id, userId: user.current.id });

  };

  const handleExitTheRoom = async () => {


    //   method: 'PATCH',
    //   headers: {
    //     'Content-Type': 'application/json', // Specify the content type of the request body
    //     // Add any other headers you need, such as authorization headers
    //   },
    //   body: JSON.stringify({
    //     // Include the data you want to update in the request body
    //     userId: user.current.id,
    //     ban: false,
    //     // Add other fields as needed
    //   }),
    // });

    // if (!response.ok) {
    //   throw new Error('Failed to patch resource');
    // }
    socket.current.emit('kick-user-out', { roomId: props.room.id, userId: user.current.id, ban: false });


  };
  const CreateConversation = async (userroom) => {
    const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/createConversation', {


      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json', // Specify the content type of the request body
        'authorization': token.current,// Specify the content type of the request body
        // Add any other headers you need, such as authorization headers
      },
      body: JSON.stringify({
        // Include the data you want to update in the request body
        userId: user.current.id,
        friendId: userroom.id,
        // Add other fields as needed
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to patch resource');
    }
    const data = await response.json();
    navigate('../../Messages/ElementMsg', { state: { conv: data.id ? data : { id: -2, chat: [], friend: userroom }, type: 'private' } });

  };
    const handleGoToProfile = (user) => {
      navigate('/Home/Profile', { state: user });
    }
  
  const ChangeElement = async (event) => {
    // Check if files exist in event target
    if (!event.target.files || !event.target.files[0]) {
      console.error('No files selected');
      return;
    }

    // Get the first selected file
    const chosenFile = event.target.files[0];

    // Create a FormData object and append the file to it
    const formData = new FormData();
    formData.append('avatar', chosenFile);

    try {
      // Send the FormData object to the server
      const response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/rooms/${props.room.id}/avatar`, {

        method: 'POST',
        body: formData,
        headers: {
          'authorization': token.current,
        },
      });

      if (!response.ok) {
        console.log(response);
        alert("Invalid Picture");
        return;
      }

      const data = await response;

      // If upload is successful, emit a socket event to notify other clients
      await socket.current.emit('change-room', { roomId: props.room.id });

      // Optionally, you can handle response data if needed
      // const data = await response.json();
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };


  const handleInviteToPlay = async () => {


    const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/InvitationToPlay', {


      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json', // Specify the content type of the request body
        'authorization': token.current,// Specify the content type of the request body
        // Add any other headers you need, such as authorization headers
      },
      body: JSON.stringify({
        // Include the data you want to update in the request body
        friendId: props.conv.friend.id,
        // Add other fields as needed
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to patch resource');
    }
    socket.current.emit('invitation-game', { userId: props.conv.friend.id });
    console.log('im emit it ');



  }
  const sendInvitation = async (to) => {

    const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/Invitation', {


      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json', // Specify the content type of the request body
        'authorization': token.current,// Specify the content type of the request body
        // Add any other headers you need, such as authorization headers
      },
      body: JSON.stringify({
        // Include the data you want to update in the request body
        to: to,
        // Add other fields as needed
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to patch resource');
    }
    socket.current.emit('invitation', { userId: to });

  }

  const sendGamesInvitation = async (to) => {

    const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/InvitationToPlay', {

      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json', // Specify the content type of the request body
        'authorization': token.current,// Specify the content type of the request body
        // Add any other headers you need, such as authorization headers
      },
      body: JSON.stringify({
        // Include the data you want to update in the request body
        friendId: to,
        // Add other fields as needed
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to patch resource');
    }
    socket.current.emit('invitation-game', { userId: to });
    console.log('im emit it ');



  }

  const addUserToRoom = (usern) => {
    socket.current.emit('join-room', { roomId: props.room.id, userId: usern.id, status: 0 });
  }
  const handleBlock = async () => {
    await socket.current.emit('block-friend', { userId: user.current.id, friendId: props.conv.friend.id });
  }
  const handleInputChange1 = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    socket.current.emit('search-users', { term: term, userId: user.current.id });
  };

  const addPassoword = (password) => {

    socket.current.emit('add-password', { roomId: props.room.id, newPassword: password })
    setPasswordChange(false); // Show the password input field when adding a password
  }
  const removePassword = () => {
    socket.current.emit('remove-password', { roomId: props.room.id });
  }
  const removeFriend = (id) => {
    socket.current.emit('remove-friend', { userId: user.current.id, friendId: id });
  }
  const toggleShowBar = (userId) => {
    setShowbar(prevState => ({
      ...prevState,
      [userId]: !prevState[userId] // Toggle the visibility for the specified user
    }));
  };
  const handleOwnerThreeDots = () => {

  }
  return (<div className='Info-class'>
    {props.room ? (<><div className='profile'>
      <div id="hello" className="user-image">
        <input type="file" id="file" onChange={ChangeElement} />
        <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/rooms/avatar/${props.room.id}`} id="photo" />
        <label htmlFor="file" id="uploadbtn">
          <FontAwesomeIcon icon={faCamera} className="fa-camera" />
        </label>
      </div>
      {isEditing ? (
        <div>
          <input
            type="text"
            value={newRoomName}
            onChange={handleInputChange}
          />
          <button onClick={handleSaveClick} className='save'>Save</button>
        </div>
      ) : (
        <h2>
          {props.room.roomName}
          <FontAwesomeIcon
            icon={faPen}
            className="fa-solid fa-pen"
            onClick={handleEditClick}
          />
          <p style={{ color: "red", fontSize: '20px', margin: ' 5% 0 0 7%' }}>{props.room.description}</p>
        </h2>
      )}
    </div>
      <div className='Membres'>
        <fieldset >

          <legend>Membres</legend>
          <div className="listfriend-">
            {props.room.owner ? (<>
              <div className='owner'>
                <li className="Userfriend-">

                  <div className="com1-"><div className="th1-" href="https://unsplash.com/photos/UrfpprfDB0k" target="_blank"><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${props.room.owner.id}`} onClick={() => {handleGoToProfile(props.room.owner)}} /></div></div>

                  <div className='FrContent-'>
                    <p>{props.room.owner.username}</p>
                    {/* https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/offline-internet-icon.png */}
                    {/* https://cdn-icons-png.flaticon.com/512/10264/10264703.png */}
                    {props.room.owner.id === user.current.id || ((user.current.blocked && user.current.blocked.includes(props.room.owner.id)) || (user.current.blockedBy && user.current.blockedBy.includes(props.room.owner.id))) ? <></> : (<>
                      {props.room.owner.Status ? <img src="https://cdn1.iconfinder.com/data/icons/tech-1-2-flat/234/internet-online-offline-web-512.png" style={{ width: '1px', height: '1px' }} /> : <img src="https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/offline-internet-icon.png" style={{ width: '1px', height: '1px' }} />}
                      <img src="https://cdn4.iconfinder.com/data/icons/sports-57/32/ping_pong-512.png"  onClick={() => {sendGamesInvitation(props.room.owner.id)}} />
                      {user.current.friends && user.current.friends.includes(props.room.owner.id) ?
                        <img src="https://cdn-icons-png.flaticon.com/512/10264/10264703.png" onClick={() => {removeFriend(props.room.owner.id)}} />
                        : <img src="https://cdn-icons-png.freepik.com/512/10265/10265398.png" onClick={() => {sendInvitation(props.room.owner.id)}} />
                      }
                      <img src="https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/254000/45-512.png" onClick={async () => { await CreateConversation(props.room.owner); }} />
                    </>)}</div>
                </li>
              </div>
            </>) : <></>}

            {props.room.users.map((userroom) => (
              <div className='users' key={userroom.id}>
                <li className="Userfriend-">
                  <div className="com1-">
                    <div className="th1-" href="https://unsplash.com/photos/UrfpprfDB0k" target="_blank">
                      <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${userroom.id}`} onClick={() => {handleGoToProfile(userroom)}} />
                    </div>
                  </div>
                  <p>{userroom.username}</p>
                  <div className='FrContent-'>
                    {user.current.id !== userroom.id && ((!user.current.blocked || !user.current.blocked.includes(userroom.id)) && (!user.current.blockedBy || !user.current.blockedBy.includes(userroom.id))) ? (
                      <>
                        {userroom.Status ? <img src="https://cdn1.iconfinder.com/data/icons/tech-1-2-flat/234/internet-online-offline-web-512.png" style={{ width: '1px', height: '1px' }} /> : <img src="https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/offline-internet-icon.png" style={{ width: '1px', height: '1px' }} />}
                        {user.current.friends && user.current.friends.includes(userroom.id) ?
                          <img src="https://cdn-icons-png.flaticon.com/512/10264/10264703.png" onClick={() => {removeFriend(userroom.id)}} />
                          : <img src="https://cdn-icons-png.freepik.com/512/10265/10265398.png" onClick={() => {sendInvitation(userroom.id)}} />
                        }
                        <img src="https://cdn4.iconfinder.com/data/icons/sports-57/32/ping_pong-512.png" onClick={() =>{sendGamesInvitation(userroom.id)}} />
                        <img src="https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/254000/45-512.png" onClick={async () => { await CreateConversation(userroom); }} />
                      </>
                    ) : null}
                  </div>
                  {showBar[userroom.id] ? <ThreeDotBar room={props.room} user={userroom} /> : null}
                  {(props.room.owner && user.current.id === props.room.owner.id) || (props.room.admin && props.room.admin.some(admin => admin.id === user.current.id)) ? (
                    <div className='owner-dots' onClick={(e) => { e.stopPropagation(); toggleShowBar(userroom.id); }}>
                      <FontAwesomeIcon icon={faChevronUp} />
                    </div>
                  ) : null}
                </li>
              </div>
            ))}



            {props.room.admin.map((admin) => (
              <div className='users'>
                <li className="Userfriend-">

                  <div className="com1-"><div className="th1-" href="https://unsplash.com/photos/UrfpprfDB0k" target="_blank"><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${admin.id}`} onClick={() => {handleGoToProfile(admin)}} /></div></div>

                  <div className='FrContent-'>
                    <p>{admin.username}</p>
                    {user.current.id !== admin.id && ((!user.current.blocked || !user.current.blocked.includes(admin.id)) && (!user.current.blockedBy || !user.current.blockedBy.includes(admin.id))) ? (<>
                      {admin.Status ? <img src="https://cdn1.iconfinder.com/data/icons/tech-1-2-flat/234/internet-online-offline-web-512.png" style={{ width: '1px', height: '1px' }} /> : <img src="https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/offline-internet-icon.png" style={{ width: '1px', height: '1px' }} />}
                      {/* https://uxwing.com/wp-content/themes/uxwing/download/internet-network-technology/offline-internet-icon.png */}
                      <img src="https://cdn1.iconfinder.com/data/icons/tech-1-2-flat/234/internet-online-offline-web-512.png" style={{ width: '1px', height: '1px' }} />
                      {/* https://cdn-icons-png.flaticon.com/512/10264/10264703.png */}
                      {user.current.friends && user.current.friends.includes(admin.id) ?
                        <img src="https://cdn-icons-png.flaticon.com/512/10264/10264703.png" onClick={() => {removeFriend(admin.id)}} />
                        : <img src="https://cdn-icons-png.freepik.com/512/10265/10265398.png" onClick={() => {sendInvitation(admin.id)}} />
                      }

                      <img src="https://cdn4.iconfinder.com/data/icons/sports-57/32/ping_pong-512.png" onClick={() => {sendGamesInvitation(admin.id)}} />
                      <img src="https://cdn3.iconfinder.com/data/icons/social-messaging-ui-color-line/254000/45-512.png" onClick={async () => { await CreateConversation(admin); }} />
                    </>) : <></>} </div>

                </li>{showBar ? <ThreeDotBar room={props.room} user={admin} /> : <></>}{user.current.id === props.room.owner.id ? (<div className='owner-dots' onClick={() => setShowbar(!showBar)}><FontAwesomeIcon icon={faChevronUp} /></div>) : <></>}</div>))}
          </div></fieldset> </div>
      <div>
        {props.room.owner.id === user.current.id || (props.room.admin && props.room.admin.includes(user.current.id)) ?
          <div className='addUserToRoom'>
            <button onClick={() => setSearch(!searchToAdd)}><FontAwesomeIcon icon={faUserPlus} /></button>   {searchToAdd ? <><input type="text" placeholder="search..." value={searchTerm} onChange={(event) => handleInputChange1(event)} />  <ul className='searchedUsers'>
              {userSuggestions.map((userS) => (

                <li key={userS.id} onClick={async () => { await addUserToRoom(userS); }}><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${userS.id}` } />{userS.username}<br /><p>{userS.displayName}</p><br /></li>
              ))}
            </ul></> : <></>}
          </div> : <></>}</div>


      {props.room.owner.id === user.current.id && props.room.type !== 'private' && !showPasswordInput ? (
        <div className='passwordSettings'>
          {props.room.type === 'protected' ? (
            <>
              {passwordChange ? <>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required
                />
                <button onClick={handleChangePassword}>save</button></> :
                <button onClick={() => setPasswordChange(true)}>Change Password</button>}
              <button onClick={handleRemovePassword}>Remove Password</button>
            </>
          ) : (
            <>{passwordChange ? <>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} required
              />
              <button onClick={handleChangePassword}>save</button></> :
              <button onClick={() => setPasswordChange(true)}>Add Password</button>}</>
          )}
        </div>
      ) : null}      <div className='other-options'>
        <button onClick={handleExitTheRoom}><FontAwesomeIcon icon={faPersonRunning} className='fav' /><h2>Exit The Room</h2></button><br /></div></>) : (<>
          <div className='user-infoP'>
            <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${props.conv.friend.id}`} onClick={() => {handleGoToProfile(props.conv.friend)}}/>
            <h2>{props.conv.friend.username}</h2></div>
          <div className="friend-infos">
            <button onClick={handleRemoveConversation}><FontAwesomeIcon icon={faTrash} className='fav' style={{ color: 'green' }} /><h2 style={{ color: 'green' }}>Remove Conversaion</h2></button>
            {(user.current.blocked && user.current.blocked.includes(props.conv.friend.id)) || (user.current.blockedBy && user.current.blockedBy.includes(props.conv.friend.id)) ? <></> : <>
              <button onClick={handleInviteToPlay}><FontAwesomeIcon icon={faTableTennisPaddleBall} className='fav' style={{ color: 'bisque' }} /><h2 style={{ color: 'bisque' }}>Invite It To Play</h2></button>
              <button onClick={handleBlock}><FontAwesomeIcon icon={faBan} className='fav' style={{ color: 'red' }} /><h2 style={{ color: 'red' }}>Block This Friend</h2 ></button></>}
          </div></>)}
  </div>)
}


export default Info;