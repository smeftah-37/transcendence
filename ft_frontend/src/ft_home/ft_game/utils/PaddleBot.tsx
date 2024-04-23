import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PaddleBotProps {
  paddleRef_Opp: React.RefObject<THREE.Mesh>;
  paddleSpeedOpp: React.MutableRefObject<number>;
  handleDeltaPaddleChange: () => void;
  state: {
    userId: string;
    info: {
      players: string[];
    };
  };
  socketGame: any;
  ballRef: React.RefObject<THREE.Mesh>;
  gameslog: any;
}

const PaddleBot: React.FC<PaddleBotProps> = (props) => {
  const { paddleRef_Opp, paddleSpeedOpp, handleDeltaPaddleChange, state, socketGame, ballRef, gameslog } = props;

  useEffect(() => {
    const followBall = () => {
      if (state.userId === state.info.players[1] && ballRef.current) {
        const ballPosition = ballRef.current.position;

        const minX = -1.4;
        const maxX = 1.35;
        const minZ = -1.72;
        const maxZ = 0.165;

        if (ballPosition.z < maxZ && ballPosition.z > minZ) {
          const newX = THREE.MathUtils.clamp(ballPosition.x, minX, maxX);
          const newZ = THREE.MathUtils.clamp(ballPosition.z, minZ, maxZ);

          paddleRef_Opp.current.position.set(newX, 1.05, newZ);
          paddleSpeedOpp.current = 0.02;
        }
      }
    };

    followBall();

    return () => {

    };
  }, [ballRef.current, state]);

  useFrame(() => {
    if (ballRef.current) {
      const ballPosition = ballRef.current.position;
      const paddlePosition = paddleRef_Opp.current.position;

      const deltaX = ballPosition.x - paddlePosition.x;
      const deltaZ = Math.abs(ballPosition.z - paddlePosition.z);

      if (ballPosition.z < 0.165 && ballPosition.z > -1.90) {
        paddleRef_Opp.current.position.x += deltaX * 0.8;
        paddleRef_Opp.current.position.z += deltaZ * 0.01;
      } else if (ballPosition.z > 0.165) {
        paddleRef_Opp.current.position.z = 0.165;
      } else if (ballPosition.z < -1.90) {
        paddleRef_Opp.current.position.x = -0.025;
        paddleRef_Opp.current.position.z = -2.05;
        paddleRef_Opp.current.position.y = 1.35;
      }
    }
  });

  return <mesh {...props} ref={paddleRef_Opp} />;
};

export default PaddleBot;