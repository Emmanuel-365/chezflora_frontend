import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import AuthTabs from '../components/AuthTabs';
import AuthLoginForm from '../components/AuthLoginForm';
import AuthRegisterForm from '../components/AuthRegisterForm';

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <>
      <NavBar />
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <motion.div
              className="hidden md:block md:col-span-2 relative"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-light-beige shadow-lg">
                <div className="absolute inset-0 bg-floral-pattern bg-repeat opacity-10"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">
                  <div className="w-16 h-16 mb-6">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 10C50 32.0914 67.9086 50 90 50C67.9086 50 50 67.9086 50 90C50 67.9086 32.0914 50 10 50C32.0914 50 50 32.0914 50 10Z" fill="#A8D5BA" fillOpacity="0.8" />
                      <path d="M70 30C70 41.0457 79.0543 50 90 50C79.0543 50 70 59.0543 70 70C70 59.0543 60.9457 50 50 50C60.9457 50 70 41.0457 70 30Z" fill="#F8C1CC" fillOpacity="0.8" />
                      <path d="M30 30C30 41.0457 39.0543 50 50 50C39.0543 50 30 59.0543 30 70C30 59.0543 20.9457 50 10 50C20.9457 50 30 41.0457 30 30Z" fill="#A8D5BA" fillOpacity="0.8" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-soft-brown mb-4">ChezFlora</h2>
                  <p className="text-soft-brown/80">Rejoignez notre communauté et découvrez notre sélection de fleurs et plantes pour embellir votre quotidien.</p>
                  <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-soft-green/20 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-soft-green/40"></div>
                  </div>
                  <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-powder-pink/20 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-powder-pink/40"></div>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="md:col-span-3">
              <AuthTabs defaultTab={activeTab} onTabChange={setActiveTab}>
                {activeTab === 'login' ? <AuthLoginForm /> : <AuthRegisterForm />}
              </AuthTabs>
            </div>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </>
  );
};

export default AuthPage;