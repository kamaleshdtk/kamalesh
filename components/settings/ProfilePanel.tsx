import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { UserProfile } from '../../App';
import SectionCard from '../shared/SectionCard';

interface ProfilePanelProps {
    user: UserProfile;
    onUpdateUser: (updates: Partial<UserProfile>) => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ user, onUpdateUser }) => {
    const [draftName, setDraftName] = useState(user.name);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    useEffect(() => {
        setDraftName(user.name);
    }, [user.name]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
             if (file.size > 1 * 1024 * 1024) { // 1MB limit
                addToast("Image size exceeds 1MB.", 'error');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const saveAvatar = () => {
        if (avatarPreview) {
            onUpdateUser({ avatar: avatarPreview });
            addToast('Profile photo updated!', 'success');
            setAvatarPreview(null);
        }
    };

    const handleSave = () => {
        onUpdateUser({ name: draftName });
        if (avatarPreview) {
          saveAvatar();
        }
        addToast('Profile updated successfully!', 'success');
    };
    
    return (
        <div className="space-y-8">
             <SectionCard title="Profile Information" description="Update your photo and personal details.">
                <div className="flex items-center gap-5">
                    <img src={avatarPreview || user.avatar} alt="Avatar" className="w-20 h-20 rounded-full" />
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/png, image/jpeg, image/gif" />
                    <div>
                         <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                            Upload new image
                        </button>
                        <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">JPG, PNG, or GIF. 1MB max.</p>
                    </div>
                    {avatarPreview && (
                        <div className="flex gap-2">
                             <button onClick={() => setAvatarPreview(null)} className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg">Cancel</button>
                        </div>
                    )}
                </div>
                <div className="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="name" value={draftName} onChange={e => setDraftName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="email" value={user.email} readOnly className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm cursor-not-allowed" />
                    </div>
                </div>
            </SectionCard>
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProfilePanel;
