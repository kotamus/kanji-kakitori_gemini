import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FastForward } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface SettingsScreenProps {
    onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
    const { skipEnabled, updateSkip, problemCount, updateCount } = useSettings();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col items-center min-h-screen bg-gray-50 p-4"
        >
            <div className="w-full max-w-lg flex justify-between items-center mb-8">
                <button onClick={onBack} className="p-2 bg-white rounded-full shadow hover:bg-gray-100">
                    <ArrowLeft className="text-gray-600" />
                </button>
                <div className="text-xl font-bold text-gray-700">せってい</div>
                <div className="w-10" />
            </div>

            <div className="w-full max-w-md space-y-8">
                {/* Skip Button Setting */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <FastForward className="text-blue-500" />
                            <span className="text-lg font-bold text-gray-800">スキップボタン</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={skipEnabled}
                                onChange={(e) => updateSkip(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>

                {/* Problem Count Setting */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">もんだいすう: {problemCount}もん</h3>

                    <div className="flex justify-between items-center gap-2">
                        {[2, 3, 5, 8, 10].map((count) => (
                            <button
                                key={count}
                                onClick={() => updateCount(count)}
                                className={`w-12 h-12 rounded-full font-bold text-lg flex items-center justify-center transition-all ${problemCount === count
                                    ? 'bg-orange-500 text-white shadow-md scale-110'
                                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                    <input
                        type="range"
                        min="2"
                        max="10"
                        value={problemCount}
                        onChange={(e) => updateCount(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-6 accent-orange-500"
                    />
                </div>
            </div>
        </motion.div>
    );
};
