import React, { FC } from 'react';
import './profile.css';
import Info from './ft_profileDivs/info.js'
import Overview from './ft_profileDivs/overview.js';
import { Route, Routes, useLocation } from 'react-router-dom';
import chatIcon from './assets/chat_icon.png';
import MorePlay from './ft_profileDivs/moreplay.js';
import Avatar from './utils/avatar.tsx';
import LevelUP from './utils/levelup.tsx';
import ChatBar from './chatBar.tsx';
import LastGames1 from './LastGames1.tsx';
import { useUser } from '../../SocketContext.tsx';
import LastGames2 from './LastGames2.tsx';

interface ProfileProps {}

const Profile: FC<ProfileProps> = () => {
  const { token, updateToken } = useUser();

  if (!token.current) token.current = updateToken(null);
  const location = useLocation();
  const state = location.state;
  return (
    <>
      <div className='Profile'>
        <div className='ChatBar'>
          <ChatBar />
        </div>
        <div className='ProfileBis'>
          <div className='InfoProfile'>
            <div className='Avatar'>
              <Avatar friend={state} />
            </div>
            <div className='Level'>
              <LevelUP friend={state} />
            </div>
            <div className='Viz'></div>
          </div>
          <div className='Infostats'>
            <div className='LastGames'>
              <Routes>
                <Route path='LastGames2' element={<LastGames2 friend={state} />} />
                <Route path='*' element={<LastGames1 friend={state} />} />
              </Routes>
            </div>
            <div className='TotalGames'></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;