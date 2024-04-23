import React, { useEffect } from 'react';
import { useState } from 'react';
import './scoreboard.css';
import { useScore } from '../game';
import { useSocketGame } from '../../../SocketContext.tsx';
import speaker from '../assets/speaker.png'

interface ScoreBoardProps {
    state: boolean;
    game: {
        Players: {
            username: string;
        }[];
    };
}

const ScoreBoard: React.FC<ScoreBoardProps> = (props) => {
    const [score, setScore] = useState<[number, number]>([0, 0]);
    const { socketGame } = useSocketGame();
    const [stateOfM,setStateOfMatch] = useState('"Letss GOO!!!"');

    const stateOfTheMatch = (scoreLive) =>
    {
        if(scoreLive[0] === 1 && scoreLive[1] === 0 || scoreLive[0] === 0 && scoreLive[1] === 1)
            setStateOfMatch('Now we are talking 1-0');
        if(scoreLive[0] === 3 && scoreLive[1] === 0 || scoreLive[0] === 0 && scoreLive[1] === 3)
            setStateOfMatch('TREE A ZEEEROOO!');
        if(scoreLive[0] === 6  && scoreLive[1] === 6)
            setStateOfMatch('WHAT A GAME!!!!!');
        if(scoreLive[0] === 10  && scoreLive[1] === 10)
            setStateOfMatch('WHAT A GAME.');
        if(scoreLive[0] === 4  && scoreLive[1] === 3 || scoreLive[0] === 3 && scoreLive[1] === 4)
            setStateOfMatch('COOOOME OOOON 4-3');
        if(scoreLive[0] === 11  || scoreLive[1] === 11)
            setStateOfMatch('E FINIIIITAAAAA');
        if(scoreLive[0] - scoreLive[1] > 5)
            setStateOfMatch(`${scoreLive[0] - scoreLive[1]} point difference ? ${props.game.Players[0]}! Still alive? `);
        if(scoreLive[1] - scoreLive[0] > 5)
            setStateOfMatch(`${scoreLive[1] - scoreLive[0]} point difference ? ${props.game.Players[1]}! Still alive? `);
        if(Math.abs(scoreLive[0] - scoreLive[1]) > 7)
            setStateOfMatch("We Need an ambulance")
        if(scoreLive[0] === 10  || scoreLive[1] === 10)
        setStateOfMatch(`${scoreLive[0] - scoreLive[1]} Balls of winning!`);
    }   


    useEffect(() => {
        if (socketGame.current && props.game)
            socketGame.current.on('change-score', (value: { score: [number, number] }) => { 
                stateOfTheMatch(value.score);
                setScore(value.score);
               
            });
    }, [socketGame.current]);

    return (
        <>
                    
            {props.game ? 
<div className='chamel'>

<div className="scoreboard">

    <div className="team home">
        <div className="color"></div>
        <div className="name"><span>{props.game.Players[0].username}</span></div>
    </div>

    <div className="goals">
        <div className="goal home"><span>{score[0]}</span></div>
        <div className="divider"><span>-</span></div>
        <div className="goal away"><span>{score[1]}</span></div>
    </div>

    <div className="time"><span><img src={speaker}></img> <span className="minute">{stateOfM}</span></span>
    </div>


    <div className="team away">
        <div className="color"></div>
        <div className="name"><span>{props.game.Players[1].username}</span></div>
    </div>
</div>

{/* <img src={score} className = "score" alt =""/> */}
                </div>
           : <></> } </>

    );
};

export default ScoreBoard;