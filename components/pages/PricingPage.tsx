import React, { useState } from 'react';

interface PricingPageProps {
  onBack: () => void;
}

const CheckIcon = () => (
    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


const PricingPage: React.FC<PricingPageProps> = ({ onBack }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Hobby',
            price: { monthly: 0, yearly: 0 },
            description: 'For personal projects & learning the ropes.',
            features: [
                '5 analyses per month',
                'Standard UI/UX checks',
                'PDF report exports',
                'Limited history access',
                'Community support',
            ],
            cta: 'Get Started',
            isPopular: false,
        },
        {
            name: 'Pro',
            price: { monthly: 29, yearly: 24 },
            description: 'For professionals & small teams who need more power.',
            features: [
                '100 analyses per month',
                'Advanced UI/UX checks',
                'Full history access',
                'Email support',
                'PDF report exports',
            ],
            cta: 'Upgrade to Pro',
            isPopular: true,
        },
        {
            name: 'Enterprise',
            price: { monthly: 'Custom', yearly: 'Custom' },
            description: 'For large organizations with specific needs.',
            features: [
                'Unlimited analyses',
                'Team collaboration features',
                'API Access',
                'Dedicated support',
                'Custom integrations',
            ],
            cta: 'Contact Sales',
            isPopular: false,
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pb-24">
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary-light font-medium transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back to Home
                </button>
            </div>
            
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-text-primary dark:text-white">
                    Find the perfect plan
                </h1>
                <p className="mt-4 text-md sm:text-lg text-text-secondary dark:text-gray-400 max-w-2xl mx-auto">
                    Start for free, then upgrade to a plan that fits your needs. All plans come with our core analysis features.
                </p>
            </div>
            
            <div className="mt-10 flex justify-center items-center gap-4">
                <span className={`font-semibold ${billingCycle === 'monthly' ? 'text-primary' : 'text-text-secondary dark:text-gray-400'}`}>Monthly</span>
                <label htmlFor="billing-toggle" className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        id="billing-toggle"
                        className="sr-only peer"
                        checked={billingCycle === 'yearly'}
                        onChange={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary-light peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
                <span className={`font-semibold ${billingCycle === 'yearly' ? 'text-primary' : 'text-text-secondary dark:text-gray-400'}`}>
                    Yearly <span className="text-sm font-medium text-green-600">(Save 13%)</span>
                </span>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {plans.map((plan) => (
                    <div key={plan.name} className={`relative bg-white dark:bg-gray-800 border rounded-2xl p-8 flex flex-col shadow-lg ${plan.isPopular ? 'border-primary' : 'border-gray-200 dark:border-gray-700'}`}>
                        {plan.isPopular && (
                            <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                MOST POPULAR
                            </div>
                        )}
                        <h3 className="text-xl font-bold text-text-primary dark:text-white">{plan.name}</h3>
                        <p className="text-text-secondary dark:text-gray-400 mt-2 flex-grow">{plan.description}</p>
                        
                        <div className="mt-6">
                            <span className="text-5xl font-black text-text-primary dark:text-white">
                                {typeof plan.price[billingCycle] === 'number' ? `$${plan.price[billingCycle]}` : plan.price[billingCycle]}
                            </span>
                             {typeof plan.price[billingCycle] === 'number' && (
                                <span className="text-lg font-semibold text-text-secondary dark:text-gray-400">
                                    / {billingCycle === 'monthly' ? 'mo' : 'yr'}
                                </span>
                            )}
                        </div>
                        
                        <ul className="mt-8 space-y-4">
                            {plan.features.map(feature => (
                                <li key={feature} className="flex items-start gap-3">
                                    <CheckIcon />
                                    <span className="text-text-secondary dark:text-gray-400">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10">
                             <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200
                                ${plan.isPopular ? 'text-white bg-primary hover:bg-primary-light' : 'bg-gray-100 dark:bg-gray-700 text-primary dark:text-primary-light hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                 {plan.cta}
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PricingPage;