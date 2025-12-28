import React, { useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

const Chat = ({
  messages,
  messageInput,
  setMessageInput,
  sendMessage,
  showEmojiPicker,
  setShowEmojiPicker,
  messagesEndRef,
  userName
}) => {
  useEffect(() => {
    // Scroll to the bottom when a new message is added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="lg:w-96 bg-white rounded-xl shadow-lg flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[80%] break-words ${
              msg.sender === userName ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}
          >
            <div className="font-medium text-sm text-gray-600">{msg.sender}</div>
            <div className="text-gray-800">
              {typeof msg.message === 'string' ? msg.message : JSON.stringify(msg.message)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2 relative">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="px-3 py-2 rounded-lg hover:bg-gray-100"
        >
          😀
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-16 left-0 z-10">
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setMessageInput((prev) => prev + emojiData.emoji);
                setShowEmojiPicker(false);
              }}
            />
          </div>
        )}
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && messageInput.trim() !== '') {
              sendMessage(); // Ensure sendMessage function is handling this correctly
              setMessageInput(''); // Clear input after sending
            }
          }}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            if (messageInput.trim() !== '') {
              sendMessage(); // Ensure sendMessage function is handling this correctly
              setMessageInput(''); // Clear input after sending
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
