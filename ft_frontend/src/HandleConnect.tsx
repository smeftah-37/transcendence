import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface HandleConnectProps {
}

const HandleConnect: React.FC<HandleConnectProps> = () => {
    return (
        <>
           <h2> You are connected in another window :) </h2> </>
    )
}

export default HandleConnect;