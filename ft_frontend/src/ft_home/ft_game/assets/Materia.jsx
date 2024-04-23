import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

import Ma from './materia.glb';
import PaddleBot from '../utils/PaddleBot.tsx';
import PaddleOppMove from '../utils/PaddleOppMov.tsx';
import PaddleMove from '../utils/Paddlemove.tsx';

import { useSocketGame, useUser } from '../../../SocketContext.tsx';
import { useNavigate } from 'react-router-dom';
export default function Model(props) {
  const date = new Date();
  const time = date.getTime() * 1000;
  let { socketGame } = useSocketGame();
  let ballRef = useRef();
  const paddleRef = useRef();
  const paddleRef_Opp = useRef();
  const [kiki, setKiki] = useState(false);
  const boundaryMinX = normalize(-1.4, -1.4, 1.35);
  const boundaryMaxX = normalize(1.35, -1.4, 1.35)
  const boundaryMinY = 0;
  const boundaryMaxY = 1.15;
  const boundaryMinZ = normalize(-1.72, -1.72, 2.05);
  const boundaryMaxZ = normalize(2.05, -1.72, 2.05);
  const paddleSpeed = useRef(0);
  const deltaPaddle = useRef(0);
  const paddleSpeedOpp = useRef(0);
  const {token} = useUser();
  const [tableTouched, setTableTouched] = useState(false);
  const [stop, setStop] = useState(false);
  let { state } = props;
  if (!state.info) {
    socketGame.current = null;
    state.info = { players: [state.userId, -1] };
  }

  const DistX = Math.abs(boundaryMaxX - boundaryMinX);
  const DistY = Math.abs(boundaryMaxY - boundaryMinY);
  const DistZ = Math.abs(boundaryMaxZ - boundaryMinZ);
  const navigate = useNavigate();
  const gamesLog = useRef({
    startPoint: { x: -0.025, y: 1.05, z: 2.05 },
    endPoint: { x: 0, y: 0, z: 0 },
    Control1: { x: 0, y: 0, z: 0 },
    Control2: { x: 0, y: 0, z: 0 },
    matchStart: true,
    SavePointDep: [-1, -1, -1],
    SavePointFin: [-1, -1, -1],
    SaveC1: [-1, -1, -1],
    SaveC2: [-1, -1, -1],
    score: [0, 0],
    out: false,
    lastWon: 0,
    kikiaMskina: 1,
    PaddleSpeed: 0,
    delta: deltaPaddle.current,
    Player1: 0,
    Player2: 0,
    Hit: { x: 0, y: 0, z: 0 },
    EndMatch: false,
    Pointend: true,
    puissance: 0,
    speed: 0.2,
    PointStart: true,
    boundaryMinX,
    boundaryMaxX,
    boundaryMinY,
    boundaryMaxY,
    ServiceY: 1.05,
    prevTouch: -1,
    Rotate: 0,
    filet: false,
    milieu: false,
    clean: true,
    boundaryMinZ,
    boundaryMaxZ,
    DistX,
    DistY,
    DistZ,
    paddle1: paddleRef.current,
    paddle2: paddleRef_Opp.current,
    time_paddle: 0,
    starttime: time,
    whos: 1,
  });
  let [ballTouched, setBallTouched] = useState(false);
  let [pointing, setpointing] = useState(false)// Flag to track if the ball has been touched by the paddle
  let check = 0;
  const { nodes, materials } = useGLTF(Ma);

  let [RotatePaddle, setRotatePaddle] = useState(0);
  let [RotatePaddleOpp, setRotatePaddleOpp] = useState(0);
  let puissance = 0;
  const handleDeltaPaddleChange = (newDeltaPaddle) => {
    gamesLog.current.delta = newDeltaPaddle;
  };
  useEffect(() => {
    const saveMatch = async () => {

      const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/game/saveGame/' + state.info.game.id, {

        method: 'PATCH',
        headers: {
          'authorization': token.current,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Include the data you want to update in the request body
          Duration: 0,
          winnerId: state.info.players[gamesLog.current.lastWon],
          winnerScore: gamesLog.current.score[gamesLog.current.lastWon],

          looserId: state.info.players[gamesLog.current.lastWon ? 0 : 1],
          looserScore: gamesLog.current.score[gamesLog.current.lastWon ? 0 : 1],
          // Add other fields as needed
          // Add other fields as needed
        }),
      });
    }
    const fetchData = async () => {

      const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/game/editPoint/' + state.info.game.id, {

        method: 'PATCH',
        headers: {
          'authorization': token.current,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Include the data you want to update in the request body

          Playerid: state.info.players[gamesLog.current.lastWon],
          Start: gamesLog.current.SavePointDep,
          End: gamesLog.current.SavePointFin,
          C1: gamesLog.current.SaveC1,
          C2: gamesLog.current.SaveC2,


          // Add other fields as needed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to patch resource');
      }

    }
    if (stop) {
      (async () => {


   
      if (gamesLog.current.lastWon === 1)
        gamesLog.current.score[1]++;
      else
        gamesLog.current.score[0]++;

      if (socketGame.current)
        socketGame.current.emit('start-status', { lastWon: gamesLog.current.lastWon, matchStart: true, userId: state.userId, players: state.info.players, score: gamesLog.current.score });
      if (state.info.players[1] !== -1)
        await fetchData();


      if (gamesLog.current.score[0] === 11 || gamesLog.current.score[1] === 11) {
        if (state.info.players[1] !== -1)
          await saveMatch();
        gamesLog.current.EndMatch = true;
        if (socketGame.current)
          socketGame.current.emit('end-match', { end: true, players: state.info.players, userId: state.userId });
      }
      else
        gamesLog.current.matchStart = true;
      setStop(false);
    })();
    }
    if (socketGame.current)
      socketGame.current.on('start-status', (message) => {
        gamesLog.current.matchStart = message.matchStart;
        gamesLog.current.lastWon = message.lastWon;
        gamesLog.current.score = message.score;

      }
      )
    if (socketGame.current)
      socketGame.current.on('end', (message) => {
        if (message)
          gamesLog.current.EndMatch = message.end;

      }
      )
  }, [stop, socketGame.current]);

  let startPoint = { x: -0.025, y: 1.05, z: 2.05 };

  const LogicGame = () => {
    if (gamesLog.current.EndMatch) {
      const headers = document.getElementsByClassName('menu-');
      if (headers.length > 0) {
        // Loop through all elements with the class name 'menu-'
        for (let i = 0; i < headers.length; i++) {
          // Set the display style to 'grid' for each element
          headers[i].style.display = 'grid';
        }
      }
      if(socketGame.current)
      {
        socketGame.current.disconnect();
        socketGame.current = 0;
      }
      navigate('../DataAnalysis');
    }
    if (gamesLog.current.matchStart) {
      gamesLog.current.kikiaMskina = 1;
      gamesLog.current.matchStart = false;

      gamesLog.current.Pointend = true;
      const newPosition = new THREE.Vector3(); // Create a new instance of Vector3
      if (gamesLog.current.lastWon === 0) {
        newPosition.set(-0.025, 1.05, 2.05); // Set the position values
      } else if (gamesLog.current.lastWon === 1) {
        newPosition.set(-0.025, 1.05, -1.72); // Set the position values
      }
      if (socketGame.current)
        socketGame.current.emit('ball-move', {
          x: newPosition.x,
          y: newPosition.y,
          z: newPosition.z,
          players: state.info.players,
          userId: state.userId
        });
    }

    // else if (!gamesLog.current.matchStart && !gamesLog.current.Pointend) {
    //     if (gamesLog.current.whos)
    //     {
    //       gamesLog.current.startPoint.x = (gamesLog.current.boundaryMinX + gamesLog.current.boundaryMaxX) / 2;
    //       gamesLog.current.startPoint.y = gamesLog.current.ServiceY;
    //       gamesLog.current.startPoint.z = gamesLog.current.boundaryMaxZ;
    //     }
    //     else
    //     {
    //       gamesLog.current.startPoint.x = (gamesLog.current.boundaryMinX + gamesLog.current.boundaryMaxX) / 2;
    //       gamesLog.current.startPoint.y = gamesLog.current.ServiceY;
    //       gamesLog.current.startPoint.z = gamesLog.current.boundaryMinZ;
    //     }
    // }
  }
  function normalize(value, min, max) {

    return (value - min) / (max - min);
  }
  function denormalize(normalizedValue, min, max) {

    return normalizedValue * (max - min) + min;
  }

  // Define the start point, end point, and control points for the Bezier curve
  let distanceZ = 0;
  let Normalmente = 0;
  let varZ = 1;

  if (ballRef.current) {
    if (gamesLog.current.whos) {
      varZ = -1
      Normalmente = 1 - normalize(ballRef.current.position.z, -1.72, 2.05)
    }
    else {
      Normalmente = 0 - normalize(ballRef.current.position.z, -1.72, 2.05)
    }
  }

  let quota = 1.65;
  if (gamesLog.current.PaddleSpeed < 0.009)
    quota = 1.55;
  if (gamesLog.current.PaddleSpeed < 0.007)
    quota = 1.45;
  if (gamesLog.current.PaddleSpeed < 0.005)
    quota = 1.35;
  if (gamesLog.current.PaddleSpeed < 0.003)
    quota = 1.25;
  if (gamesLog.current.PaddleSpeed < 0.0021)
    quota = 1.20;
  distanceZ = Math.abs(((Normalmente + 0.5 * quota)));

  if (ballRef.current && ballRef.current.position) {
    startPoint = new THREE.Vector3(gamesLog.current.Hit.x, gamesLog.current.Hit.y, gamesLog.current.Hit.z);
  }
  else {

    startPoint = new THREE.Vector3(gamesLog.current.startPoint.x, gamesLog.current.startPoint.y, gamesLog.current.startPoint.z);


  }

  let curve;




  useEffect(() => {




    const updateBallPosition = async (prev) => {
      puissance = 0;
      let dist = 0;
      if (curve.getPoint(3).z < 0 && curve.getPoint(0).z > 0 || curve.getPoint(3).z > 0 && curve.getPoint(0).z < 0)
        dist = Math.abs(curve.getPoint(3).z) + (curve.getPoint(0).z);
      else
        dist = (curve.getPoint(3).z) - (curve.getPoint(0).z);


      let speed = 0.0030 + (gamesLog.current.PaddleSpeed * 2.3) / (dist * 5);
      let timeInterval = 0; // Approximately 60 frames per second

      const animate = async () => {
        puissance += speed;
        if (puissance >= 1) {
          puissance = 1;
          // Return the final value of puissance
        }



        if (prev !== gamesLog.current.whos) {
          puissance = 1;
          return;
        }

        const positionOnCurve = curve.getPointAt(puissance);
        ballRef.current.position.copy(positionOnCurve);
        if (socketGame.current)

          socketGame.current.emit('ball-move', {
            x: positionOnCurve.x,
            y: positionOnCurve.y,
            z: positionOnCurve.z,
            players: state.info.players,
            userId: state.userId
          });
        // Emit ball movement if needed (ensure it's outside the if block)


        if (puissance < 1) {

          if (gamesLog.current.prevTouch === prev) {
            timeInterval = 4;
          }


          await new Promise(resolve => setTimeout(resolve, timeInterval));
          return animate(); // Return the result of the recursive call
        }
        return puissance; // Return the final value of puissance
      };

      try {
        // Start the animation loop
        const result = await animate();
        // Handle the result
        return result;
      } catch (error) {
        // Handle the condition met case here
        return null; // Or return whatever you need to indicate the condition being met
      }
    };

    async function reboundTable(positionRebound, Dy, DxFirst) {
      let startPointRebound = new THREE.Vector3(positionRebound.x, positionRebound.y, positionRebound.z);
      let finalPoint_;
      let chkoun = gamesLog.current.whos;
      if (gamesLog.current.whos === 2) {

        finalPoint_ = positionRebound.z - (distanceZ * 3.5);
      }

      else if (gamesLog.current.whos === 3)
        finalPoint_ = positionRebound.z + (distanceZ * 3.5);
      let endPoint_ = new THREE.Vector3(DxFirst, 0, finalPoint_);
      let controlPoint_ = new THREE.Vector3(startPointRebound.x + ((DxFirst - startPoint.x) * 0.33), Dy * 1, (startPointRebound.z + finalPoint_) * 0.25);
      let controlPoint__ = new THREE.Vector3(startPointRebound.x + ((DxFirst - startPoint.x) * 0.66), Dy, (startPointRebound.z + finalPoint_) * 0.75);
      curve = new THREE.CubicBezierCurve3(startPointRebound, controlPoint_, controlPoint__, endPoint_);
      puissance = 0;
      let value = -2;
      if (!stop) {

        gamesLog.current.SavePointFin = [startPointRebound.x, startPointRebound.y, startPointRebound.z];
        puissance = 1;
        value = await updateBallPosition(gamesLog.current.whos);
      }
      if (!stop && gamesLog.current && ballRef.current.position) {
        if ((positionRebound.z >= 0.165 && chkoun === 2 && gamesLog.current.kikiaMskina) || (ballRef.current.position.y < 0.1 && (gamesLog.current.prevTouch === chkoun) && chkoun === 3)) {
          gamesLog.current.lastWon = 1;


          setStop(true);
        }
        else if ((positionRebound.z < 0.165 && chkoun === 3 && gamesLog.current.kikiaMskina) || (ballRef.current.position.y < 0.1 && (gamesLog.current.prevTouch === chkoun) && chkoun === 2)) {
          gamesLog.current.lastWon = 0;





          setStop(true);
        }
      }

    }


    async function TouchTennis(positionTouch, Dy, DxFirst) {

      let startPointRebound = new THREE.Vector3(positionTouch.x, positionTouch.y, positionTouch.z);
      let finalPoint_;
      let middle;
      let middle1;
      gamesLog.current.kikiaMskina = 0;
      if (gamesLog.current.whos === 4) {

        finalPoint_ = 2.85;
        middle1 = 0.9575
        middle = 1.8075

      }

      else if (gamesLog.current.whos === 5) {
        middle1 = -0.5775;
        middle = -1.575;
        finalPoint_ = -2.10;
      }

      let endPoint_ = new THREE.Vector3(DxFirst, 0.93, middle);
      let controlPoint_ = new THREE.Vector3(startPointRebound.x, 1.15, middle1);
      let controlPoint__ = new THREE.Vector3(startPointRebound.x, 1.15, middle1);

      curve = new THREE.CubicBezierCurve3(startPointRebound, controlPoint_, controlPoint__, endPoint_);

      gamesLog.current.SavePointFin = [startPointRebound.x, startPointRebound.y, startPointRebound.z];
      puissance = 1;
      await updateBallPosition(gamesLog.current.whos);
      if (!stop) {
        if (gamesLog.current.whos === 4) {
          gamesLog.current.lastWon = 1;
          setStop(true);
        }
        else if (gamesLog.current.whos === 5) {
          gamesLog.current.lastWon = 0;
          setStop(true);
        }
      }
      // startPointRebound =endPoint_;
      // endPoint_ = new THREE.Vector3(DxFirst, 0,finalPoint_);
      // controlPoint_ = new THREE.Vector3(startPointRebound.x+ ((DxFirst  - startPoint.x) * 0.33), 1.05,middle);
      // controlPoint__= new THREE.Vector3(startPointRebound.x + ((DxFirst  - startPoint.x) * 0.66), 1.05 ,middle);

      // curve = new THREE.CubicBezierCurve3(startPointRebound, controlPoint_, controlPoint__, endPoint_);
      // puissance = 0;
      // await updateBallPosition(gamesLog.current.whos);
    }



    if (ballTouched) {

      let finalPoint = 0;
      let Dy = 1;

      let DxFirst = 0;
      let Dc1 = 1;
      let Dc2 = 1;
      let Dx = 0;


      if (gamesLog.current.whos === 1) {
        if (gamesLog.current.PaddleSpeed >= 0.09)
          Dy = 1.15;
        if (gamesLog.current.PaddleSpeed < 0.09)
          Dy = 1.25;
        if (gamesLog.current.PaddleSpeed <= 0.08)
          Dy = 1.30;
        if (gamesLog.current.PaddleSpeed < 0.06)
          Dy = 1.33;
        if (gamesLog.current.PaddleSpeed < 0.04)
          Dy = 1.36;
        if (gamesLog.current.PaddleSpeed < 0.03)
          Dy = 1.39;
        if (gamesLog.current.PaddleSpeed <= 0.021)
          Dy = 1.42;
        finalPoint = normalize(startPoint.z, -1.72, 2.05) - distanceZ * 1.25;
        if (finalPoint < 0.5)
          gamesLog.current.milieu = true;
      }

      else if (gamesLog.current.whos === 0) {
        if (gamesLog.current.PaddleSpeed >= 0.09)
          Dy = 1.15;
        if (gamesLog.current.PaddleSpeed < 0.09)
          Dy = 1.25;
        if (gamesLog.current.PaddleSpeed <= 0.08)
          Dy = 1.30;
        if (gamesLog.current.PaddleSpeed < 0.06)
          Dy = 1.33;
        if (gamesLog.current.PaddleSpeed < 0.04)
          Dy = 1.36;
        if (gamesLog.current.PaddleSpeed < 0.03)
          Dy = 1.39;
        if (gamesLog.current.PaddleSpeed <= 0.021)
          Dy = 1.42;
        finalPoint = normalize(startPoint.z, -1.72, 2.05) + distanceZ * 1.25
        if (finalPoint > 0.5)
          gamesLog.current.milieu = true;
      }
      else if (gamesLog.current.whos === 3) {
        if (gamesLog.current.PaddleSpeed >= 0.09)
          Dy = 1.15;
        if (gamesLog.current.PaddleSpeed < 0.09)
          Dy = 1.25;
        if (gamesLog.current.PaddleSpeed <= 0.08)
          Dy = 1.30;
        if (gamesLog.current.PaddleSpeed < 0.06)
          Dy = 1.33;
        if (gamesLog.current.PaddleSpeed < 0.04)
          Dy = 1.36;
        if (gamesLog.current.PaddleSpeed < 0.03)
          Dy = 1.39;
        if (gamesLog.current.PaddleSpeed <= 0.021)
          Dy = 1.42;

        if (finalPoint > 0.5)
          gamesLog.current.milieu = true;
      }

      else if (gamesLog.current.whos === 2) {
        if (gamesLog.current.PaddleSpeed >= 0.09)
          Dy = 1.15;
        if (gamesLog.current.PaddleSpeed < 0.09)
          Dy = 1.25;
        if (gamesLog.current.PaddleSpeed <= 0.08)
          Dy = 1.30;
        if (gamesLog.current.PaddleSpeed < 0.06)
          Dy = 1.33;
        if (gamesLog.current.PaddleSpeed < 0.04)
          Dy = 1.36;
        if (gamesLog.current.PaddleSpeed < 0.03)
          Dy = 1.39;
        if (gamesLog.current.PaddleSpeed <= 0.021)
          Dy = 1.42;

        if (finalPoint < 0.5)
          gamesLog.current.milieu = true;
      }

      if (ballRef.current) {
        if (gamesLog.current.whos) {
          if (gamesLog.current.delta === 0 && gamesLog.current.Rotate === 0) {
            DxFirst = ballRef.current.position.x;
            Dx = DxFirst;
          }
          else if (gamesLog.current.delta > 0 && gamesLog.current.Rotate >= 0) {

            DxFirst = ballRef.current.position.x - 0.75;
            Dx = DxFirst;
          }
          else if (gamesLog.current.delta > 0 && gamesLog.current.Rotate <= 0) {
            DxFirst = ballRef.current.position.x + 0.45;
            Dx = DxFirst;
          }
          else {
            if (gamesLog.current.delta > 0) {
              DxFirst = ballRef.current.position.x + 0.75;
            }
            else if (gamesLog.current.delta < 0) {
              DxFirst = ballRef.current.position.x - 0.75;
            }
            else {
              DxFirst = ballRef.current.position.x;
            }

            Dx = ballRef.current.position.x;
          }
        }
        else {
          if (gamesLog.current.delta === 0 && gamesLog.current.RotatePaddle === 0) {
            DxFirst = ballRef.current.position.x;
            Dx = DxFirst;
          }
          else if (gamesLog.current.delta < 0 && gamesLog.current.RotatePaddle <= 0) {
            Dx = ballRef.current.position.x - 0.75;
            Dx = DxFirst;
          }
          else if (gamesLog.current.delta < 0 && gamesLog.current.RotatePaddle >= 0) {
            Dx = ballRef.current.position.x + 0.45;
            Dx = DxFirst;
          }
          else {
            if (gamesLog.current.delta < 0) {
              DxFirst = ballRef.current.position.x - 0.75;
            }
            else if (gamesLog.current.delta > 0) {
              DxFirst = ballRef.current.position.x + 0.75;
            }
            else {
              DxFirst = ballRef.current.position.x
            }
            Dx = ballRef.current.position.x;
          }
        }
      }

      let myendinho = denormalize(finalPoint, -1.72, 2.05);
      let finaly = 0;
      if (myendinho > -1.72 && myendinho < 2.05) {
        finaly = 0.93
      }
      let endPoint = new THREE.Vector3(DxFirst, finaly, myendinho);


      let controlPoint1 = new THREE.Vector3(startPoint.x + ((DxFirst - startPoint.x) * 0.33), Dy, (startPoint.z + endPoint.z) * 0.25);
      let controlPoint2 = new THREE.Vector3(startPoint.x + ((DxFirst - startPoint.x) * 0.66), Dy, (startPoint.z + endPoint.z) * 0.75);

      // if(myEnd.z> -1.72 && myEnd.z<2.05)
      // {

      //     endPoint = new THREE.Vector3(Dx,0.93,denormalize(finalPoint,-1.72,2.05));   
      // }          

      curve = new THREE.CubicBezierCurve3(startPoint, controlPoint1, controlPoint2, endPoint);

      // socketGame.emit('touch-ball',{userId: state.userId,players: state.info.players,value: false});

      gamesLog.current.Pointend = false;
      (async () => {
        let prev = gamesLog.current.whos;
        if (!gamesLog.current.whos || gamesLog.current.whos === 1) {
          // gamesLog.current.matchStart = false;

          gamesLog.current.SavePointDep = [startPoint.x, startPoint.y, startPoint.z];
          gamesLog.current.SaveC1 = [controlPoint1.x, controlPoint1.y, controlPoint1.z];
          gamesLog.current.SaveC2 = [controlPoint2.x, controlPoint2.y, controlPoint2.z];
          puissance = 1;
          await updateBallPosition(prev);
          if (prev === gamesLog.current.whos) {
            if (!stop) {
              if (prev === 1) {
                gamesLog.current.lastWon = 1;
                setStop(true);
              }
              else if (prev === 0) {
                gamesLog.current.lastWon = 0;

                setStop(true);

              }
            }
          }
          setBallTouched(false);
        }
        if (gamesLog.current.whos === 2 || gamesLog.current.whos === 3) {
          await reboundTable(gamesLog.current.Hit, Dy, DxFirst)
          setBallTouched(false);
        }
        if (gamesLog.current.whos === 4 || gamesLog.current.whos === 5) {
          await TouchTennis(gamesLog.current.Hit, Dy, DxFirst)
          setBallTouched(false);

        }



      })();
    }
    if (socketGame.current)
      socketGame.current.on('set-paddle-move', (position) => {
        if (position && position.paddlenumber && paddleRef_Opp.current) {
          paddleRef_Opp.current.position.x = position.x;
          paddleRef_Opp.current.position.y = position.y;
          paddleRef_Opp.current.position.z = position.z;
        }
        else if (position) {
          if (position && paddleRef.current) {
            paddleRef.current.position.x = position.x;
            paddleRef.current.position.y = position.y;
            paddleRef.current.position.z = position.z;
          }
        }
      })
    if (socketGame.current)
      socketGame.current.on('ball-move', async (position) => {
        if (position && ballRef.current) {

          const newPosition = new THREE.Vector3(); // Create a new instance of Vector3
          newPosition.set(position.x, position.y, position.z); //
          ballRef.current.position.copy(newPosition);

        }

      })
    if (socketGame.current)
      socketGame.current.on('whos', (message) => {
        gamesLog.current.whos = message.whos;
      })

    return () => {

    };
  }, [ballTouched, socketGame.current]);



  const tableMin = new THREE.Vector3(-1.40, 0.93, -1.72);
  const tableMax = new THREE.Vector3(1.35, 0.93, 2.05);

  const filetMin = new THREE.Vector3(-1.40, 0.94, 0.1650);
  const filetMax = new THREE.Vector3(1.35, 1.05, 0.1650);
  const framing = async (paddle, paddleR) => {
    if (!gamesLog.current.matchStart && !stop) {
      const ballBoundingBox = await new THREE.Box3().setFromObject(ballRef.current);
      setRotatePaddle((paddle.current.position.x * (-0.8)) / (-1.4));
      setRotatePaddleOpp((paddleR.current.position.x * (-0.8)) / (-1.4));

      let paddleBoundingBox = 0;
      let intersects = 0;
      let paddleBoundingBoxOpp = 0;
      let intersectsOpp = 0;

      paddleBoundingBox = await new THREE.Box3().setFromObject(paddle.current);
      intersects = await paddleBoundingBox.intersectsBox(ballBoundingBox);

      paddleBoundingBoxOpp = await new THREE.Box3().setFromObject(paddleR.current);
      intersectsOpp = await paddleBoundingBoxOpp.intersectsBox(ballBoundingBox);

      setRotatePaddleOpp((paddleR.current.position.x * (-0.8)) / (-1.4));
      const tableMin = new THREE.Vector3(-1.40, 0.93, -1.72); // Minimum coordinates
      const tableMax = new THREE.Vector3(1.35, 0.93, 2.05); // Maximum coordinates


      const filetBoundingBox = await new THREE.Box3(filetMin, filetMax);
      let intersects3 = await ballBoundingBox.intersectsBox(filetBoundingBox);
      // Create a custom box representing the table's boundaries
      const tableBoundingBox = await new THREE.Box3(tableMin, tableMax);
      let intersects2 = false
      if (gamesLog.current.whos !== 4 && gamesLog.current.whos !== 5) {
        intersects2 = await tableBoundingBox.intersectsBox(ballBoundingBox);
      }
      // if (intersects)
      //   gamesLog.current.whos = 1;
      // else if (intersectsOpp)
      //   gamesLog.current.whos = 0;
      // if (intersects2 && (gamesLog.current.whos === 1 || gamesLog.current.whos === 2)) {
      //   gamesLog.current.whos = 2;
      // }
      // else if (intersects2)
      //   gamesLog.current.whos = 3;
      // if (intersects3 && (gamesLog.current.whos === 1 || gamesLog.current.whos === 2 || gamesLog.current.whos === 4))
      //   gamesLog.current.whos = 4;
      // else if (intersects3)
      //   gamesLog.current.whos = 5;
      if (intersects3 && (gamesLog.current.whos === 1 || gamesLog.current.whos === 2 || gamesLog.current.whos === 4) && state.userId === state.info.players[0] && gamesLog.current.prevTouch !== 4) {
        if (socketGame.current)
          socketGame.current.emit('whos', { whos: 4, players: state.info.players, userId: state.userId });

        const newPosition = { ...ballRef.current.position };
        gamesLog.current.Hit = newPosition;
        gamesLog.current.whos = 4;
        setBallTouched(true);
        gamesLog.current.prevTouch = 4;
      }
      else if (intersects3 && (!gamesLog.current.whos || gamesLog.current.whos === 3 || gamesLog.current.whos === 5) && (state.userId === state.info.players[1] || state.info.players[1] === -1) && gamesLog.current.prevTouch !== 5) {
        if (socketGame.current)
          socketGame.current.emit('whos', { whos: 5, players: state.info.players, userId: state.userId });
        const newPosition = { ...ballRef.current.position };
        gamesLog.current.Hit = newPosition;
        gamesLog.current.whos = 5;

        setBallTouched(true);
        gamesLog.current.prevTouch = 5;
      }
      else if (intersects2 && (gamesLog.current.whos === 1 || gamesLog.current.whos === 2) && state.userId === state.info.players[0]) {
        if (socketGame.current)
          socketGame.current.emit('whos', { whos: 2, players: state.info.players, userId: state.userId });
        if (gamesLog.current.whos === 2 && gamesLog.current.prevTouch === 2)
          gamesLog.current.out = true;



        const newPosition = { ...ballRef.current.position };
        gamesLog.current.Hit = newPosition;
        gamesLog.current.whos = 2;
        setBallTouched(true);
        gamesLog.current.prevTouch = 2;
      }
      else if (intersects2 && (!gamesLog.current.whos || gamesLog.current.whos === 3) && (state.userId === state.info.players[1] || state.info.players[1] === -1)) {
        if (socketGame.current)
          socketGame.current.emit('whos', { whos: 3, players: state.info.players, userId: state.userId });
        if (gamesLog.current.whos === 3 && gamesLog.current.prevTouch === 3)
          gamesLog.current.out = true;


        const newPosition = { ...ballRef.current.position };
        gamesLog.current.Hit = newPosition;
        gamesLog.current.whos = 3;

        setBallTouched(true);
        gamesLog.current.prevTouch = 3;
      }
      else if ((intersects || intersectsOpp)) {

        if (intersects && state.userId === state.info.players[0]) {
          if (socketGame.current)
            socketGame.current.emit('whos', { whos: 1, players: state.info.players, userId: state.userId });
          const NewRotate = { ...RotatePaddle }
          gamesLog.current.Rotate = NewRotate;

          const NewSpeed = { ...paddleSpeed }
          gamesLog.current.PaddleSpeed = NewSpeed.current;
          const newPosition = { ...ballRef.current.position };
          gamesLog.current.Hit = newPosition;
          gamesLog.current.whos = 1;

          setBallTouched(true);
          gamesLog.current.prevTouch = 1;

        }
        else if (intersectsOpp && (state.userId === state.info.players[1] || state.info.players[1] === -1)) {
          if (socketGame.current)
            socketGame.current.emit('whos', { whos: 0, players: state.info.players, userId: state.userId });
          gamesLog.current.Rotate = RotatePaddleOpp;
          const NewSpeed = { ...paddleSpeedOpp }

          gamesLog.current.PaddleSpeed = NewSpeed.current;
          gamesLog.current.whos = 0;
          const newPosition = { ...ballRef.current.position };
          gamesLog.current.Hit = newPosition;

          setBallTouched(true);
          gamesLog.current.prevTouch = 0;


        }


      }
    }
  }
  useFrame(() => {

    LogicGame();



    if (paddleRef.current && paddleRef.current.position) {
      if (!ballTouched && gamesLog.current.Pointend) {
        gamesLog.current.startPoint.x = paddleRef.current.position.x;
        gamesLog.current.Pointend = false;
      }

    }





    framing(paddleRef, paddleRef_Opp);





  });


  return (

    <group {...props} dispose={null}>
      <group ref={ballRef} scale={[0.75, 0.75, 0.75]} position={gamesLog.current.Pointend ? [startPoint.x, startPoint.y, startPoint.z] : [-0.025, 1.05, 2.05]}>
        <mesh geometry={nodes.ppb__0.geometry} material={materials.ppb__0} />
      </group>


      <PaddleMove paddleRef={paddleRef} paddleSpeed={paddleSpeed} handleDeltaPaddleChange={handleDeltaPaddleChange} state={state} socketGame={socketGame.current}>
        <group ref={paddleRef} scale={[0.75, 0.75, 0.75]} position={[0, 1.50, 2]} rotation={[-Math.PI / 2.5, RotatePaddle, 0]}>
          <mesh geometry={nodes.raquette001_Cover002_0.geometry} material={materials['Cover.002']} />
          <mesh geometry={nodes.raquette001_Grip002_0.geometry} material={materials['Grip.002']} />
          <mesh geometry={nodes.raquette001_Handle002_0.geometry} material={new THREE.MeshBasicMaterial({ color: 0xC8102E })} />
          <mesh geometry={nodes.raquette001_Strap002_0.geometry} material={materials['Strap.002']} />
        </group>
      </PaddleMove>
      {state.info.players[1] === -1 ?
        <PaddleBot ballRef={ballRef} paddleRef_Opp={paddleRef_Opp} paddleSpeedOpp={paddleSpeedOpp} handleDeltaPaddleChange={handleDeltaPaddleChange} state={state} socketGame={socketGame.current}>
          <group ref={paddleRef_Opp} scale={[0.75, 0.75, 0.75]} position={[-0.025, 1.05, -1.72]} rotation={[-Math.PI / 2.5, RotatePaddleOpp, 0]}>
            <mesh geometry={nodes.raquette001_Cover002_0.geometry} material={materials['Cover.002']} />
            <mesh geometry={nodes.raquette001_Grip002_0.geometry} material={materials['Grip.002']} />
            <mesh geometry={nodes.raquette001_Handle002_0.geometry} material={new THREE.MeshBasicMaterial({ color: 0x1B449C })} />
            <mesh
  geometry={nodes.raquette001_Strap002_0.geometry}
  material={new THREE.MeshBasicMaterial({ color: 0x0000ff })} // Blue color
/>          </group>
        </PaddleBot>
        :
        <PaddleOppMove paddleRef_Opp={paddleRef_Opp} paddleSpeedOpp={paddleSpeedOpp} handleDeltaPaddleChange={handleDeltaPaddleChange} state={state} socketGame={socketGame.current}>
          <group ref={paddleRef_Opp} scale={[0.75, 0.75, 0.75]} position={[0, 1.50, -2.25]} rotation={[-Math.PI / 2.5, RotatePaddleOpp, 0]}>
            <mesh geometry={nodes.raquette001_Cover002_0.geometry} material={materials['Cover.002']} />
            <mesh geometry={nodes.raquette001_Grip002_0.geometry} material={materials['Grip.002']} />
            <mesh geometry={nodes.raquette001_Handle002_0.geometry} material={new THREE.MeshBasicMaterial({ color: 0x1B449C })} />
            <mesh geometry={nodes.raquette001_Strap002_0.geometry} material={materials['Strap.002']} />
          </group>
        </PaddleOppMove>}




    </group>
  );
}