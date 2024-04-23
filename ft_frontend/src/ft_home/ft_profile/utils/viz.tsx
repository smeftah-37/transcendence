import React, { FC } from 'react';
import './viz.css';

const Viz: FC = () => {
    return (
        <>
            <div className="Vizcard">
                <div className="Vizbox">
                    <div className="Vizpercent">
                        <svg>
                            <circle cx="70" cy="70" r="70"></circle>
                            <circle cx="70" cy="70" r="70"></circle>
                        </svg>
                        <div className="Viznum">
                            <h2>90<span>%</span></h2>
                        </div>
                    </div>
                    <h2 className="Viztext">% Win of games played</h2>
                </div>
            </div>
        </>
    );
};

export default Viz;