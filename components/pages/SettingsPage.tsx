import React, { useState, useEffect } from 'react';
import { AnalysisReport } from '../../types';
import { DashboardTab, UserProfile, NotificationSettings } from '../../App';
import ProfilePanel from '../settings/ProfilePanel';
import ReviewsPanel from '../settings/ReviewsPanel';
import BillingPanel from '../settings/BillingPanel';
import NotificationsPanel from '../settings/NotificationsPanel';
import SecurityPanel from '../settings/SecurityPanel';
import HelpPanel from '../settings/HelpPanel';


interface ProfileDashboardPageProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  initialTab: DashboardTab;
  onLogout: () => void;
  reports: AnalysisReport[];
  onViewReport: (report: AnalysisReport) => void;
  currentUserPlan: {
    name: string;
    reviewsUsed: number;
    reviewsLimit: number;
  };
  onNavigateToPricing: () => void;
}

const ProfileDashboardPage: React.FC<ProfileDashboardPageProps> = ({ 
    user, 
    onUpdateUser,
    notificationSettings,
    onUpdateNotificationSettings,
    initialTab, 
    onLogout, 
    reports, 
    onViewReport, 
    currentUserPlan, 
    onNavigateToPricing 
}) => {
    const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);
    
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);
    
    const tabs: { id: DashboardTab; name: string; icon: React.ReactElement }[] = [
        { id: 'profile', name: 'Profile', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        { id: 'reviews', name: 'My Reviews', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg> },
        { id: 'billing', name: 'Billing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
        { id: 'notifications', name: 'Notifications', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
        { id: 'security', name: 'Security', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg> },
        { id: 'help', name: 'Help & Support', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    ];
    const activeTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];
    
    const pageTitle = activeTab === 'reviews' ? 'My Reviews' : activeTab === 'billing' ? 'Billing & Subscription' : 'Settings';
    const pageSubtitle = activeTab === 'reviews' 
        ? 'Browse and manage your past analysis reports.' 
        : activeTab === 'billing'
        ? 'Manage your current plan, usage, and payment details.'
        : 'Manage your account and security.';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:pb-24">
            <div className="mb-8">
                 <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-1">{pageTitle}</h1>
                 <p className="text-base text-text-secondary dark:text-gray-400">{pageSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <aside className="md:col-span-1 lg:col-span-1">
                    <nav className="space-y-1 md:sticky md:top-24">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                                    activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="md:col-span-3 lg:col-span-4">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-white mb-6 md:hidden">{activeTabInfo.name}</h2>
                    {activeTab === 'profile' && <ProfilePanel user={user} onUpdateUser={onUpdateUser} />}
                    {activeTab === 'reviews' && <ReviewsPanel reports={reports} onViewReport={onViewReport} />}
                    {activeTab === 'billing' && <BillingPanel plan={currentUserPlan} onUpgrade={onNavigateToPricing} />}
                    {activeTab === 'notifications' && <NotificationsPanel settings={notificationSettings} onUpdateSettings={onUpdateNotificationSettings} />}
                    {activeTab === 'security' && <SecurityPanel onLogout={onLogout} />}
                    {activeTab === 'help' && <HelpPanel />}
                </main>
            </div>
        </div>
    );
};

export default ProfileDashboardPage;