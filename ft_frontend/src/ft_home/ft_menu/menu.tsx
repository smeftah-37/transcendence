import React, { FC, useEffect, useState } from 'react';
import './menu.css';
import { Route, Link, Routes } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import Profile from '../ft_profile/profile';
import logos from '../ft_game/assets/LOGO.png';
interface Position {
  x: number;
  y: number;
}

const ScrollingNav: FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.querySelector('nav');

      if (window.scrollY > 80) {
        nav.style.backgroundColor = 'var(--black)';
      } else {
        nav.style.backgroundColor = 'transparent';
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return null; // Since this component doesn't render anything visible
};

const CustomCursor: FC = () => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [expand, setExpand] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.pageX, y: e.pageY });
    };

    const handleClick = () => {
      setExpand(true);

      setTimeout(() => {
        setExpand(false);
      }, 500);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      className={`cursor ${expand ? 'cursor--expand' : ''}`}
      style={{ top: `${position.y - 25}px`, left: `${position.x - 25}px` }}
    />
  );
};

const Menu: FC = () => {
  function activeLink(linkActive: HTMLAnchorElement) {
    const links = document.querySelectorAll('.navbar__link');
    links.forEach((link) => {
      link.classList.remove('active');
      link.classList.remove('nav__light');

      linkActive.classList.add('active');
      linkActive.classList.add('nav__light');
    });
  }

  useEffect(() => {
    const links = document.querySelectorAll('.navbar__link');
    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        activeLink(link);
      });
    });
    const handleMenuClick = () => {
      const menu = document.querySelector('.nav_content');
      const overlay = document.querySelector('.overlay');
      if (window.innerWidth <= 920) {
        menu.style.right = '0px';
        overlay.style.opacity = '1';
        overlay.style.zIndex = '1';
      }
    };

    const handleCloseClick = () => {
      const menu = document.querySelector('.nav_content');
      const overlay = document.querySelector('.overlay');
      if (window.innerWidth <= 920) {
        menu.style.right = '-400px';
        overlay.style.opacity = '0';
        overlay.style.zIndex = '-1';
      }
    };

    const overlayClickHandler = () => {
      handleCloseClick();
    };
    const handleResize = () =>
    {
      if (window.innerWidth > 920) {
        const menu = document.querySelector('.nav_content');
        const overlay = document.querySelector('.overlay');
       
          menu.style.right = '0px';
          overlay.style.opacity = '0';
          overlay.style.zIndex = '0';

      }

    }
    const hamButton = document.querySelector('.ham');
    // const closeButton = document.querySelector('.close');
    const overlay = document.querySelector('.overlay');
    // if (window.innerWidth <= 920) {
    //   hamButton.addEventListener('click', handleMenuClick);
    //   overlay.addEventListener('click', overlayClickHandler);
    // }
    // closeButton.addEventListener('click', handleCloseClick);

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        activeLink(link);
      });
    });
    window.addEventListener('resize', handleResize);

    return () => {
     // const hamButton = document.querySelector('.ham');
      // const closeButton = document.querySelector('.close');
   //   const overlay = document.querySelector('.overlay');
    
    };
  }, []);
  const handleClick = () =>
  {
    if (window.innerWidth <= 920) {
      const menu = document.querySelector('.nav_content');
      const overlay = document.querySelector('.overlay');
      if (window.innerWidth <= 920) {
        menu.style.right = '0px';
        overlay.style.opacity = '1';
        overlay.style.zIndex = '1';
      }
    }
  }
  const handleClickOverlay = () =>
  {
    const menu = document.querySelector('.nav_content');
    const overlay = document.querySelector('.overlay');
    if (window.innerWidth <= 920) {
      menu.style.right = '-400px';
      overlay.style.opacity = '0';
      overlay.style.zIndex = '-1';
    }
    

  }
  return (
    <>
      <CustomCursor /> {/* Include the CustomCursor component */}
      <ScrollingNav />            

      <div className="menu-">
        <nav>      <section className="flex_content">
          </section>
          <section className="flex_content nav_content" id="nav_content">
            <Link to={'profile'} className="navbar__link" style={{ textDecoration: 'none' }}>
              <span>Profile</span>
            </Link>

            <Link to={'DataAnalysis'} className="navbar__link" style={{ textDecoration: 'none' }}>
              <span>Data Analysis</span>
            </Link>

            <Link to={'chat'} className="navbar__link" style={{ textDecoration: 'none' }}>
              <span>Chat</span>
            </Link>

            <Link to={'Settings'} className="navbar__link" style={{ textDecoration: 'none' }}>
              <span>Settings</span>
            </Link>
          
          </section>
          <section className="flex_content">
            <Link href="javascript:void(0)" className="ham"  onClick={() => {handleClick()}}>
              <i className="fa fa-bars"></i>
              <img src={logos}></img>
            </Link>
          </section>
        </nav>

        <div className="overlay" onClick={() => {handleClickOverlay()}}></div>
      </div>
    </>
  );
};

export default Menu;