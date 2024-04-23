import React, { FC } from 'react';
import './moreplay.css';
import './utils/buttonPlay.css';

const MorePlay: FC = () => {
    return (
        <>
        <div className="AllPlay">
            <div className="Attributes">
                <div className="Technical">
                    <h3>Technical</h3>
                    <p>Serve Power: </p>
                    <p>Returns : </p>
                    <p>Hotshots : </p>
                </div>
                <div className="Physical">
                    
                    <h3>Physical</h3>
                    <p>Stamina : </p>
                    <p>Reflexes : </p>
                    <p>Speed : </p>
                </div>
                <div className="Mental">
                    <h3>Mental</h3>
                    <p>Focus: </p>
                    <p>Fighting Spirit: </p>
                    <p>Killer Instinct : </p>
                </div>
            </div>
            <div>
                <hr className="vertical-line2"/>
            </div>
            <div className="PlayNow">
                <button className='glowing-btn'>
                <span className='glowing-txt'>P<span className='faulty-letter'>L</span>AY</span>
            </button>
            </div>
        </div>
        
        </>
    );
};

export default MorePlay;