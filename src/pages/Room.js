import './Room.css';

function Room({ roomCode }) {
  return (
    <div className="room">
      <div className="room-container">
        <div className="room-content">
          <h2 className="room-title">Room Code</h2>
          <div className="room-code-display">
            {roomCode}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Room;
