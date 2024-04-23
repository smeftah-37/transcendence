import React, { useEffect, useRef, useState } from 'react';
import './DataAnalysis.css'
import plot from './plots/plot.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useOtherState, useSocket, useUser } from '../../SocketContext.tsx';
import '../../Navbar/Navbar_.css';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the styles
import { faTableTennisPaddleBall } from '@fortawesome/free-solid-svg-icons';
import curve from './plots/207.png';

interface Game {
  id: string;
  Players: Player[];
  Playerscore1: number;
  Playerscore2: number;
}

interface Player {
  id: string;
  avatar: string;
  username: string;
}

interface VizualisationsProps {
  game: Game;
}



export const Vizualisations: React.FC<VizualisationsProps> = (props) => {
  const location = useLocation();
  const state = location.state;

  const navigate = useNavigate();


  const handleGoProfile = (user: Player) => {
    navigate('/Home/Profile', { state: user });
  }
  return (<>{state && state.game? 
    <><div className="ResultData">        <h6>"The data holds all the answers, all it takes is asking the right questions.."</h6>
      <div className="Resultat">
        <li key={state.game.id} className='listContext1'>
          <div className="match1">

            <div className="match-content1">
              <div className="column1">
                <div className="team team--home1">
                  <div className="team-logo1">
                    <img src={state.game.Players[0].avatar && state.game.Players[0].avatar.length > 0 && state.game.Players[0].avatar[0] === '/' ? state.game.Players[0].avatar : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${state.game.Players[0].id}`} onClick={() => handleGoProfile(state.game.Players[0])} alt="team-logo" />
                  </div>
                  <h2 className="team-name1"> {state.game.Players[0].username}</h2>
                </div>
              </div>
              <div className="column1">
                <div className="match-details1">
                  <div className="match-score1">
                    <span className="match-score-number21">{state.game.Playerscore1}</span>

                    <span className="match-score-divider1">:</span>
                    <span className="match-score-number1">{state.game.Playerscore2}</span>
                  </div>

                  <div className="match-referee1">
                    <strong>Total Of shots</strong>
                  </div>
                  <div className="match-bet-options1">
                    <button className="match-bet-option">49 shots</button>

                  </div>
                </div>
              </div>
              <div className="column1">
                <div className="team team--away1">
                  <div className="team-logo1">
                    <img src={state.game.Players[1].avatar && state.game.Players[1].avatar.length > 0 && state.game.Players[1].avatar[0] === '/' ? state.game.Players[1].avatar : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${state.game.Players[1].id}`} onClick={() => handleGoProfile(state.game.Players[1])} alt="team-logo" />
                  </div>
                  <h2 className="team-name1">{state.game.Players[1].username}</h2>
                </div>
              </div>
            </div>
          </div>
        </li>
      </div></div>
    <div className='kiki'>
      <div className='curve'>

        <div className="curve1">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${state.game.id}/3`}></img>
        </div>
        <div className="curve2">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${state.game.id}/4`}></img>
        </div>
      </div>
      <div className="Plots">
        <div className="Plot1">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${state.game.id}/1`}></img>
        </div>
        <div className="Plot2">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${state.game.id}/2`}></img>
        </div>

      </div></div></>: props.game ? <><div className="ResultData">        <h6>"The data holds all the answers, all it takes is asking the right questions.."</h6>
      <div className="Resultat">
        <li key={props.game.id} className='listContext1'>
          <div className="match1">

            <div className="match-content1">
              <div className="column1">
                <div className="team team--home1">
                  <div className="team-logo1">
                    <img src={props.game.Players[0].avatar && props.game.Players[0].avatar.length > 0 && props.game.Players[0].avatar[0] === '/' ? props.game.Players[0].avatar : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${props.game.Players[0].id}`} onClick={() => handleGoProfile(props.game.Players[0])} alt="team-logo" />
                  </div>
                  <h2 className="team-name1"> {props.game.Players[0].username}</h2>
                </div>
              </div>
              <div className="column1">
                <div className="match-details1">
                  <div className="match-score1">
                    <span className="match-score-number21">{props.game.Playerscore1}</span>

                    <span className="match-score-divider1">:</span>
                    <span className="match-score-number1">{props.game.Playerscore2}</span>
                  </div>

                  <div className="match-referee1">
                    <strong>Total Of shots</strong>
                  </div>
                  <div className="match-bet-options1">
                    <button className="match-bet-option">49 shots</button>

                  </div>
                </div>
              </div>
              <div className="column1">
                <div className="team team--away1">
                  <div className="team-logo1">
                    <img src={props.game.Players[1].avatar && props.game.Players[1].avatar.length > 0 && props.game.Players[1].avatar[0] === '/' ? props.game.Players[1].avatar : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${props.game.Players[1].id}`} onClick={() => handleGoProfile(props.game.Players[1])} alt="team-logo" />
                  </div>
                  <h2 className="team-name1">{props.game.Players[1].username}</h2>
                </div>
              </div>
            </div>
          </div>
        </li>
      </div></div>
    <div className='kiki'>
      <div className='curve'>

        <div className="curve1">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${props.game.id}/3`}></img>
        </div>
        <div className="curve2">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${props.game.id}/4`}></img>
        </div>
      </div>
      <div className="Plots">
        <div className="Plot1">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${props.game.id}/1`}></img>
        </div>
        <div className="Plot2">
          <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/dashbord/image/${props.game.id}/2`}></img>
        </div>

      </div></div></> :<></>}</>)

}

function DataAnalysis() {
  const { socket, updateSocket } = useSocket();
  const { user, updateUser, token } = useUser();
  const { games, updateGames } = useOtherState();
  const [vizual, setVizual] = useState(false);
  const location = useLocation();
  const state = location.state;
  function calculateWinProbability(ratingA: number, ratingB: number): number[] {
    const expectedScoreA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    const expectedScoreB = 1 - expectedScoreA;
    return [expectedScoreA, expectedScoreB, (expectedScoreA / (expectedScoreA + expectedScoreB)), (expectedScoreB / (expectedScoreA + expectedScoreB))];
  }
  if (!user.current)
    user.current = updateUser(user.current);

  if (!socket.current)
    socket.current = updateSocket();

  // Calculate expected scores and win probabilities
  // Define userGames state to hold the filtered games of the current user
  const [userGames, setUserGames] = useState<Game[]>([]);

  function calculateLiveProbability(A_score: number, B_score: number): number[] {
    const totalPoints = 11;
    const remainingPointsA = totalPoints - A_score;
    const remainingPointsB = totalPoints - B_score;

    // Calculate probabilities after each player scores a point
    let P_A = remainingPointsA / (remainingPointsA + remainingPointsB);
    let P_B = remainingPointsB / (remainingPointsA + remainingPointsB);

    // Update probabilities
    P_A = P_A * (remainingPointsA / (remainingPointsA + remainingPointsB));
    P_B = P_B * (remainingPointsB / (remainingPointsA + remainingPointsB));

    // Normalize probabilities
    P_A /= (P_A + P_B);
    P_B /= (P_A + P_B);

    return [Math.floor(P_A * 100), 100 - Math.floor(P_A * 100)];
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user.current.id || state) {
          let response;
          if (state && state.username) {
            response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/${state.id}/games/`, {

              headers: {
                'authorization': token.current,
              }
            })
          }
          else {
            response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/${user.current.id}/games/`, {

              headers: {
                'authorization': token.current,
              }

            })
          }

          if (!response.ok) {
            throw new Error('Failed to fetch games');
          }

          const data = await response.json();
          if (data)
            setUserGames(data);
          // Filter and map the games of the current user

        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchData();
    socket.current.on('list-game', (message) => {
      if (message.userId === user.current.id) {
        fetchData();
      }
    });


  }, [user.current.id, socket.current, state]);
  const playerId = async (player: string) => {

    const response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/` + player, {

      headers: {
        'authorization': token, // Make sure to include your authorization token here
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch winner details');
    }

    const dataPlayer = await response.json();
    return (dataPlayer)
  }


  return (
    <>

      <div className="Container4">
        <div className="DataProfile">
          <div className="card_">

            <div className="banner_"><img src={state && state.username ? `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${state.id}` : `http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${user.current.id}`} /></div>
            <div
              className="menu_">
            </div>
            <h2 className="name_">{state && state.username ? state.username : user.current.username}</h2>
            <div className="actions_">
              <div className="follow-info_">
                <h3><span>Lvl: </span><small>{state && state.lvl ? state.lvl : user.current.lvl}</small></h3>
                <hr />
                <h3><span>Win: </span><small>{state && state.won ? state.played ? Math.floor((state.won / state.played) * 100) : <p>-</p> : user.current.played ? Math.floor((user.current.won / user.current.played) * 100) : <p>-</p>} %</small></h3>
              </div>
              <hr />
              {state && state.username ? <div className="desc_"><h3>Your Proba against</h3><h3>{Math.floor(calculateWinProbability(state.lvl * state.xp, user.current.lvl * user.current.xp)[3] * 100)}%</h3> {(Math.floor(calculateWinProbability(state.lvl * state.xp, user.current.lvl * user.current.xp)[3] * 100)) > 50 ? <h3>I know you can do it</h3> : <h3>Not satisfied?</h3>} </div>
                : <></>}</div>
          </div>
          {state && state.username ? <div className="follow-btn_"><button>Prove that</button></div> : <></>}
        </div>




        <ul className="SearchData">
          {userGames.map((game) => (
            <li key={game.id} className='listContext'>

              <div className="match">
                <div className="match-header">
                  <div className="match-status">{game.Status ? <p className='Live'>Live</p> : <p className='Finished'>Finished</p>}</div>
                </div>
                <div className="match-content">
                  <div className="column">
                    <div className="team team--home">
                      <div className="team-logo">
                        <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${game.Players[0].id}`} alt="team-logo" />
                      </div>
                      <h2 className="team-name"> {game.Players[0].username}</h2>
                    </div>
                  </div>
                  <div className="column">
                    <div className="match-details">
                      <div className="match-score">
                        <span className="match-score-number match-score-number--leading">{game.Playerscore1}</span>
                        <span className="match-score-divider">:</span>
                        <span className="match-score-number">{game.Playerscore2}</span>
                      </div>
                      <div className="match-time-lapsed">
                        72'
                      </div>
                      <div className="match-referee">
                        <strong>Probabilities</strong>
                      </div>
                      <div className="match-bet-options">
                        <button className="match-bet-option">{calculateLiveProbability(game.Playerscore1, game.Playerscore2)[1]}</button>
                        <button className="match-bet-option">{calculateLiveProbability(game.Playerscore1, game.Playerscore2)[0]}</button>
                      </div>
                      {game.status ? <>{game.status === 2 ? <div className="match-bet-place">Forfeit</div> : <></>}</> : <Link to='Vizualisations' state={{ game: game }} style={{ textDecoration: 'none' }} className="match-bet-place">Full Report</Link>}
                    </div>
                  </div>
                  <div className="column">
                    <div className="team team--away">
                      <div className="team-logo">
                        <img src={`http://10.13.1.10:3004/SchoolOfAthensApi/users/avatar/${game.Players[1].id}`} alt="team-logo" />
                      </div>
                      <h2 className="team-name">{game.Players[1].username}</h2>
                    </div>
                  </div>
                </div>
              </div>
            </li>))}


        </ul>
        <div className="Vizualisations">
          {console.log(userGames)}
          <Routes>
            <Route path='Vizualisations' element={<Vizualisations />} />
            {userGames ? 
            <Route path='*' element={<Vizualisations  game={userGames[2]} />} /> : <></>}

            
          </Routes>
        </div>

      </div>




    </>
  );
}

export default DataAnalysis;