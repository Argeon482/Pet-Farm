import React, { useState } from 'react';
import { Profile } from '../types';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profiles: Profile[];
    currentProfileId: string | null;
    onLoadProfile: (profileId: string) => void;
    onAddProfile: (name: string, pin: string) => void;
    onDeleteProfile: (profileId: string) => void;
    onUpdatePin: (profileId: string, newPin: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen,
    onClose,
    profiles,
    currentProfileId,
    onLoadProfile,
    onAddProfile,
    onDeleteProfile,
    onUpdatePin,
}) => {
    const [newProfileName, setNewProfileName] = useState('');
    const [newProfilePin, setNewProfilePin] = useState('');
    const [editingPin, setEditingPin] = useState<{ id: string, pin: string } | null>(null);

    if (!isOpen) return null;

    const handleAddProfile = () => {
        if (newProfileName.trim() && /^\d{4}$/.test(newProfilePin)) {
            onAddProfile(newProfileName.trim(), newProfilePin);
            setNewProfileName('');
            setNewProfilePin('');
        } else {
            alert('Please provide a valid name and a 4-digit PIN.');
        }
    };
    
    const handleSavePin = () => {
        if (editingPin && /^\d{4}$/.test(editingPin.pin)) {
            onUpdatePin(editingPin.id, editingPin.pin);
            setEditingPin(null);
        } else {
            alert('PIN must be exactly 4 digits.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-cyan-400">Profile Manager</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
                </header>
                <main className="p-6 max-h-[60vh] overflow-y-auto">
                    <div className="space-y-3">
                        {profiles.map(profile => (
                            <div key={profile.id} className={`p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${profile.id === currentProfileId ? 'bg-cyan-900/50 ring-2 ring-cyan-500' : 'bg-gray-700/70'}`}>
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-lg text-white">{profile.name}</h3>
                                    <p className="text-xs text-gray-400">
                                        Last saved: {new Date(profile.lastSaved).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {editingPin?.id === profile.id ? (
                                        <>
                                            <input type="password" value={editingPin.pin} onChange={(e) => setEditingPin({ ...editingPin, pin: e.target.value })} maxLength={4} placeholder="New PIN" className="w-24 bg-gray-600 text-white rounded-md px-2 py-1" autoFocus />
                                            <button onClick={handleSavePin} className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded-md text-sm">Save</button>
                                            <button onClick={() => setEditingPin(null)} className="bg-gray-500 hover:bg-gray-400 text-white font-semibold py-1 px-3 rounded-md text-sm">Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onLoadProfile(profile.id)}
                                                disabled={profile.id === currentProfileId}
                                                className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded-md text-sm disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Load
                                            </button>
                                            <button
                                                onClick={() => setEditingPin({ id: profile.id, pin: '' })}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-1 px-3 rounded-md text-sm"
                                            >
                                                {profile.pin ? 'Change PIN' : 'Set PIN'}
                                            </button>
                                             <button
                                                onClick={() => { if(window.confirm(`Are you sure you want to delete profile "${profile.name}"? This cannot be undone.`)) onDeleteProfile(profile.id) }}
                                                disabled={profiles.length <= 1}
                                                className="bg-red-700 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-md text-sm disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                 <footer className="p-4 bg-gray-900/50 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                         <input
                            type="text"
                            value={newProfileName}
                            onChange={e => setNewProfileName(e.target.value)}
                            placeholder="New profile name..."
                            className="flex-grow w-full sm:w-auto bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                         <input
                            type="password"
                            value={newProfilePin}
                            onChange={e => setNewProfilePin(e.target.value)}
                            maxLength={4}
                            placeholder="4-Digit PIN"
                            className="w-full sm:w-32 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <button onClick={handleAddProfile} className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors flex-shrink-0">
                            Create Profile
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ProfileModal;