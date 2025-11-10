import React from 'react';
import { useToast } from '../../contexts/ToastContext';
import SectionCard from '../shared/SectionCard';

interface BillingPanelProps {
    plan: {
        name: string;
        reviewsUsed: number;
        reviewsLimit: number;
    };
    onUpgrade: () => void;
}

const BillingPanel: React.FC<BillingPanelProps> = ({ plan, onUpgrade }) => {
    const usagePercentage = plan.reviewsLimit > 0 ? (plan.reviewsUsed / plan.reviewsLimit) * 100 : 0;
    const { addToast } = useToast();
    const hasCredits = plan.reviewsUsed < plan.reviewsLimit;

    const invoices: any[] = [];

    return (
        <div className="space-y-8">
            <SectionCard 
                title="Current Plan"
                rightContent={
                     <div className="flex items-center gap-3 flex-wrap justify-end">
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
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${usagePercentage}%` }}
                    ></div>
                </div>
                {!hasCredits && (
                    <div className="mt-4 p-4 text-center bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 rounded-lg">
                        <p className="font-semibold text-orange-800 dark:text-orange-200">You've used all your credits!</p>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">To continue analyzing designs, please upgrade your plan.</p>
                        <button 
                            onClick={onUpgrade} 
                            className="mt-3 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-light rounded-lg transition-colors"
                        >
                            Upgrade Your Plan
                        </button>
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Payment Method">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <p className="text-text-secondary dark:text-gray-400">No payment method on file.</p>
                    <button className="px-4 py-2 text-sm font-semibold text-primary border dark:text-primary-light border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">Add Payment Method</button>
                </div>
            </SectionCard>
            
            <SectionCard title="Invoice History">
                <div className="overflow-x-auto">
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
                </div>
            </SectionCard>
        </div>
    );
};

export default BillingPanel;