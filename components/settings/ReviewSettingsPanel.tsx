import React from 'react';
import { ReviewSettings } from '../../App';
import SectionCard from '../shared/SectionCard';
import ToggleSwitch from '../shared/ToggleSwitch';
import Slider from '../shared/Slider';

interface ReviewSettingsPanelProps {
    settings: ReviewSettings;
    onUpdateSettings: (updates: Partial<ReviewSettings>) => void;
}

const ReviewSettingsPanel: React.FC<ReviewSettingsPanelProps> = ({ settings, onUpdateSettings }) => {
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

export default ReviewSettingsPanel;
