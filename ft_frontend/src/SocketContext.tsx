import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

interface User {
  id: number;
}

interface SocketGameContextProps {
  socketGame: React.MutableRefObject<any>;
  updateSocketGame: () => any;
}

const SocketGameContext = createContext<SocketGameContextProps | undefined>(undefined);

export const useSocketGame = () => useContext(SocketGameContext);

interface SocketGameProviderProps {
  children: ReactNode;
}

export const SocketGameProvider: React.FC<SocketGameProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const socketGame = useRef<any>(null);
  const { token, updateToken, user, updateUser } = useUser();
  useEffect(() => {
    if (socketGame.current)
      socketGame.current.on('connected-before', () => {
        navigate('/HandleConnect');
      })
  })

  const initializeSocket = () => {
    if (!user.current) {
      const userData = localStorage.getItem('userData');
      user.current = JSON.parse(userData!);
      updateUser(user.current);
    }
    if (!token.current)
      token.current = updateToken(null);
    if (user.current && user.current.id && user.current.id !== -1) {
      const newSocket = io('http://10.13.1.10:3004', {
        path: '/kikigame', query: {
          token: token.current,
          userId: user.current.id,
        }
      });

      socketGame.current = newSocket;
      return newSocket;

    }

    return socketGame.current;
  };

  const updateSocketGame = () => {
    return initializeSocket();
  };

  return (
    <SocketGameContext.Provider value={{ socketGame, updateSocketGame }}>
      {children}
    </SocketGameContext.Provider>
  );
};

interface SocketContextProps {
  socket: React.MutableRefObject<any>;
  updateSocket: () => any;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const socket = useRef<any>(null);
  const { token, updateToken, user, updateUser } = useUser();
  useEffect(() => {
    if (socket.current)
      socket.current.on('connected-before', () => {
        navigate('/HandleConnect');
      })
  })

  const initializeSocket = () => {
    if (!socket.current) {
      if (!user.current) {
        const userData = localStorage.getItem('userData');
        user.current = JSON.parse(userData!);
        updateUser(user.current);
      }
      if (!token.current)
        token.current = updateToken(null);
      if (user.current && user.current.id && user.current.id !== -1) {
        const newSocket = io('http://10.13.1.10:3004', {
          path: '/websocket', query: {
            token: token.current,
            userId: user.current.id,
          }
        });

        socket.current = newSocket;
        return newSocket;
      }
    }

    return socket.current;
  };

  const updateSocket = () => {
    if (!socket.current) {
      return initializeSocket();
    }
  };

  return (
    <SocketContext.Provider value={{ socket, updateSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

interface UserContextProps {
  user: React.MutableRefObject<User | null>;
  updateUser: (newUser: User | null) => User | null;
  token: React.MutableRefObject<string>;
  updateToken: (newToken: string | null) => string | null;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const user = useRef<User | null>(null);
  const token = useRef<string>('');
  const updateUser = (newUser: User | null) => {
    if (!newUser && !user.current) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        user.current = JSON.parse(userData);
      }

    }
    else {
      localStorage.setItem('userData', JSON.stringify(newUser));
      user.current = newUser;
    }
    return user.current;
  };
  const updateToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('token', JSON.stringify(newToken));

      token.current = newToken;
    }
    else {
      const tokenData = localStorage.getItem('token');
      if (tokenData)
        token.current = JSON.parse(tokenData);
    }
    return token.current;

  }
  return (
    <UserContext.Provider value={{ user, updateUser, token, updateToken }}>
      {children}
    </UserContext.Provider>
  );
};

interface OtherStateContextProps {
  rooms: any[];
  updateRooms: (newRooms: any[]) => void;
  roomsNotBelong: any[];
  updateRoomsNotBelong: (newRoomsNot: any[]) => void;
  conversation: any[];
  updateConversation: (newConv: any[]) => void;
  updateRoomById: (roomId: number, updatedRoom: any) => void;
  updateConvById: (convId: number, updatedConv: any) => void;
}

const OtherStateContext = createContext<OtherStateContextProps | undefined>(undefined);

export const useOtherState = () => useContext(OtherStateContext);

interface OtherStateProviderProps {
  children: ReactNode;
}

export const OtherStateProvider: React.FC<OtherStateProviderProps> = ({ children }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [roomsNotBelong, setRoomsNotBelong] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any[]>([]);

  const updateRooms = (newRooms: any[]) => {
    setRooms(newRooms);
  };
  const updateRoomsNotBelong = (newRoomsNot: any[]) => {
    setRoomsNotBelong(newRoomsNot);
  };
  const updateRoomById = (roomId: number, updatedRoom: any) => {
    setRooms(prevRooms => prevRooms.map(room => {
      if (room.id === roomId) {
        return { ...room, ...updatedRoom };
      }
      return room;
    }));
  };
  const updateConversation = (newConv: any[]) => {
    setConversation(newConv);
  };
  const updateConvById = (convId: number, updatedConv: any) => {
    setConversation(prevCosetConversation => prevCosetConversation.map(conv => {
      if (conv.id === convId) {
        return { ...conv, ...updatedConv };
      }
      return conv;
    }));
  };

  return (
    <OtherStateContext.Provider value={{ rooms, updateRooms, roomsNotBelong, updateRoomsNotBelong, updateRoomById, conversation, updateConversation, updateConvById }}>
      {children}
    </OtherStateContext.Provider>
  );
};

interface AuthContextProps {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => setIsAuthenticated(true);
  const logout = () => setIsAuthenticated(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);