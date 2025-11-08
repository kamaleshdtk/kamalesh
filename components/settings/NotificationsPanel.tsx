import React from 'react';
import { NotificationSettings } from '../../App';
import SectionCard from '../shared/SectionCard';
import ToggleSwitch from '../shared/ToggleSwitch';

interface NotificationsPanelProps {
    settings: NotificationSettings;
    onUpdateSettings: (updates: Partial<NotificationSettings>) => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ settings, onUpdateSettings }) => {
    return (
        <SectionCard title="Email Notifications" description="Manage how you receive notifications from us.">
            <div className="divide-y divide-gray-200/80 dark:divide-gray-700">
                <ToggleSwitch 
                    label="Review Completion" 
                    description="Get an email when your analysis is ready." 
                    enabled={settings.emailOnComplete} 
                    setEnabled={(v) => onUpdateSettings({ emailOnComplete: v })} 
                />
                <ToggleSwitch 
                    label="Weekly Summary" 
                    description="Receive a weekly digest of your UX improvements." 
                    enabled={settings.emailWeekly} 
                    setEnabled={(v) => onUpdateSettings({ emailWeekly: v })} 
                />
                <ToggleSwitch 
                    label="Product Updates" 
                    description="Stay in the loop with new features." 
                    enabled={settings.productUpdates} 
                    setEnabled={(v) => onUpdateSettings({ productUpdates: v })} 
                />
            </div>
        </SectionCard>
    );
};

export default NotificationsPanel;
