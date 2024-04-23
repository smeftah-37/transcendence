import React, { useEffect, useState } from 'react';
import './UserInformation.css';
import { useSocket, useSocketGame, useUser } from '../SocketContext.tsx';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface UserInformationProps {}

const UserInformation: React.FC<UserInformationProps> = () => {
    const { user, token } = useUser();
    const [Invitation, setInvitation] = useState<any[]>([]);
    const [GameInvitation, setGameInvitation] = useState<any[]>([]);
    const { socket,updateSocket } = useSocket();
    const { socketGame, updateSocketGame } = useSocketGame();

    const handleInvitationBar = (sender: any) => {
        const footer = document.getElementById('Footer');
        if (footer) {
            footer.style.background = 'red';
        }
        setTimeout(() => {
            if (footer) {
                footer.style.display = 'none';
            }
        }, 3000)
    }
    if(!socket.current)
        socket.current = updateSocket(socket.current);
    useEffect(() => {
            const fetchData = async () => {

            const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/getInvitationThanUser', {

                headers: {
                    'authorization': token.current,// Specify the content type of the request body

                }
            });


            if (!response.ok) {
                throw new Error('Failed to patch resource');
            }
            const data = await response.json();
            setInvitation(data);
        console.log('friendInvitiation',Invitation);

        }
        fetchData();

        socket.current.on('change-Inv', () => {
            fetchData();
        })

        socket.current.on('invitation', () => {
            fetchData();
        })

        return () => {
            socket.current.off('invitation');
            socket.current.off('change-Inv');

        };
    }, [socket.current]);

    const handleInv = (userIn: any, status: boolean) => {
        socket.current.emit('status-inv', { userId: user.current.id, friendId: userIn.id, status });
    }

    const handleGame = (userIn: any, status: boolean) => {
        socket.current.emit('status-Game', { userId: user.current.id, friendId: userIn.id, status });
    }

    useEffect(() => {
        const fetchData = async () => {

            const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/getInvitationPlay', {

                headers: {
                    'authorization': token.current,// Specify the content type of the request body

                }
            });

            if (!response.ok) {
                throw new Error('Failed to patch resource');
            }
            const data = await response.json();
            setGameInvitation(data);
        console.log('gameInvitiation',GameInvitation);

        }
        fetchData();

        socket.current.on('change-Game', () => {

            fetchData();
        })
        socket.current.on('invitation-game', (sender: any) => {
            socket.current.emit('invitation-bar', { userId: sender.id });

            fetchData();
        })
        return () => {
            socket.current.off("change-Game");


        }
    }, [socket.current]);

    return (
        <div className="User-notification">
            <div className="friendship">
                <h3>Friendship Invitations</h3>
                <div className='box'>
                    {Invitation ? Invitation.map((userIn) => {
                        return (
                            <div className='list'>
                                <li className='Userfriend-'>
                                    <div className='imgBx'><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${userIn.id}`} /></div>
                                    <div className='holly'>{userIn.username}</div>
                                    <FontAwesomeIcon icon={faCircleCheck} onClick={() => handleInv(userIn, true)} />
                                    <FontAwesomeIcon icon={faTimes} onClick={() => handleInv(userIn, false)} />
                                </li>
                            </div>
                        )
                    }) : <></>}
                </div>
            </div>
            <div className="Gaming">
                <h3>Game Invitations</h3>
                <div className='box'>
                    {GameInvitation ? GameInvitation.map((userIn) => {
                        return (
                            <div className='list'>
                                <li className='Userfriend-'>
                                    <div className='imgBx'><img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${userIn.id}`} /></div>
                                    <div className='holly'>{userIn.username}</div>
                                    <FontAwesomeIcon icon={faCircleCheck} onClick={() => handleGame(userIn, true)} />
                                    <FontAwesomeIcon icon={faTimes} onClick={() => handleGame(userIn, false)} />
                                </li>
                            </div>
                        )
                    }) : <></>}
                </div>
            </div>
        </div>
    );
}

export default UserInformation;