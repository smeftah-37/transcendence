import React, { FC, useEffect, useRef, useState } from 'react';
import LastGames1 from './ft_profile/LastGames1.tsx';

import './home.css';
import Profile from './ft_profile/profile.tsx'
import Menu from './ft_menu/menu.tsx'
import {Route , Routes, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar/Navbar.tsx';
import Messages from '../Messages/Messages.tsx';
import Settings from './ft_settings/settings.tsx';
import Rooms from '../Rooms/Rooms.tsx';
import ElementMsg from '../Messages/ElementMsg/ElementMsg.js';
import Info from './ft_profile/ft_profileDivs/info.tsx';
import CreateChannel from '../Rooms/CreateChannel/CreateChannel.tsx';
import { useSocket, useSocketGame, useUser } from '../SocketContext.tsx';

import { useAuth } from '../SocketContext.tsx';
import AllGame from './ft_game/game.tsx';
import AboutUs from './ft_about/about.tsx';
import UserInformation from '../UserInformation/UserInformation.tsx';

import LastGames2 from './ft_profile/LastGames2.tsx';
import  Vizualisations  from './ft_DataAnalysis/DataAnalysis.tsx';
import DataAnalysis from './ft_DataAnalysis/DataAnalysis.tsx';
import { Waiting } from './ft_game/game.tsx';

function Home1(): JSX.Element {
  let {updateUser,user} = useUser();
  const [invite, setInvite] = useState<number>(0);
  const {socket, updateSocket} = useSocket();
  const {socketGame,updateSocketGame} = useSocketGame();
  // const [name,setName] = useState(user.username);
  const [change,setChange] = useState(false);
  const [blockedList, setBlocked] = useState<Array<any>>([]);
  const Gamename: string = "Let the Paddles clash, let the swords sleep!" ;
  const Notifgame: string = "Want to beat you 1 vs 1.";
  const Invit: string = "A friend is another self.";
  const Notifinvit: string = " is sending you a friend request.";

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate()
  if(!socket.current)
    socket.current = updateSocket();
  if(!user.current)
    user.current = updateUser(user.current);
  

    const AuthenticatedRoute: FC<{ path: string; element: React.ReactNode }> = ({ path, element }) => {
      if (!isAuthenticated) {
        navigate('/');
        return null;
      }
      return <Route path={path} element={element} />;
    };



  useEffect(() => {

    socket.current.on('status',(message: any) =>
    {
      if(message.userId === user.current.id)
      {
      user.current.Status  = message.status;
      user.current = updateUser(user.current);
      }
    }

    )
    socket.current.on('go-toPlay', (ids: any) => {
   socketGame.current = updateSocketGame(socketGame.current);
      socketGame.current.emit('wanna-play',ids);
      socketGame.current.on('start-game', (info: any) => {
        navigate('./AllGame', { state: { userId: user.current.id, info}});
        
      });

      
    })
    socket.current.on('invitation-game', (sender: any) => {
      console.log('im heereeee');
      socket.current.emit('invitation-bar', { userId: sender.id });

    })
    socket.current.on('invitation-bar', (sender: any) => {
      console.log("im heeree");
      setInvite(sender);
 
  });

        
    // Check if the user is authenticated
    // if (!isAuthenticated) {
    //   // If not authenticated, redirect to the login page or any other route
    //   // For example, redirect to the "/auth" route
    //   // You can use the <Navigate> component to redirect programmatically
    //   return navigate("/auth");
    // }
  }, [socket.current,user.current]);
  useEffect(() =>
  {
    if(socketGame.current)
    {
    socketGame.current.on('start-game', (info: any) => {
      console.log('info data ==>',info);
    navigate('./AllGame', { state: { userId: user.current.id, info}});
    
  });}
  },[socketGame.current,])


    return(


      
        <>
    <div className="Home"><div className="Header">
            <Menu/>
        </div>
        
        {/* <div className="Profile"><Profile/></div> */}
        {invite ? <>  <div className="Footer">
        <div className="notification">

	<div className="notification-header">			
  <img src={invite.avatar && invite.avatar.length > 0 && invite.avatar[0] === '/' ? invite.avatar : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${invite.id}`}/>

		<h3 className="notification-title">{invite.username} Want to beat you 1 vs 1.</h3>
		<i className="fa fa-times notification-close"></i>
	</div>
	<div className="notification-container">

		<div className="notification-content">
			<p className="notification-text">
			<strong>"Let the Paddles clash, let the swords sleep!"</strong>
			</p>
		</div>
		<span className="notification-status"></span>
	</div>
</div>
{
        setTimeout(() => {
          setInvite(0);

        },7000)}</div></> : <></>}
      
    <Routes>


        <Route path="profile" element={<Profile/>} >

		<Route path='LastGames2' element={<LastGames2 />}/>
		<Route path='*' element={<LastGames1 />}/>
    </Route>


        <Route path='AllGame' element={<AllGame/>} />
        <Route path='Waiting' element={<Waiting />} />

        <Route path="DataAnalysis" element={<DataAnalysis/>} >
        <Route path='Vizualisations' element={<Vizualisations />} />

          </Route>
        <Route path="Settings" element={<Settings />} />
        
        <Route path="chat/*" element={<Navbar/>} >
        
        <Route path="Messages/*" element={<Messages />} >
            <Route path="ElementMsg" element={<ElementMsg />} />
          </Route>
          <Route path="Rooms/*" element={<Rooms/>} >
            <Route path="CreateChannel" element={<CreateChannel />} />
            <Route path = "ElementMsg/*" element={<ElementMsg />} >

          <Route path="Info" element={<Info/>} />
            </Route>
            
      </Route>
      <Route path="UserInformation" element={<UserInformation />} />
      
      </Route>
      


    </Routes> 
</div>
    </>
    );
};

function Home(): JSX.Element {
  return (
      <Home1 />
  );
}

export default Home;