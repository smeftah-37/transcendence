import React, { FC } from 'react';
import './LastGames2.css';
import $ from 'jquery';
import { useUser, useSocket } from '../../SocketContext.tsx'
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Game {
  id: number;
  Players: Player[];
  Playerscore1: number;
  Playerscore2: number;
  status: number;
}

interface Player {
  username: string;
}

const LastGames2: FC = () => {
  const [gamesFinished, setGamesLive] = useState<Game[]>([]);

  const { user, token } = useUser();
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {

      const response = await fetch(`http://10.13.1.10:3004/SchoolOfAthensApi/users/${user.current.id}/games/`, {
        headers: {
          'authorization': token.current,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to patch resource');
      }
      const data = await response.json();
      const finishedGames = data.filter((game: Game) => game.status === 1);

      // Update state with filtered games
      setGamesLive(finishedGames);
    }
    fetchData();
    socket.current.on('save-point', () => {
      fetchData();
    });
  }, [user.current, socket.current]);

  const goTodata = (gameId: number) => {
    navigate('../../DataAnalysis');
  }

  $(window).on("load resize ", function () {
    var scrollWidth = $('.tbl-content').width() - $('.tbl-content table').width();
    $('.tbl-header').css({ 'padding-right': scrollWidth });
  }).resize();

  return (
    <>
      <div className="tbl-header">
        <table cellPadding="0" cellSpacing="0" border="0">
          <thead>
            <tr>
              <th>Player 1</th>
              <th>Player 2</th>
              <th>Score</th>
              <th>Join Game</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="tbl-content">
        <table cellPadding="0" cellSpacing="0" border="0">
          <tbody>
            {gamesFinished ? (gamesFinished.map((game) => (
              <tr key={game.id}>
                <td>{game.Players[0].username}</td>
                <td>{game.Players[1].username}</td>
                <td>{game.Playerscore1}   -   {game.Playerscore2}</td>
                <td onClick={() => goTodata(game.id)}>Data</td>
              </tr>
            ))) : <></>}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LastGames2;