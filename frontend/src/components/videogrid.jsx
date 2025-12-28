import React from 'react';
import VideoTile from './videotile';

const VideoGrid = ({ peers, localVideoRef, userName, audioEnabled, videoEnabled }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
      <VideoTile
        isLocal
        videoRef={localVideoRef}
        userName={userName}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
      />
      {Object.entries(peers).map(([userId, peer]) => (
        <VideoTile
          key={userId}
          peer={peer}
          videoRef={(videoRef) => videoRef && (videoRef.srcObject = peer.stream)}
          userName={peer.name}
        />
      ))}
    </div>
  );
};

export default VideoGrid;