"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence, Variants, Transition } from "framer-motion";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PageContainer from "../components/PageContainer";
import AuthTabs from "../components/AuthTabs";
import AuthLoginForm from "../components/AuthLoginForm";
import AuthRegisterForm from "../components/AuthRegisterForm";

const AuthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Animation variants
  const pageVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3 },
    },
  };

  const leftColumnVariants: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  const floatingCircleVariants: Variants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity, // Remplace Number.POSITIVE_INFINITY par Infinity
        repeatType: "reverse" as const, // Typage explicite avec "as const"
        ease: "easeInOut",
      } as Transition, // Typage explicite comme Transition
    },
  };

  const logoVariants: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 200,
      },
    },
    hover: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 1.5 },
    },
  };

  return (
    <motion.div initial="initial" animate="animate" exit="exit" variants={pageVariants}>
      <NavBar />
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-center">
            <motion.div className="hidden md:block md:col-span-2 relative" variants={leftColumnVariants}>
              <motion.div
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-light-beige shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-floral-pattern bg-repeat opacity-10"
                  animate={{
                    backgroundPosition: ["0% 0%", "100% 100%"],
                  }}
                  transition={{
                    duration: 60,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-center items-center p-8 text-center">
                  <motion.div className="w-16 h-16 mb-6" variants={logoVariants} whileHover="hover">
                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <motion.path
                        d="M50 10C50 32.0914 67.9086 50 90 50C67.9086 50 50 67.9086 50 90C50 67.9086 32.0914 50 10 50C32.0914 50 50 32.0914 50 10Z"
                        fill="#A8D5BA"
                        fillOpacity="0.8"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: 1,
                          opacity: 0.8,
                          transition: {
                            duration: 1.5,
                            delay: 0.5,
                          },
                        }}
                      />
                      <motion.path
                        d="M70 30C70 41.0457 79.0543 50 90 50C79.0543 50 70 59.0543 70 70C70 59.0543 60.9457 50 50 50C60.9457 50 70 41.0457 70 30Z"
                        fill="#F8C1CC"
                        fillOpacity="0.8"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: 1,
                          opacity: 0.8,
                          transition: {
                            duration: 1.5,
                            delay: 0.8,
                          },
                        }}
                      />
                      <motion.path
                        d="M30 30C30 41.0457 39.0543 50 50 50C39.0543 50 30 59.0543 30 70C30 59.0543 20.9457 50 10 50C20.9457 50 30 41.0457 30 30Z"
                        fill="#A8D5BA"
                        fillOpacity="0.8"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                          pathLength: 1,
                          opacity: 0.8,
                          transition: {
                            duration: 1.5,
                            delay: 1.1,
                          },
                        }}
                      />
                    </svg>
                  </motion.div>
                  <motion.h2
                    className="text-2xl font-serif font-bold text-soft-brown mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: {
                        delay: 1.2,
                        type: "spring",
                        stiffness: 100,
                      },
                    }}
                  >
                    ChezFlora
                  </motion.h2>
                  <motion.p
                    className="text-soft-brown/80"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      transition: {
                        delay: 1.4,
                        type: "spring",
                        stiffness: 100,
                      },
                    }}
                  >
                    Rejoignez notre communauté et découvrez notre sélection de fleurs et plantes pour embellir votre
                    quotidien.
                  </motion.p>
                  <motion.div
                    className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-soft-green/20 flex items-center justify-center"
                    variants={floatingCircleVariants}
                    animate="animate"
                  >
                    <motion.div
                      className="w-6 h-6 rounded-full bg-soft-green/40"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="absolute top-8 right-8 w-10 h-10 rounded-full bg-powder-pink/20 flex items-center justify-center"
                    variants={floatingCircleVariants}
                    animate="animate"
                    transition={{
                      delay: 1.5,
                    }}
                  >
                    <motion.div
                      className="w-5 h-5 rounded-full bg-powder-pink/40"
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: 0.5,
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
            <motion.div
              className="md:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.3,
                  type: "spring",
                  stiffness: 100,
                  damping: 20,
                },
              }}
            >
              <AnimatePresence mode="wait">
                <AuthTabs defaultTab={activeTab} onTabChange={setActiveTab}>
                  {activeTab === "login" ? <AuthLoginForm /> : <AuthRegisterForm />}
                </AuthTabs>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </PageContainer>
      <Footer />
    </motion.div>
  );
};

export default AuthPage;