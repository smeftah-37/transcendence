import React, { useEffect, useRef, FC } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface PaddleMoveProps {
  paddleRef: React.MutableRefObject<THREE.Mesh | undefined>;
  paddleSpeed: React.MutableRefObject<number>;
  handleDeltaPaddleChange: (deltaX: number) => void;
  state: {
    userId: string;
    info: {
      players: string[];
    };
  };
  socketGame: any;
}

const PaddleMove: FC<PaddleMoveProps> = (props) => {
  const { paddleRef, paddleSpeed, handleDeltaPaddleChange, state, socketGame } = props;

  const { camera } = useThree();

  if (state.userId === state.info.players[0]) {
    camera.position.set(-0.025, 0.93 + 5, 2.05 + 10);
  }

  const mousePosition = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const prevMousePosition = useRef<{ x: number; z: number }>({ x: 0, z: 0 });

  const handleMouseMove = (event: MouseEvent) => {
    const x = (event.clientX / window.innerWidth) * 1.8 - 1;
    const z = -(event.clientY / window.innerHeight) * 1.8;
    prevMousePosition.current = mousePosition.current;
    mousePosition.current = { x, z };
  };

  useEffect(() => {
    if (state.userId === state.info.players[0]) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  useFrame(() => {
    if (state.userId === state.info.players[0]) {
      const { x, z } = mousePosition.current;
      const mouseVector = new THREE.Vector3(x, -0.5, -z);

      const dir = mouseVector.sub(camera.position).normalize();
      const distance = -camera.position.y / dir.y;
      const pos = camera.position.clone().add(dir.multiplyScalar(distance * 2));

      const value = pos.z * 1.5;

      if (value >= -1.75) {
        paddleRef.current?.position.set(pos.x * 1.5, -0.5, value);
        if (socketGame)
          socketGame.emit('set-paddle-move', {
            x: pos.x * 1.5,
            y: -0.5,
            z: value,
            userId: state.userId,
            players: state.info.players,
            paddlenumber: 0,
          });
      }

      const deltaX = mousePosition.current.x - prevMousePosition.current.x;
      handleDeltaPaddleChange(deltaX);
      const deltaY = mousePosition.current.z - prevMousePosition.current.z;
      const speed = Math.sqrt(deltaX ** 2 + deltaY ** 2);
      paddleSpeed.current = Math.abs(deltaY);
    }
  });

  return <mesh {...props} ref={paddleRef} />;
};

export default PaddleMove;