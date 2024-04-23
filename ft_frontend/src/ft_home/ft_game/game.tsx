import React, { Suspense, useEffect, useRef, useState } from 'react';
import './game.css';
import blach1 from './assets/vlog.mp4';
import ScoreBoard from './utils/scoreboard.tsx';
import { Canvas, useFrame, extend } from 'react-three-fiber';
import { OrbitControls } from '@react-three/drei';
import TableX from './assets/TableX';
import Materia from './assets/Materia';
import * as THREE from 'three';
import {  Physics } from '@react-three/cannon';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';
import { useUser,useSocketGame } from '../../SocketContext.tsx';
import './utils/scoreboard.css';


export const Waiting: React.FC = () => {
  const { user }: { user: string } = useUser();
  const { socketGame }: { socketGame: any } = useSocketGame();
  const navigate = useNavigate();

  if (!socketGame.current) navigate('../Profile');

  const [closeButtonTimeout, setCloseButtonTimeout] = useState<number | null>(null);

  const handleMouseDown = () => {
    document.querySelectorAll("p").forEach((node) => node.remove());

    setCloseButtonTimeout(
      setTimeout(() => {
        const headers = document.getElementsByClassName('menu-');
        if (headers.length > 0) {
          for (let i = 0; i < headers.length; i++) {
            headers[i].style.display = 'grid';
          }
        }
        if(socketGame.current)
        {
        socketGame.current.disconnect();
        socketGame.current = 0;
        }
        navigate('../Profile');
      }, 2000)
    );
  };

  const handleMouseUpLeave = () => {
    clearTimeout(closeButtonTimeout);
  };

  useEffect(() => {
    return () => clearTimeout(closeButtonTimeout);
  }, [closeButtonTimeout]);

  const handleQuit = () => {
    handleMouseUpLeave();
  };

  useEffect(() => {
    if (!socketGame.current) navigate('../Profile');
  }, [socketGame.current]);

  return (
    <>
      <div className="container1"><div className="quit">
        <div
          className="close-icon"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUpLeave}
          onMouseLeave={handleMouseUpLeave}
          onClick={handleQuit}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" enable-background="new 0 0 60 60">
            <line x1="15" y1="15" x2="25" y2="25" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10"></line>
            <line x1="25" y1="15" x2="15" y2="25" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10"></line>
            <circle className="circle" cx="20" cy="20" r="19" opacity="0" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10" fill="none"></circle>
            <path d="M20 1c10.45 0 19 8.55 19 19s-8.55 19-19 19-19-8.55-19-19 8.55-19 19-19z" className="progress" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10" fill="none"></path>
          </svg>
        </div>
      </div>
        <div className="kikiHazin">
          <p>"Patience is bitter, but its fruit is sweet."</p>
          <div id="load">
            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>G</div>
            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>N</div>
            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>I</div>
            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>D</div>
            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>A</div>
            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>O</div>

            <div style={{ fontFamily: 'Kikia', filter: 'drop-shadow(0 0 10px white) saturate(1)' }}>L</div>
          </div>
        </div>
      </div>
      
    </>
  );
};

extend({ UnrealBloomPass });

const AllGame: React.FC = () => {
  const location = useLocation();
  const state = location.state;
  const { socketGame }: { socketGame: any } = useSocketGame();
  const navigate = useNavigate();
  const [lightIntensity, setLightIntensity] = useState<number>(0);
  const [moveBall, setMoveBall] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!socketGame.current &&state &&  state.info) 
      navigate('../Profile');
    if (socketGame.current)
    {
    socketGame.current.on('player-disconnected', () => {
        console.log("im heeeeeeeeereeeeeeeeeeee")
        const headers = document.getElementsByClassName('menu-');
        if (headers.length > 0) {
          for (let i = 0; i < headers.length; i++) {
            headers[i].style.display = 'grid';
          }
        }
        if(socketGame.current)
        {
        socketGame.current.emit('game-forfeit', { gameId: state.info.game.id, userId: state.userId, looserId: state.info.players[0] === state.userId ? state.info.players[1] : state.info.players[0] });
        socketGame.current.disconnect();
        socketGame.current = 0;
        }
        navigate('../DataAnalysis');
      });}
  }, [socketGame.current]);

  const handleQuit = () => {
    const headers = document.getElementsByClassName('menu-');
    if (headers.length > 0) {
      for (let i = 0; i < headers.length; i++) {
        headers[i].style.display = 'grid';
      }
    }
    if(socketGame.current)
    {
    socketGame.current.disconnect();
    socketGame.current = 0;
    }
    navigate('../Profile');
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      canvasRef.current?.requestFullscreen().catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      toggleFullScreen();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleIntensityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newIntensity = event.target.checked ? 1.5 : 0;
    setLightIntensity(newIntensity);
  };

  const handleCollision = () => {
    setMoveBall(true);
  };

  return (
    <>
      <div className="container1">

        <div className='ScBrd'>

          {console.log(state)}
         <ScoreBoard  game={state && state.info && state.info.game ? state.info.game : null}/>
        </div>
        <div className="Game"> 
          <input className="lighting" type="checkbox" onChange={handleIntensityChange} />
          <div className="OnlineGame">
            <Canvas style={{ width: '80vw', height: '75vh',borderRadius: '20px', overflow: 'hidden' }} ref={canvasRef}>
              <Physics colliders={false}>
                <ambientLight intensity={lightIntensity} />
                <EffectComposer disableNormalPass>
                  <Bloom luminanceThreshold={1} mipmapBlur />
                </EffectComposer>
                <directionalLight color="white" intensity={lightIntensity} position={[5, 5, 5]} />
                <pointLight color="white" intensity={lightIntensity} position={[-10, 10, 10]} />
                <spotLight color="white" intensity={lightIntensity} position={[10, 10, 10]} angle={Math.PI / 6} penumbra={0.2} />
                <Suspense fallback={null}>
                  <TableX onCollision={handleCollision} />
                  <Materia state={state} />
                  <OrbitControls
                    position={[0, 10, 20]}
                    enablePan={true}
                    enableZoom={true}
                    minPolarAngle={-2 * Math.PI}
                    maxPolarAngle={Math.PI / 2.1}
                    minDistance={1}
                    maxDistance={3.75}
                  />
                </Suspense>
              </Physics>
            </Canvas>
          </div>
        </div>
        <div className="quit">
          <div className="close-icon" onClick={handleQuit}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" enable-background="new 0 0 60 60">
              <line x1="15" y1="15" x2="25" y2="25" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10"></line>
              <line x1="25" y1="15" x2="15" y2="25" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10"></line>
              <circle className="circle" cx="20" cy="20" r="19" opacity="0" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10" fill="none"></circle>
              <path d="M20 1c10.45 0 19 8.55 19 19s-8.55 19-19 19-19-8.55-19-19 8.55-19 19-19z" className="progress" stroke="#35C4F0" stroke-width="1.75" stroke-linecap="round" stroke-miterlimit="10" fill="none"></path>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllGame;