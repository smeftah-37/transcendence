import React, { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Intro from './ft_intro/intro.ts';
import Auth from './ft_auth/auth.tsx';
import Charachter from './ft_charachter/charachter.tsx';
import Home from './ft_home/home.tsx'
import Navbar from './Navbar/Navbar.tsx';
import Messages from './Messages/Messages.tsx';
import Settings from './ft_home/ft_settings/settings.tsx';
import ElementMsg from './Messages/ElementMsg/ElementMsg.js';
import Rooms from './Rooms/Rooms.tsx'
import Info from './Messages/ElementMsg/Info/Info.js'
import CreateChannel from './Rooms/CreateChannel/CreateChannel.tsx';
import UserInformation from './UserInformation/UserInformation.tsx';
import { SocketProvider, UserProvider, OtherStateProvider, AuthProvider, SocketGameProvider, useAuth } from './SocketContext.tsx';
import HandleConnect from './HandleConnect.tsx';
import Profile from './ft_home/ft_profile/profile.tsx';

function AuthenticatedRoute() {

  // Assuming you have some method to check authentication status
  

  // If authentication hasn't occurred, redirect to the 404 page
  if (!isAuthenticated) {
    navigate('/');
    return null; // Render nothing, as we're redirecting
  }

  // If authenticated, render the provided element
  return <Route {...rest} element={element} />;
}

const DefaultAuth: FC = () => {
  return (
    <div className='sossi'><h1>404 - Nobody is there
    </h1></div>
  );
}

const App: FC = () => {

  const { isAuthenticated } = useAuth();
 

  return (
    <Router>

      <UserProvider>
        <OtherStateProvider>
            <SocketProvider>
              <SocketGameProvider>
            {!isAuthenticated ? <Auth /> :
                <Routes>
                  <Route path='/HandleConnect' element={<HandleConnect />} />
                  <Route path="/" element={<Auth />} />
                  <Route path="/Charac" element={<Charachter />} />

                  <Route path="/Home/*" element={<Home />}>
                    <Route path="Settings" element={<Settings />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="chat/*" element={<Navbar />}>
                      <Route path="Messages/*" element={<Messages />}>
                        <Route path="ElementMsg" element={<ElementMsg />} />
                      </Route>
                      <Route path="UserInformation" element={<UserInformation />} />

                      <Route path="Rooms/*" element={<Rooms />}>
                        <Route path="CreateChannel" element={<CreateChannel />} />
                        <Route path="ElementMsg" element={<ElementMsg />} />
                        <Route path="Info" element={<Info />} />
                      </Route>
                      <Route path="Profile" element={<Profile />} />
                    </Route>
                  </Route>
                  <Route path='*' element={<DefaultAuth />} /> {/* No path specified, matches when no other route matches */}

                </Routes>}
              </SocketGameProvider>
            </SocketProvider>
        </OtherStateProvider>
      </UserProvider>

    </Router>
  );
}

export default App;
