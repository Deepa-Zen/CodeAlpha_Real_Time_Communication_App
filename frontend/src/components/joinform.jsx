import React from 'react';

const JoinForm = ({ userName, setUserName, roomID, setRoomID, joinRoom, error }) => {
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Join Meeting</h2>
      <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Your Name"
        className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <input
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        placeholder="Room ID"
        className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        onClick={joinRoom}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
      >
        Join Now
      </button>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default JoinForm;
