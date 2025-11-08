import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { AnalysisReport } from '../../types';
import { DashboardTab, UserProfile, ReviewSettings, NotificationSettings } from '../../App';
import ReportCard from '../shared/ReportCard';
import HistoryEmptyState from '../shared/HistoryEmptyState';

interface ProfileDashboardPageProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  reviewSettings: ReviewSettings;
  onUpdateReviewSettings: (updates: Partial<ReviewSettings>) => void;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  initialTab: DashboardTab;
  onBack: () => void;
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

// --- Reusable Components ---
const SectionCard: React.FC<{ title: string; description?: string; children: React.ReactNode; rightContent?: React.ReactNode; theme?: 'light' | 'dark' }> = ({ title, description, children, rightContent, theme = 'light' }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-gray-200/60 dark:border-gray-700 rounded-xl shadow-soft border">
            <div className="dark:border-gray-700 p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-text-primary dark:text-gray-100">{title}</h3>
                    {description && <p className="text-sm mt-1 text-text-secondary dark:text-gray-400">{description}</p>}
                </div>
                {rightContent}
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

const ToggleSwitch: React.FC<{ label: string; description: string; enabled: boolean; setEnabled: (enabled: boolean) => void; }> = ({ label, description, enabled, setEnabled }) => (
    <div className="flex justify-between items-center py-4">
        <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <label htmlFor={`toggle-${label.replace(/\s+/g, '-')}`} className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                id={`toggle-${label.replace(/\s+/g, '-')}`}
                className="sr-only peer"
                checked={enabled}
                onChange={() => setEnabled(!enabled)}
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-light peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const Slider: React.FC<{ label: string; options: string[]; value: string; setValue: (value: string) => void; description: string; }> = ({ label, options, value, setValue, description }) => {
    const valueIndex = options.indexOf(value);
    const percentage = valueIndex * (100 / (options.length - 1));

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="relative mt-3 pt-2">
                 <input
                    type="range"
                    min="0"
                    max={options.length - 1}
                    value={valueIndex}
                    onChange={(e) => setValue(options[Number(e.target.value)])}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                />

                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {options.map(opt => <span key={opt}>{opt}</span>)}
                </div>
            </div>
             <p className="text-xs text-text-secondary dark:text-gray-400 mt-2">{description}</p>
        </div>
    );
};


// --- Tab Content Panels ---
const ProfilePanel: React.FC<{ user: UserProfile; onUpdateUser: (updates: Partial<UserProfile>) => void; }> = ({ user, onUpdateUser }) => {
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

const ReviewsPanel: React.FC<{ reports: AnalysisReport[], onViewReport: (report: AnalysisReport) => void }> = ({ reports, onViewReport }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    const paginatedReports = reports.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(reports.length / itemsPerPage);
    
    if (reports.length === 0) {
        return <HistoryEmptyState />;
    }

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedReports.map(report => (
                    <ReportCard key={report.id} report={report} onView={onViewReport} status={report.ui_score > 70 ? 'Approved' : 'Needs Fix'} />
                ))}
            </div>
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">&lt;</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                                currentPage === page
                                    ? 'bg-primary text-white'
                                    : 'bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 text-text-secondary dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">&gt;</button>
                </div>
            )}
        </div>
    );
};


const BillingPanel: React.FC<{ plan: ProfileDashboardPageProps['currentUserPlan'], onUpgrade: () => void }> = ({ plan, onUpgrade }) => {
    const usagePercentage = plan.reviewsLimit > 0 ? (plan.reviewsUsed / plan.reviewsLimit) * 100 : 0;
    const { addToast } = useToast();

    const invoices: any[] = [];

    return (
        <div className="space-y-8">
            <SectionCard 
                title="Current Plan"
                rightContent={
                     <div className="flex items-center gap-3">
                        <button onClick={onUpgrade} className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors">
                            Upgrade Plan
                        </button>
                        <a href="https://billing.stripe.com/p/login/test_7sI5m4eG3gY2b16000" target="_blank" rel="noopener noreferrer" onClick={() => addToast('Opening billing portal...', 'success')} className="px-4 py-2 text-sm font-semibold text-primary border border-gray-300 dark:border-gray-600 dark:text-primary-light hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            Manage Billing
                        </a>
                    </div>
                }
            >
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-primary/10 text-primary font-bold rounded-full">{plan.name}</div>
                    <p className="text-text-secondary dark:text-gray-400">
                        {plan.name === 'Hobby' ? 'You are currently on the free plan.' : 'Manage your subscription and billing details.'}
                    </p>
                </div>
            </SectionCard>

            <SectionCard title="Usage" description={`You have used ${plan.reviewsUsed} of your ${plan.reviewsLimit} reviews this month.`}>
                 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${usagePercentage}%` }}
                    ></div>
                </div>
            </SectionCard>

            <SectionCard title="Payment Method">
                <div className="flex justify-between items-center">
                    <p className="text-text-secondary dark:text-gray-400">No payment method on file.</p>
                    <button className="px-4 py-2 text-sm font-semibold text-primary border dark:text-primary-light border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Add Payment Method</button>
                </div>
            </SectionCard>
            
            <SectionCard title="Invoice History">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th scope="col" className="px-6 py-3">Invoice ID</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Amount</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Download</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length > 0 ? invoices.map(invoice => (
                            <tr key={invoice.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{invoice.id}</th>
                                <td className="px-6 py-4">{invoice.date}</td>
                                <td className="px-6 py-4">{invoice.amount}</td>
                                <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">{invoice.status}</span></td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-primary hover:underline">Download</a>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">
                                    You have no invoices yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </SectionCard>
        </div>
    );
};

const ReviewSettingsPanel: React.FC<{ settings: ReviewSettings; onUpdateSettings: (updates: Partial<ReviewSettings>) => void; }> = ({ settings, onUpdateSettings }) => {
    return (
        <div className="space-y-8">
            <SectionCard title="AI Behavior" description="Control how strictly the AI analyzes your designs. Changes are saved automatically.">
                <div className="space-y-8">
                    <Slider 
                        label="UI Strictness" 
                        options={['Soft', 'Balanced', 'Strict']} 
                        value={settings.uiStrictness} 
                        setValue={(v) => onUpdateSettings({ uiStrictness: v as ReviewSettings['uiStrictness'] })} 
                        description="Strict UI Review checks spacing, alignment, and visual consistency with higher precision." 
                    />
                    <Slider 
                        label="UX Strictness" 
                        options={['Soft', 'Balanced', 'Strict']} 
                        value={settings.uxStrictness} 
                        setValue={(v) => onUpdateSettings({ uxStrictness: v as ReviewSettings['uxStrictness'] })} 
                        description="Strict UX Review deeply enforces usability principles and established UX Laws." 
                    />
                     <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tone of Voice</label>
                        <select 
                            id="tone" 
                            value={settings.tone} 
                            onChange={(e) => onUpdateSettings({ tone: e.target.value as ReviewSettings['tone'] })} 
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        >
                            <option>Friendly</option>
                            <option>Professional</option>
                            <option>Direct</option>
                        </select>
                    </div>
                    <ToggleSwitch 
                        label={settings.reportFormat ? 'Detailed Report' : 'Summary Only'} 
                        description="Choose between a full report or just key fixes." 
                        enabled={settings.reportFormat} 
                        setEnabled={(v) => onUpdateSettings({ reportFormat: v })} 
                    />
                </div>
            </SectionCard>
        </div>
    );
};

const NotificationsPanel: React.FC<{ settings: NotificationSettings; onUpdateSettings: (updates: Partial<NotificationSettings>) => void; }> = ({ settings, onUpdateSettings }) => {
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

const SecurityPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [deleteInput, setDeleteInput] = useState('');
    const { addToast } = useToast();

    const handleDeleteAccount = () => {
        if (deleteInput === 'DELETE MY ACCOUNT') {
            addToast('Account deleted successfully.', 'success');
            onLogout();
        } else {
            addToast('Confirmation text does not match.', 'error');
        }
    };
    return (
        <div className="space-y-8">
            <SectionCard title="Password">
                <div className="flex justify-between items-center">
                    <p className="text-text-secondary dark:text-gray-400">Change your password regularly to keep your account secure.</p>
                     <button onClick={() => addToast('Password change modal would open here.', 'success')} className="px-4 py-2 text-sm font-semibold text-primary dark:text-primary-light border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Change Password</button>
                </div>
            </SectionCard>
             <SectionCard title="Two-Factor Authentication">
                <div className="flex justify-between items-center">
                    <p className="text-text-secondary dark:text-gray-400">Add an extra layer of security to your account.</p>
                     <button onClick={() => addToast('2FA setup modal would open here.', 'success')} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors">Enable 2FA</button>
                </div>
            </SectionCard>
            <div className="bg-danger-bg dark:bg-red-900/20 p-6 rounded-xl border border-danger-border dark:border-red-500/30">
                <h3 className="text-lg font-bold text-danger-text">Danger Zone</h3>
                <p className="text-sm text-red-900/80 dark:text-red-300 mt-2">Deleting your account is a permanent action and cannot be undone.</p>
                <div className="mt-4">
                    <label className="text-sm font-semibold text-red-800 dark:text-red-200">To confirm, please type <strong className="font-mono">DELETE MY ACCOUNT</strong> below.</label>
                    <input type="text" value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)} className="mt-2 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm dark:text-white" />
                    <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE MY ACCOUNT'} className="mt-3 w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:bg-red-300 disabled:cursor-not-allowed">
                        Delete My Account
                    </button>
                </div>
            </div>
        </div>
    );
};

const HelpPanel: React.FC = () => (
    <SectionCard title="Help & Support" description="Need help? Find your answers here.">
        <div className="space-y-4">
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <div>
                    <p className="font-semibold text-text-primary dark:text-white">Documentation</p>
                    <p className="text-sm text-text-secondary dark:text-gray-400">Read our guides and tutorials.</p>
                </div>
            </a>
            <a href="#" className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <div>
                    <p className="font-semibold text-text-primary dark:text-white">Contact Support</p>
                    <p className="text-sm text-text-secondary dark:text-gray-400">Get in touch with our team.</p>
                </div>
            </a>
        </div>
    </SectionCard>
);

const ProfileDashboardPage: React.FC<ProfileDashboardPageProps> = ({ 
    user, 
    onUpdateUser,
    reviewSettings,
    onUpdateReviewSettings,
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
        { id: 'review-settings', name: 'Review Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
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
        : 'Manage your account, review behavior, and security.';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
            <div className="mb-8">
                 <h1 className="text-3xl font-bold text-text-primary dark:text-white mb-1">{pageTitle}</h1>
                 <p className="text-base text-text-secondary dark:text-gray-400">{pageSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                <aside className="md:col-span-1 lg:col-span-1">
                    <nav className="space-y-1 sticky top-32">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                                    activeTab === tab.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary dark:text-gray-400 hover:bg-sidebar-hover dark:hover:bg-gray-700/50'
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
                    {activeTab === 'review-settings' && <ReviewSettingsPanel settings={reviewSettings} onUpdateSettings={onUpdateReviewSettings} />}
                    {activeTab === 'notifications' && <NotificationsPanel settings={notificationSettings} onUpdateSettings={onUpdateNotificationSettings} />}
                    {activeTab === 'security' && <SecurityPanel onLogout={onLogout} />}
                    {activeTab === 'help' && <HelpPanel />}
                </main>
            </div>
        </div>
    );
};

export default ProfileDashboardPage;