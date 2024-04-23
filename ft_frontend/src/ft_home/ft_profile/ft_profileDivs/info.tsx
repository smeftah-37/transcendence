import React, { FC } from 'react';
import './info.css';
import Crown from '../assets/crown.png';
import RadarChart from './utils/radar';
import './utils/radar.css';

const Info: FC = () => {
    return (
        <>
        <div className="AllProfile">
            <div className="profile_">
                <img src={'https://cdn.intra.42.fr/users/d6a36e6dd8a5213183fe2d27c87bf099/kremidi.JPG'} />        
                <p className='PlayerName'>Kremidi</p>
                <p className='Rank'>Rank : 100</p>
            </div>
            <div>
                <hr className="vertical-line"/>
            </div>
            <div className="AllExtraProfile">
                <div className="ExtraProfile">
                <img  src={Crown} /> 
                <p className="Alliance">The Titans</p>
                <p className='Q1'>- Controversial</p>
                <p className='Q2'>- Influential</p>
                <p className='Q3'>- Inspiring</p>
                </div>  
            </div>
            <div>
                <hr className="vertical-line1"/>
            </div>
            <div className="Radar"><RadarChart data={Data}/>
            </div>
        </div>
        
        </>
    );
};

export default Info;