import React, { FC, useEffect, useState } from 'react';
import './levelup.css';
import { Link ,Route, Routes} from 'react-router-dom';
import LastGames1 from '../LastGames1';
import { useUser } from '../../../SocketContext.tsx';

const LevelUP: FC = () => {
	const {user,token ,updateToken,updateUser} = useUser();
	const [newUser, setNewUser] = useState([]);
	// const progress = document.querySelector('.progress-done');
	// progress.style.width = progress.getAttribute('data-done') + '%';
	// progress.style.opacity = 1;
	if(!token.current)
		token.current = updateToken(null);
	useEffect(() =>
	{
		const fetchData = async  () =>
		{
		const response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/${user.current.id}`, {

        headers: {
          'authorization': token.current,// Specify the content type of the request body
          // Add any other headers you need, such as authorization headers
        }
      })

      if (!response.ok) {
        throw new Error('Failed to patch resource');
      }
      const data = await response.json();
	  updateUser(data);
      setNewUser(data);
	}
	fetchData();
	},[user.current])
    return (
        <>
	
<div className="progress">

	<div className="progress-done" style={{width: `${newUser.xp}%`}}>
	{newUser.xp}%
	</div>
</div>
	
	<div className='barStats'>
	<ul className="menu-bar">
		
    <li><Link to={"LastGames"}  style={{textDecoration: 'none', color: 'white'}}>Results</Link></li>
    <li><Link to={"LastGames2"}  style={{textDecoration: 'none', color: 'white'}}>Live Matchs</Link></li>
	</ul>
	</div>
		
		</>
    );
    
};

export default LevelUP;