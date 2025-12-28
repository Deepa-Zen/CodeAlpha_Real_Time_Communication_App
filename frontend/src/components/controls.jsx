import React from 'react';

const Controls = ({
  toggleMedia,
  audioEnabled,
  videoEnabled,
  screenSharing,
  toggleScreenShare,
  setShowParticipants,
  showWhiteboard,
  toggleWhiteboard
}) => {
  return (
    <div className="flex justify-center gap-6 mt-8 flex-wrap">
      <button
        onClick={() => toggleMedia('audio')}
        className={`px-8 py-3 rounded-md shadow-md ${
          audioEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
        } text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all duration-200`}
      >
        {audioEnabled ? 'Mute' : 'Unmute'}
      </button>
      <button
        onClick={() => toggleMedia('video')}
        className={`px-8 py-3 rounded-md shadow-md ${
          videoEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
        } text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all duration-200`}
      >
        {videoEnabled ? 'Stop Video' : 'Start Video'}
      </button>
      <button
        onClick={toggleScreenShare}
        className={`px-8 py-3 rounded-md shadow-md ${
          screenSharing ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-600 hover:bg-gray-700'
        } text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-all duration-200`}
      >
        {screenSharing ? 'Stop Share' : 'Share Screen'}
      </button>
      <button
        onClick={() => setShowParticipants(true)}
        className="px-8 py-3 rounded-md shadow-md bg-gray-600 hover:bg-gray-700 text-white font-medium text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-200"
      >
        Participants
      </button>
     
    </div>
  );
};

export default Controls;
