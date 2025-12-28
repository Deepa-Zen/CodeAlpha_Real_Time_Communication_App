import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import EmojiPicker from 'emoji-picker-react';
import Header from './components/header';
import Footer from './components/footer';
import ParticipantsPanel from './components/participants-panel';
import JoinForm from './components/joinform';
import VideoGrid from './components/videogrid';
import Controls from './components/controls';

function App() {
  const [myID, setMyID] = useState('');
  const [userName, setUserName] = useState('');
  const [roomID, setRoomID] = useState('');
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState({});
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [error, setError] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showChatPopup, setShowChatPopup] = useState(false);
  
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const screenSharingRef = useRef(screenSharing);

  useEffect(() => {
    screenSharingRef.current = screenSharing;
  }, [screenSharing]);

  useEffect(() => {
    socketRef.current = io('https://webrtc-1-4dnb.onrender.com');

    const handleExistingUsers = (users) => {
      users.forEach(user => {
        createPeer(user.id, true, user.name);
        setParticipants(prev => [...prev, user]);
      });
    };

    const handleUserJoined = (user) => {
      setParticipants(prev => [...prev, user]);
      createPeer(user.id, false, user.name);
    };

    const handleUserDisconnected = (userId) => {
      if (peersRef.current[userId]) {
        peersRef.current[userId].destroy();
        delete peersRef.current[userId];
        setPeers(prev => {
          const newPeers = { ...prev };
          delete newPeers[userId];
          return newPeers;
        });
      }
      setParticipants(prev => prev.filter(p => p.id !== userId));
    };

    const handleSignal = async ({ from, signal, initiator, userName }) => {
      if (peersRef.current[from]) {
        peersRef.current[from].signal(signal);
      } else {
        await createPeer(from, !initiator, userName);
        peersRef.current[from].signal(signal);
      }
    };

    const handleMediaToggle = ({ userId, audio, video }) => {
      setPeers(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          audio: audio !== undefined ? audio : prev[userId]?.audio,
          video: video !== undefined ? video : prev[userId]?.video
        }
      }));
    };

    const handleMessage = (messageData) => {
      setMessages(prev => [...prev, messageData]);
    };

    const handleWhiteboardToggle = (state) => {
      setShowWhiteboard(state);
    };

    socketRef.current.on('connect', () => setMyID(socketRef.current.id));
    socketRef.current.on('existing-users', handleExistingUsers);
    socketRef.current.on('user-joined', handleUserJoined);
    socketRef.current.on('user-disconnected', handleUserDisconnected);
    socketRef.current.on('signal', handleSignal);
    socketRef.current.on('media-toggle', handleMediaToggle);
    socketRef.current.on('message', handleMessage);
    socketRef.current.on('whiteboard-toggled', handleWhiteboardToggle);

    return () => {
      socketRef.current.disconnect();
      Object.values(peersRef.current).forEach(peer => peer.destroy());
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      screenStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (joined && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
      localVideoRef.current.play().catch(console.error);
    }
  }, [joined]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createPeer = async (userId, initiator, userName) => {
    if (!localStreamRef.current) await setupLocalStream();
    
    const currentStream = screenSharingRef.current && screenStreamRef.current 
      ? screenStreamRef.current 
      : localStreamRef.current;

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: currentStream
    });

    peer.on('signal', signal => {
      socketRef.current.emit('signal', { target: userId, signal, initiator, userName });
    });

    peer.on('stream', stream => {
      setPeers(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          stream,
          name: userName || `User ${userId.substring(0, 4)}`,
          audio: true,
          video: true
        }
      }));
    });

    peer.on('close', () => {
      delete peersRef.current[userId];
      setPeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[userId];
        return newPeers;
      });
    });

    peersRef.current[userId] = peer;
  };

  const setupLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });
      localStreamRef.current = stream;
    } catch (err) {
      setError('Camera/microphone access required to join meeting');
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleMedia = async (type) => {
    if (type === 'audio') {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setAudioEnabled(!audioEnabled);
      socketRef.current.emit('toggle-media', { audio: !audioEnabled, video: videoEnabled });
    }
    
    if (type === 'video') {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setVideoEnabled(!videoEnabled);
      socketRef.current.emit('toggle-media', { audio: audioEnabled, video: !videoEnabled });
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (screenSharing) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        setScreenSharing(false);
        Object.values(peersRef.current).forEach(peer => {
          const senders = peer._pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(localStreamRef.current.getVideoTracks()[0]);
          }
        });
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false
        });
        screenStreamRef.current = stream;
        setScreenSharing(true);
        Object.values(peersRef.current).forEach(peer => {
          const senders = peer._pc.getSenders();
          const videoSender = senders.find(s => s.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(stream.getVideoTracks()[0]);
          }
        });
        stream.getVideoTracks()[0].onended = () => toggleScreenShare();
      }
    } catch (err) {
      console.error('Screen sharing error:', err);
    }
  };

  const joinRoom = async () => {
    if (!roomID || !userName) {
      setError('Please enter both name and room ID');
      setTimeout(() => setError(''), 5000);
      return;
    }
    
    try {
      await setupLocalStream();
      setJoined(true);
      socketRef.current.emit('join-room', roomID, userName);
      setParticipants(prev => [...prev, { id: socketRef.current.id, name: userName }]);
    } catch (err) {
      setError('Failed to join room');
      setTimeout(() => setError(''), 5000);
    }
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      socketRef.current.emit('message', {
        sender: userName,
        message: messageInput,
        timestamp: new Date().toISOString()
      });
      setMessageInput('');
    }
  };

  const addEmoji = (emoji) => {
    setMessageInput(prev => prev + emoji.emoji);
    setShowEmojiPicker(false);
  };

  const toggleChatPopup = () => {
    setShowChatPopup(prev => !prev);
    setShowEmojiPicker(false);
  };

  const toggleWhiteboard = () => {
    const newState = !showWhiteboard;
    setShowWhiteboard(newState);
    socketRef.current.emit('toggle-whiteboard', { roomID, state: newState });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-4 right-4">
          {error}
        </div>
      )}

      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">
        {!joined ? (
          <JoinForm
            userName={userName}
            setUserName={setUserName}
            roomID={roomID}
            setRoomID={setRoomID}
            joinRoom={joinRoom}
            error={error}
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="flex-grow flex flex-col">
              <VideoGrid
                peers={peers}
                localVideoRef={localVideoRef}
                userName={userName}
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
              />
            </div>

           

            <ParticipantsPanel
              isOpen={showParticipants}
              onClose={() => setShowParticipants(false)}
              participants={[...Object.values(peers), { id: myID, name: userName }]}
            />

            <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center">
              <Controls
                toggleMedia={toggleMedia}
                audioEnabled={audioEnabled}
                videoEnabled={videoEnabled}
                screenSharing={screenSharing}
                toggleScreenShare={toggleScreenShare}
                setShowParticipants={setShowParticipants}
                showWhiteboard={showWhiteboard}
                toggleWhiteboard={toggleWhiteboard}
              />
            </div>

             {/* Chat Popup */}
      {showChatPopup && (
        <div className="fixed bottom-20 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-lg">Chat</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                😃
              </button>
              <button 
                onClick={toggleChatPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
          
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-2 z-10">
              <EmojiPicker
                onEmojiClick={addEmoji}
                height={300}
                width="100%"
              />
            </div>
          )}

          <div className="h-64 overflow-y-auto p-4">
            {messages.map((msg, index) => (
              <div key={index} className="mb-3">
                <div className="text-sm font-medium text-blue-600">
                  {msg.sender === userName ? 'You' : msg.sender}
                </div>
                <div className="text-gray-800 break-words">
                  {msg.message}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-grow p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type a message..."
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
<button 
  onClick={toggleChatPopup}
  className="fixed bottom-28 right-4 bg-green-600 p-3 rounded-full text-white shadow-lg hover:bg-green-700 transition-colors z-50"
>
  💬
</button>


          </div>
        )}


      </main>
      
     
      <Footer />

    </div>
  );
}

export default App;
