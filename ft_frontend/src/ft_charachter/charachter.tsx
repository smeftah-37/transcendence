import React, { useEffect, useState, useRef } from 'react';
import './charachter.css';
import averroes from './assets/averroes.png';
import hypatia from './assets/hypatia.png';
import pythagore from './assets/pythagore.png';
import rafaello from './assets/rafaello.png';
import socrate from './assets/socrate.png';
import zeno from './assets/zeno.png';
import plato from './assets/plato.png';
import aristote from './assets/aristote.png';
import diogenes from './assets/diogenes.png';

import { useNavigate } from 'react-router-dom';
import { useSocket, useUser } from '../SocketContext.tsx';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const Charachter: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser, token,updateToken } = useUser();
    const sliderTrackRef = useRef<HTMLUListElement>(null);
    const [usernameAverroes, setUsernameAverroes] = useState<any>('');
    const [usernameZeno, setUsernameZeno] = useState<any>('');
    const [usernameHypatia, setUsernameHypatia] = useState<any>('');
    const [usernameDiogenes, setUsernameDiogenes] = useState<any>('');
    const [usernameAristote, setUsernameAristote] = useState<any>('');
    const [usernamePythagore, setUsernamePythagore] = useState<any>('');
    const [usernamePlato, setUsernamePlato] = useState<any>('');
    const [usernameRafaello, setUsernameRafaello] = useState<any>('');
    const [usernameSocrate, setUsernameSocrate] = useState<any>('');
    const [selectedSlide, setSelectedSlide] = useState<any | null>(null); // State to store the selected slide

    if(!user.current)
        user.current = updateUser(user.current);
    if(!token.current)
        token.current = updateToken(token.current);
    useEffect(() => {
        // Move the slider definition inside the useEffect hook
        const slider = document.querySelector("[data-slider]");
        if (!slider) return; // Check if slider exists

        const track = slider.querySelector("[data-slider-track]");
        const prev = slider.querySelector("[data-slider-prev]");
        const next = slider.querySelector("[data-slider-next]");

        const handlePrevClick = () => {
            next.removeAttribute("disabled");

            track.scrollTo({
                left: track.scrollLeft - track.firstElementChild.offsetWidth,
                behavior: "smooth"
            });
        };

        const handleNextClick = () => {
            prev.removeAttribute("disabled");

            track.scrollTo({
                left: track.scrollLeft + track.firstElementChild.offsetWidth,
                behavior: "smooth"
            });
        };

        const handleScroll = () => {
            const trackScrollWidth = track.scrollWidth;
            const trackOuterWidth = track.clientWidth;

            prev.removeAttribute("disabled");
            next.removeAttribute("disabled");

            if (track.scrollLeft <= 0) {
                prev.setAttribute("disabled", "");
            }

            if (track.scrollLeft === trackScrollWidth - trackOuterWidth) {
                next.setAttribute("disabled", "");
            }
        };

        if (track) {
            prev.addEventListener("click", handlePrevClick);
            next.addEventListener("click", handleNextClick);
            track.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (track) {
                prev.removeEventListener("click", handlePrevClick);
                next.removeEventListener("click", handleNextClick);
                track.removeEventListener("scroll", handleScroll);
            }
        };
    }, []);

    const handleInputChangeAverroes = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameAverroes(event.target.value.toLowerCase());
    };
    const handleInputChangeZeno = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameZeno(event.target.value.toLowerCase());
    };
    const handleInputChangeHypatia = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameHypatia(event.target.value.toLowerCase());
    };
    const handleInputChangeDiogenes = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameDiogenes(event.target.value.toLowerCase());
    };
    const handleInputChangeAristote = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameAristote(event.target.value.toLowerCase());
    };
    const handleInputChangePythagore = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernamePythagore(event.target.value.toLowerCase());
    };
    const handleInputChangePlato = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernamePlato(event.target.value.toLowerCase());
    };
    const handleInputChangeRafaello = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameRafaello(event.target.value.toLowerCase());
    };
    const handleInputChangeSocrate = (event: React.ChangeEvent<HTMLInputElement>) => {

        setUsernameSocrate(event.target.value.toLowerCase());
    };
    // Function to handle click on a slide
    const handleSlideClick = async (slideName: string, slideAvatar: string, slideUserName: string) => {
        try {
            const response = await fetch('http://10.13.1.10:3004/SchoolOfAthensApi/users/' + user.current.id + '/ChooseChar', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': token.current,// Specify the content type of the request body
                    // Add any other headers you need, such as authorization headers
                },
                body: JSON.stringify({
                    // Include the data you want to update in the request body
                    avatar: slideAvatar,
                    displayName: slideName,
                    userName: slideUserName, // Use the username from the state
                    // Add other fields as needed
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const data = await response.json();
            updateUser(data);
            // Set the selected slide based on the slide name
            setSelectedSlide(slideName);
            // Navigate to another component if data is successfully posted and username is valid
            navigate('../Home');
        } catch (error) {
            // Handle error from fetch or backend
            // If error message indicates username is taken, inform the user
            alert('Username is already taken');
            // You can also update the UI to provide feedback to the user

        }
    }

    useEffect(() => {
        // Add class to trigger animation when component mounts
        if (sliderTrackRef.current) {
            sliderTrackRef.current.classList.add('animate');
        }
    }, []);

    return (
        <div className="charachter">
            <div className="Char">
                <div className="slider" data-slider>
                    <div className="slider-title">
                        <div>
                            <p className="title-" data-text="Choose your character...">Choose your character...</p>
                        </div>
                    </div>

                    <ul className="slider__track" data-slider-track ref={sliderTrackRef}>
                        {/* Averroes */}
                        <li>
                            <div className="slide">
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/averroes`} className="slideimg" alt="Averroes" />
                                <div className="slide_content">
                                    <p>Averroes</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameAverroes}
                                        onChange={handleInputChangeAverroes}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("averroes", 'Averroes', usernameAverroes)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>
                        {/* Zeno */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/zeno`} className="slideimg" alt="Zeno" />
                                <div className="slide_content">
                                    <p>Zeno</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameZeno}
                                        onChange={handleInputChangeZeno}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("zeno", 'Zeno', usernameZeno)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>
                        {/* Hypatia */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/hypatia`} className="slideimg" alt="Hypatia" />
                                <div className="slide_content">
                                    <p>Hypatia</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameHypatia}
                                        onChange={handleInputChangeHypatia}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("hypatia", 'Hypatia', usernameHypatia)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>

                        {/* Diogenes */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/diogenes`} className="slideimg" alt="Diogenes" />
                                <div className="slide_content">
                                    <p>Diogenes</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameDiogenes}
                                        onChange={handleInputChangeDiogenes}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("diogenes", 'Diogenes', usernameDiogenes)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>

                        {/* Aristote */}
                        <li>
                            <div className="slide">
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/aristote`} className="slideimg" alt="Aristote" />
                                <div className="slide_content">
                                    <p>Aristote</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameAristote}
                                        onChange={handleInputChangeAristote}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("aristote", 'Aristote', usernameAristote)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>

                        {/* Pythagore */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/pythagore`} className="slideimg" alt="Pythagore" />
                                <div className="slide_content">
                                    <p>Pythagore</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernamePythagore}
                                        onChange={handleInputChangePythagore}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("pythagore", 'Pythagore', usernamePythagore)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>

                        {/* Plato */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/plato`} className="slideimg" alt="Plato" />
                                <div className="slide_content">
                                    <p>Plato</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernamePlato}
                                        onChange={handleInputChangePlato}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("plato", 'Plato', usernamePlato)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>

                        {/* Rafaello */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/rafaello`} className="slideimg" alt="Rafaello" />
                                <div className="slide_content">
                                    <p>Rafaello</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameRafaello}
                                        onChange={handleInputChangeRafaello}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("rafaello", 'Rafaello', usernameRafaello)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>

                        {/* Socrate */}
                        <li>
                            <div className="slide" >
                                <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/C/socrate`} className="slideimg" alt="Socrate" />
                                <div className="slide_content">
                                    <p>Socrate</p>
                                </div>
                            </div>

                            <div className="c-formContainer">
                                <form className="c-form" action="">
                                    <input
                                        className="c-form__input"
                                        placeholder="Username"
                                        type="Name"
                                        required
                                        value={usernameSocrate}
                                        onChange={handleInputChangeSocrate}
                                    />
                                    <label className="c-form__buttonLabel" htmlFor="checkbox">
                                        <button className="c-form__button" type="button" onClick={() => handleSlideClick("socrate", 'Socrate', usernameSocrate)}>Go!</button>
                                    </label>
                                </form>
                            </div>
                        </li>
                    </ul>
                    <div className="slider__buttons">
                        <div className='rightinho'>
                            <button className="slider__button" data-slider-prev>
                                <FontAwesomeIcon icon={faArrowRight} />
                            </button></div>
                        <div className='leftinho'>
                            <button className="slider__button" data-slider-next>
                                <FontAwesomeIcon icon={faArrowLeft} />
                            </button></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Charachter;