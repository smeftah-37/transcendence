import React, { useEffect, useState } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import './intro.css'; // Import your CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import image1 from './assets/1.jpg';
import image2 from './assets/2.jpg';
import image3 from './assets/3.jpg';
import image4 from './assets/4.jpg';
import image5 from './assets/5.jpg';
import image6 from './assets/6.jpg';
import image7 from './assets/7.jpg';
import image8 from './assets/8.jpg';
import image9 from './assets/9.jpg';
import image10 from './assets/10.jpg';
import image11 from './assets/11.jpg';

interface TypewriterProps {
  text: string;
  delay: number;
}

const Typewriter: React.FC<TypewriterProps> = ({ text, delay }) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [displayText, setDisplayText] = useState<string>('');

  useEffect(() => {
    setLines(text.split('\n'));
  }, [text]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentLineIndex < lines.length) {
        const currentLine = lines[currentLineIndex];
        if (currentCharIndex < currentLine.length) {
          setDisplayText(prevText => prevText + currentLine[currentCharIndex]);
          setCurrentCharIndex(prevIndex => prevIndex + 1);
        } else {
          setTimeout(() => {
            setDisplayText(''); // Clear the display text for a new paragraph
            setCurrentCharIndex(0);
            setCurrentLineIndex(prevIndex => prevIndex + 1);
          }, delay); // Delay before moving to next line
        }
      } else {
        clearInterval(interval);
      }
    }, delay + 40);

    return () => clearInterval(interval);
  }, [delay, currentCharIndex, currentLineIndex, lines]);

  return <span>{displayText}</span>;
};

const MoveTonextcomponent: React.FC = () => {
  const navigate = useNavigate();
  const [showSun, setShowSun] = useState<boolean>(false);

  useEffect(() => {
    // Wait for 5 seconds before showing the sun
    const timeout = setTimeout(() => {
      setShowSun(true);
    }, 2000); // 5000 milliseconds (5 seconds)

    // Clean up the timeout to avoid memory leaks
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // After showing the sun for 10 seconds, navigate to the specified route
    if (showSun) {
      const timeout = setTimeout(() => {
        navigate('/auth');
      }, 2000); // 10000 milliseconds (10 seconds)

      // Clean up the timeout to avoid memory leaks
      return () => clearTimeout(timeout);
    }
  }, [navigate, showSun]);

  return (
    <div>
      {showSun}
      {/* <div className='_cloud'>
        <img src={cloud1} className = "_cloud1" alt =""/>
        <img src={cloud2} className = "_cloud2" alt =""/>
        <img src={cloud3}  className = "_cloud3" alt =""/>
        <img src={cloud1} className = "_cloud4" alt =""/>
        <img src={cloud2} className = "_cloud5" alt =""/>
        <img src={cloud3} className = "_cloud6" alt =""/>
        
        </div> */}
    </div>
  );
};

const Intro: React.FC = () => {
  const [bgNum, setBgNum] = useState<number>(1); // State to manage the current background image number

  // Preload all the images before the component mounts
  useEffect(() => {
    preloadImages([
      image1,
      image2,
      image3,
      image4,
      image5,
      image6,
      image7,
      image8,
      image9,
      image10,
      image11
    ]);
  }, []);

  // Preload images function
  const preloadImages = (urls: string[]): void => {
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setBgNum((prevBgNum) => (prevBgNum % 11) + 1);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className='Index'>
        <div
          id='bg'
          style={{ backgroundImage: `url(${getBackgroundImageUrl(bgNum)})` }}
        ></div>
        {/* <div className="Marvel"><p className='introh1'>School Of Athens</p></div> */}
        <div className='Article'>
          <div className='content'>
            <br />

            <MoveTonextcomponent />
            {/* <div className='aboutus' >
  <div className='kremidi'><a href="https://42.intra.fr" style={{textDecoration: "none"}}>      <FontAwesomeIcon icon={faLinkedin} style={{textDecoration: "none"}} />kRemidi</a></div>
          <div className='smeftah-'><a href="https://42.intra.fr" style={{textDecoration: "none"}} >      <FontAwesomeIcon icon={faLinkedin} style={{textDecoration: "none"}} />sMeftah-</a></div>
          <div className='yoalaoui'><a href="https://42.intra.fr" style={{textDecoration: "none"}}>      <FontAwesomeIcon icon={faLinkedin} style={{textDecoration: "none"}} />yoAlaoui</a>
          </div></div> */}
          </div>
        </div>
      </div>
    </>
  );
};

// Function to get the background image URL based on the image number
const getBackgroundImageUrl = (bgNum: number): string | null => {
  switch (bgNum) {
    case 1:
      return image1;
    case 2:
      return image2;
    case 3:
      return image3;
    case 4:
      return image4;
    case 5:
      return image5;
    case 6:
      return image6;
    case 7:
      return image7;
    case 8:
      return image8;
    case 9:
      return image9;
    case 10:
      return image10;
    case 11:
      return image11;

    default:
      return null;
  }
};

export default Intro;