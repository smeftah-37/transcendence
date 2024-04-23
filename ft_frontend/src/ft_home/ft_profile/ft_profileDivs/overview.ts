import React, { FC } from 'react';
import './overview.css';
import PieChart from './utils/piechart';

const Overview: FC = () => {
    return (
        <>
            <div className='Alloverview'>
                <div className="LastResults">
                    <p className='H1'>Last Results</p>
                    <p className='H2'>Latest results and upcoming tournaments</p>
                    <ul className='Details'>
                        <li>M5  1vs1    11-0</li>
                        <li>M5  1vs1    11-0</li>
                        <li>M5  1vs1    11-0</li>
                        <li>M5  1vs1    11-0</li>
                        <li>M5  1vs1    11-0</li>
                    </ul>
                </div>
                <div>
                    <hr className="vertical-line"/>
                </div>
                <div className="Allstats">
                    <div className="Overviewstats">
                    <p className='Ngames'>Number of games played</p>
                    <div><PieChart data={{ wins: 20, losses: 30 }} /></div>
                    </div>  
                </div>
            </div>       
        </>
    );
};


export default Overview;