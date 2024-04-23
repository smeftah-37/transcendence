import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useAuth, useSocket, useUser } from '../SocketContext.tsx';

import blach from './assets/bef4sec.mp4'
import s7or from './assets/after4sec.mp4'
import Home from '../ft_home/home.tsx';

import './auth.css';
const NavigateToChar: React.FC = () => {
  const navigate = useNavigate();
  const [showSun, setShowSun] = useState(false);
  useEffect(() => {
    // Wait for 5 seconds before showing the sun
    const timeout = setTimeout(() => {
      setShowSun(true);
    }, 3000); // 5000 milliseconds (5 seconds)

    // Clean up the timeout to avoid memory leaks
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // After showing the sun for 10 seconds, navigate to the specified route
    if (showSun) {
      const timeout = setTimeout(() => {
        navigate('/Charac');
      }, 700); // 10000 milliseconds (10 seconds)

      // Clean up the timeout to avoid memory leaks
      return () => clearTimeout(timeout);
    }
  }, [navigate, showSun]);
  return (
    <div>

      {showSun && <div><div className="_sun"></div></div>}
      {/* <div className='_cloud'>
        <img src={cloud1} className = "_cloud1" alt =""/>
        <img src={cloud2} className = "_cloud2" alt =""/>
        <img src={cloud3}  className = "_cloud3" alt =""/>
        <img src={cloud1} className = "_cloud4" alt =""/>
        <img src={cloud2} className = "_cloud5" alt =""/>
        <img src={cloud3} className = "_cloud6" alt =""/>
        
        </div> */}
    </div>
  );
};



const Auth: React.FC = () => {
  // State to handle loading and error states
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchingstatus, setFetching] = useState<boolean>(false);
  const { login } = useAuth();
  const [secretKey,setSecretKey] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { updateUser, updateToken } = useUser();
  const {socket, updateSocket} = useSocket();
  const [showAuthenticateButton, setShowAuthenticateButton] = useState<boolean>(false);

  const [user, setUser] = useState({
    id: -1,
    username: '',
    displayName: '',
    avatar: '',
    socketId: '',
    A2f: false,
  });
  useEffect(() =>
  {
    if(socket.current)
    socket.current.on('notValidAuth', () => {
      alert('notValid');
    });
    if(socket.current)
    socket.current.on('validKeyAuth', (message) => {
      console.log('im heeeeeeeeeeeeereeeeee');
      user.A2f = true;
      updateUser(message.user);
      navigate('/Home');
    });
  },socket.current)

  useEffect(() => {
    // Set a timeout to show the authenticate button after 4 seconds
    const timeoutId = setTimeout(() => {
      setShowAuthenticateButton(true);
    }, 4000);

    // Clean up the timeout to prevent memory leaks
    return () => clearTimeout(timeoutId);
    
  }, []);
  const fetchData = async () => {
    try {
      // Make a request to your API endpoint

      const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/auth/logged', {

        credentials: 'include',
      });
      // Check if the response is OK (status code 200-299)
      if (!response.ok) {
        throw new Error('Request failed');
      }

      // Parse the response JSON
      let data;
      try {
        data = await response.json();
        if (data && data.user) {
          setApiData(data.user);
          // Update the state with the fetched data

          localStorage.setItem('userData', JSON.stringify(data.user));

          updateUser(data.user);
          updateToken(data.token);
          login();
          // if (data.user && data.user.id && socket)
          //   socket.emit('set-socket-id', { userId: data.user.id, socketId: socket.id });

          setUser(data.user);
          
        }
        setLoading(false); // Set loading to false
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    } catch (error) {
      setError(error.message);
      setLoading(false); // Set loading to false
    }
  };

  const openNewWindowAndFetchData = async () => {
    // Open a new window
    const originalUrl = window.location.href;



    // Redirect the current tab to the authentication URL
    window.location.href = 'http://10.13.1.10:3004/SchoolOfAthensApi/auth/login/42/';

    // After a short delay, perform the fetch operation
    setTimeout(async () => {
      try {
        // Perform the fetch operation to check authentication status
        const response = await fetch('/login/42/return');
        if (response.ok) {
          // If authentication is successful, redirect to the home page
          window.location.href = '/'; // Replace '/' with your home page URL
        } else {
          // Handle authentication failure
          throw new Error('Authentication failed');
        }
      } catch (error) {
        // Handle any errors that occur during the fetch operation
        setError(error.message);
      }
    }, 2000); // Adjust the delay time as needed
  };

  const logout = async () => {
    try {
      // Make a request to logout endpoint
      const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/auth/logout', {


        credentials: 'include',
      });
      // Perform additional logout logic if needed
      console.log('Logout successful');

      // Update the state after logout
      setUser({
        id: -1,
        username: '',
        displayName: '',
        avatar: '',
        socketId: '',
      });
      updateUser({
        id: -1,
        username: '',
        displayName: '',
        avatar: '',
        socketId: '',
      });
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  useEffect(() => {
    // Call the fetchData function when the component mounts
    fetchData();
  }, []);
  const  handleSaveSecret = (secretKey: any)=>
  {
    if(!socket.current)
       socket.current = updateSocket(socket.current);
    socket.current.emit('check-secretAuth', { userId: user.id, secret: secretKey });

  }
  const goToProfile = () =>
  {
    navigate('/Home/Profile');
  }
  return (
    <>
      {user.id === -1 ? (<div className='Allauth'><div className='Place'>

        <video autoPlay muted >
          <source src={blach} type="video/mp4" />
          Your browser does not support the video tag.
        </video>


      </div>{showAuthenticateButton && (
        <div className='Neo'>
          <button className="neon" onClick={openNewWindowAndFetchData}>Authenticate</button>
        </div>)}</div>) : (
        <>
          <div className='Allauth'><div className='Place'>

            <video autoPlay muted >
              <source src={s7or} type="video/mp4" />
            </video>


          </div>
            {console.log(user)}
            {user.username ? (user.A2f ? <><div className='c-form'>
                  <input className='c-form__input' value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required />
                  <button className="c-form__button" type="button" onClick={() => { handleSaveSecret(secretKey) }}>Go!</button>
                </div></> : goToProfile()) : <NavigateToChar />}</div></>

      )}</>
  );
};




export default Auth;