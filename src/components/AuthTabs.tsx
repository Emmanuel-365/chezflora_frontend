import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthTabsProps {
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
  children: React.ReactNode; // Ajout de children
}

const AuthTabs: React.FC<AuthTabsProps> = ({
  defaultTab = 'login',
  onTabChange,
  className = '',
  children,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative mb-8">
        <div className="flex justify-center space-x-2 relative z-10">
          <button
            onClick={() => handleTabChange('login')}
            className={`
              relative flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeTab === 'login' ? 'text-soft-brown' : 'text-soft-brown/60 hover:text-soft-brown/80'}
            `}
          >
            <span className="flex items-center">
              <LogIn className="mr-2 h-4 w-4" />
              Connexion
            </span>
            {activeTab === 'login' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-light-beige rounded-full -z-10"
                initial={false}
                transition={{ type: 'spring', duration: 0.6 }}
              />
            )}
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`
              relative flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeTab === 'register' ? 'text-soft-brown' : 'text-soft-brown/60 hover:text-soft-brown/80'}
            `}
          >
            <span className="flex items-center">
              <UserPlus className="mr-2 h-4 w-4" />
              Inscription
            </span>
            {activeTab === 'register' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-light-beige rounded-full -z-10"
                initial={false}
                transition={{ type: 'spring', duration: 0.6 }}
              />
            )}
          </button>
        </div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-light-beige -z-20 transform -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-pastel-pink transform -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-pastel-green transform -translate-y-1/2 translate-x-1/2"></div>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-light-beige/30 p-6 shadow-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-10 pointer-events-none"></div>
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
};

export default AuthTabs;