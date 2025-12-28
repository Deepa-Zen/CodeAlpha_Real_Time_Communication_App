import React from 'react';

const VideoTile = ({ isLocal, videoRef, userName, audioEnabled, videoEnabled, peer }) => {
  return (
    <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
      <video
        ref={videoRef}
        muted={isLocal}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${isLocal ? 'transform scaleX(-1)' : ''}`}
      />
      <div className="absolute bottom-2 left-2 bg-gray-800/80 text-white px-3 py-1 rounded-lg text-sm">
        {userName} {isLocal && '(You)'}
        <div className="flex gap-2 mt-1">
          <span className={`text-xs ${(isLocal ? audioEnabled : peer?.audio) ? 'text-green-400' : 'text-red-400'}`}>
            {(isLocal ? audioEnabled : peer?.audio) ? 'Mic On' : 'Mic Off'}
          </span>
          <span className={`text-xs ${(isLocal ? videoEnabled : peer?.video) ? 'text-green-400' : 'text-red-400'}`}>
            {(isLocal ? videoEnabled : peer?.video) ? 'Cam On' : 'Cam Off'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoTile;