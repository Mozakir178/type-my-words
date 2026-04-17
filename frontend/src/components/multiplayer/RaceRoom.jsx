import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import PlayerList from './PlayerList';

const RaceRoom = ({ roomId }) => {
  const { socket } = useSocket();
  const [roomState, setRoomState] = useState({ players: [], status: 'waiting', text: '' });
  const [progress, setProgress] = useState(0);
  const [wpm, setWpm] = useState(0);

  useEffect(() => {
    if (!socket) return;
    
    socket.emit('join_room', { roomId, mode: 'race' });
    
    socket.on('room_state', (state) => setRoomState(state));
    socket.on('player_update', (update) => {
      setRoomState(prev => ({
        ...prev,
        players: prev.players.map(p => p.id === update.playerId ? { ...p, ...update } : p)
      }));
    });
    socket.on('race_start', ({ startTime, text }) => {
      setRoomState(prev => ({ ...prev, status: 'racing', text }));
    });
    
    return () => {
      socket.off('room_state');
      socket.off('player_update');
      socket.off('race_start');
    };
  }, [socket, roomId]);

  const startRace = () => socket.emit('start_race', roomId);
  
  // Mock progress updates (replace with actual typing engine integration)
  useEffect(() => {
    if (roomState.status !== 'racing') return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 100));
      setWpm(w => w + Math.floor(Math.random() * 5));
    }, 500);
    return () => clearInterval(interval);
  }, [roomState.status]);

  useEffect(() => {
    if (progress > 0 && socket) {
      socket.emit('race_progress', { roomId, progress, wpm });
    }
  }, [progress, wpm, socket, roomId]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Race Room: {roomId}</h3>
        {roomState.status === 'waiting' && (
          <button onClick={startRace} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Start Race</button>
        )}
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          roomState.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
          roomState.status === 'racing' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {roomState.status.charAt(0).toUpperCase() + roomState.status.slice(1)}
        </span>
      </div>
      
      {roomState.status === 'racing' && (
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="text-right mt-1 text-sm font-mono">{progress}% • {wpm} WPM</div>
        </div>
      )}
      
      <PlayerList players={roomState.players} />
    </div>
  );
};

export default RaceRoom;