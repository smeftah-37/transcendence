import React, { useRef ,useEffect, FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PaddleOppMoveProps {
  paddleRef_Opp: React.MutableRefObject<THREE.Mesh | undefined>;
  paddleSpeedOpp: React.MutableRefObject<number>;
  handleDeltaPaddleChange: (deltaX: number) => void;
  state: {
    userId: string;
    info: {
      players: string[];
    };
  };
  socketGame: any;
}

const PaddleOppMove: FC<PaddleOppMoveProps> = (props) => {
  const { paddleRef_Opp ,paddleSpeedOpp,handleDeltaPaddleChange ,state,socketGame} = props;
  const { camera } = useThree();
  
  if(state.userId === state.info.players[1])
  {
    camera.position.set(-0.025, 0.93 + 5, -1.72 - 10);
  }
  // State to store mouse position and previous position for speed calculation
  const mousePosition = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const prevMousePosition = useRef<{ x: number; z: number }>({ x: 0, z: 0 });


  // Function to update mouse position
  const handleMouseMove = (event: MouseEvent) => {
    // Normalize mouse coordinates
    const x = -((event.clientX / window.innerWidth) * 2 - 1);
    const z = (event.clientY / window.innerHeight) * 2;
    prevMousePosition.current = mousePosition.current;
    mousePosition.current = { x, z };
  };

  // Event listener for mouse move
  useEffect(() => {
    if(state.userId ===state.info.players[1])
    {
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  // Update function to move the mesh and calculate speed
  useFrame(() => {
    if(state.userId ===state.info.players[1])
    {
      // Convert mouse coordinates to world space
      const { x, z } = mousePosition.current;
      const mouseVector = new THREE.Vector3(x, -0.5, -z); // Invert z for movement

      const dir = mouseVector.sub(camera.position).normalize();
      const distance = -camera.position.y / dir.y; // Use Y component to control zoom
      const pos = camera.position.clone().add(dir.multiplyScalar(distance * 2)); // Multiply by a factor to increase Z movement

      // Update paddle position
      const value = pos.z *1.5;

      if(value <= (3.50 / 1.5) ) {
        paddleRef_Opp.current?.position.set(pos.x * 1.5, -0.5, value);
        if(socketGame)
          socketGame.emit('set-paddle-move',{x: pos.x * 1.5,y: -0.5,z: value,userId: state.userId,players: state.info.players,paddlenumber: 1});
      }

      // Calculate paddle speed based on mouse movement
      const deltaX = mousePosition.current.x - prevMousePosition.current.x;
      handleDeltaPaddleChange(deltaX);
      const deltaY = mousePosition.current.z - prevMousePosition.current.z;
      paddleSpeedOpp.current = Math.abs(deltaY)
    }
  });

  return <mesh {...props} ref={paddleRef_Opp} />;
};

export default PaddleOppMove;