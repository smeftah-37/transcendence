import React, { FC, useState, useEffect } from "react";
import './CreateChannel.css'
import { useLocation, useHistory } from "react-router-dom";
import image from '../../Navbar/Hypatia.png'
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ElementMsg from '../../Messages/ElementMsg/ElementMsg'
import io from 'socket.io-client';
import { useSocket, useUser } from "../../SocketContext.tsx";

interface ProtectedChannelProps {
    name: string;
    img: string;
    user: {
        current: {
            username: string;
        };
    };
    type: string;
    desc: string;
    password: string;
}

const ProtectedChannel: FC<ProtectedChannelProps> = (props) => {
    const [data, setData] = useState<null | any>(null);
    const [error, setError] = useState<null | string>(null);
    const { name, img, user, type, desc, password } = props;
    const { socket,updateSocket } = useSocket();
    const { token } = useUser();

    if(!socket.current)
        socket.current = updateSocket();
    useEffect(() => {
        const fetchData = async () => {
            const url = 'http://10.13.1.10:3004/SchoolOfAthensApi/rooms';

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': token.current,
                    },
                    body: JSON.stringify({
                        roomName: name,
                        type: type,
                        password: password,
                        avatar: '',
                        admin: [user.current],
                        users: [user.current],
                        description: desc,
                        conversation: {
                            type: 'room',
                            chat: [
                                {
                                    timeSent: new Date().toISOString(),
                                    message: 'Created By ' + user.current.username,
                                    sender: user.current,
                                }
                            ]
                        }
                    }),
                });
                const result = await response.json();
                socket.current.emit('create-room', { socketId: socket.current.id });
            } catch (error) {
                setError(error.message);
            }
        };

        fetchData();
        return () => {
            socket.current.off('create-room');
        }
    }, []);

    return (
        <div>
            {/* <h1><ElementMsg name={name} img={img} user={user}/></h1> */}
        </div>
    )
}

interface CreateChannelProps {}

const CreateChannel: FC<CreateChannelProps> = (props) => {
    const location = useLocation();
    const { user } = useUser();
    const [showForm, setShowForm] = useState<boolean>(true);
    const [inputValue, setValues] = useState<{ name: string; img: string; desc: string; type: string; password: string }>({ name: '', img: '', desc: '', type: '', password: '' });
    const [file, setFile] = useState<null | string>(null);
    const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);

    const toggleContent = () => {
        setShowForm(!showForm);
    }

    const ChangeElement = (event: React.ChangeEvent<HTMLInputElement>) => {
        const chosedfile = event.target.files[0];
        if (chosedfile) {
            const reader = new FileReader();
            reader.addEventListener('load', function () {
                const imageElement = document.getElementById('photo');
                if (imageElement)
                    imageElement.setAttribute('src', reader.result as string);
                setFile(reader.result as string);
            })
            reader.readAsDataURL(chosedfile);
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>, channelType: string) => {
        e.preventDefault();
        const newDataRow = {
            name: inputValue.name,
            desc: inputValue.desc,
            type: inputValue.type,
            password: inputValue.password,
        };
        setValues(newDataRow);
        setShowPasswordInput(false);
        toggleContent();
    };

    return (
        <div className="body">
            {showForm ? (
                <div className="box-chat">
                    <span className="borderLine"></span>
                    <form onSubmit={handleSubmit}>
                        <h1>{user.current.username}</h1>
                        <div className="kamal-kitkhibra">
                            <div id="hello" className="user-image">
                                <input type="file" id="file" onChange={ChangeElement} />
                                <img src={image} id="photo" />
                                <label htmlFor="file" id="uploadbtn">
                                    <FontAwesomeIcon icon={faCamera} className="fa-camera" />
                                </label>
                            </div>
                            <div>
                                <div className="inputBox">
                                    <input
                                        type="text"
                                        value={inputValue.name}
                                        onChange={(e) => setValues({ ...inputValue, name: e.target.value })}
                                        required
                                    />
                                    <span>Name Of The Room</span>
                                    <li></li>
                                </div>
                                <div className="inputBox">
                                    <input
                                        type="text"
                                        value={inputValue.desc}
                                        onChange={(e) => setValues({ ...inputValue, desc: e.target.value })}
                                        required
                                    />
                                    <span>Description</span>
                                    <li></li>
                                </div>
                                {showPasswordInput && (
                                    <div className="inputBox">
                                        <input
                                            type="password"
                                            value={inputValue.password}
                                            onChange={(e) => setValues({ ...inputValue, password: e.target.value })}
                                            onClick={(e) => {
                                                e.preventDefault();
                                            }}
                                            required
                                        />
                                        <span>Password of the Room</span>
                                        <li></li>
                                    </div>
                                )}
                            </div>
                        </div>
                        <br />
                        <br />
                        <div className="kikia-chat">
                            <div className="span-div">
                                <input
                                    type="submit"
                                    value={"protected"}
                                    onClick={() => {
                                        setShowPasswordInput(true);
                                        setValues({ ...inputValue, type: "protected" });
                                    }}
                                />
                            </div>
                            <div className="span-div">
                                <input type="submit" value={"Public"} onClick={() => setValues({ ...inputValue, type: "public" })} />
                            </div>
                            <div className="span-div">
                                <input type="submit" value={"Private"} onClick={() => setValues({ ...inputValue, type: "private" })} />
                            </div>
                        </div>
                    </form>
                </div>
            ) : <ProtectedChannel name={inputValue.name} img={file} user={user} type={inputValue.type} desc={inputValue.desc} password={inputValue.password} />}
        </div>
    )
}

export default CreateChannel;