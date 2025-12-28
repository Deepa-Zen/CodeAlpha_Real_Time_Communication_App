import React from 'react';

const ParticipantsPanel = ({ isOpen, onClose, participants }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Participants</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>
        <div className="space-y-2">
          {participants.map(participant => (
            <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{participant.name}</span>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full " />
                <div className="w-2 h-2 rounded-full " />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParticipantsPanel;