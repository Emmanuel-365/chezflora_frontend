"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus } from "lucide-react";

interface AuthTabsProps {
  defaultTab?: "login" | "register"; // Restreint à "login" | "register"
  onTabChange?: (tabId: "login" | "register") => void; // Restreint à "login" | "register"
  className?: string;
  children: React.ReactNode;
}

const AuthTabs: React.FC<AuthTabsProps> = ({ defaultTab = "login", onTabChange, className = "", children }) => {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [hoveredTab, setHoveredTab] = useState<"login" | "register" | null>(null);

  const handleTabChange = (tabId: "login" | "register") => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const tabsContainerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      },
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 },
    },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        when: "beforeChildren",
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
        delay: 0.5,
      },
    },
  };

  const floralPatternVariants = {
    hidden: { opacity: 0, rotate: -5 },
    visible: {
      opacity: 0.1,
      rotate: 0,
      transition: { duration: 0.8, delay: 0.3 },
    },
  };

  const lineVariants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div className={`w-full ${className}`} initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="relative mb-8" variants={tabsContainerVariants}>
        <div className="flex justify-center space-x-2 relative z-10">
          <motion.button
            onClick={() => handleTabChange("login")}
            onHoverStart={() => setHoveredTab("login")}
            onHoverEnd={() => setHoveredTab(null)}
            className={`
              relative flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeTab === "login" ? "text-soft-brown" : "text-soft-brown/60 hover:text-soft-brown/80"}
            `}
            variants={tabVariants}
            whileTap="tap"
          >
            <motion.span
              className="flex items-center"
              animate={hoveredTab === "login" && activeTab !== "login" ? { x: [0, -2, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={activeTab === "login" ? { rotate: [0, -10, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <LogIn className="mr-2 h-4 w-4" />
              </motion.div>
              Connexion
            </motion.span>
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-light-beige rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  duration: 0.6,
                }}
              />
            )}
          </motion.button>

          <motion.button
            onClick={() => handleTabChange("register")}
            onHoverStart={() => setHoveredTab("register")}
            onHoverEnd={() => setHoveredTab(null)}
            className={`
              relative flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
              ${activeTab === "register" ? "text-soft-brown" : "text-soft-brown/60 hover:text-soft-brown/80"}
            `}
            variants={tabVariants}
            whileTap="tap"
          >
            <motion.span
              className="flex items-center"
              animate={hoveredTab === "register" && activeTab !== "register" ? { x: [0, -2, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                animate={activeTab === "register" ? { rotate: [0, -10, 0], scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <UserPlus className="mr-2 h-4 w-4" />
              </motion.div>
              Inscription
            </motion.span>
            {activeTab === "register" && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute inset-0 bg-light-beige rounded-full -z-10"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  duration: 0.6,
                }}
              />
            )}
          </motion.button>
        </div>

        <motion.div
          className="absolute top-1/2 left-0 right-0 h-px bg-light-beige -z-20 transform -translate-y-1/2"
          variants={lineVariants}
        />

        <motion.div
          className="absolute top-1/2 left-1/4 w-2 h-2 rounded-full bg-pastel-pink transform -translate-y-1/2 -translate-x-1/2"
          variants={dotVariants}
          animate={{
            y: ["-50%", "-60%", "-50%", "-40%", "-50%"],
            scale: [1, 1.1, 1, 0.9, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <motion.div
          className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-pastel-green transform -translate-y-1/2 translate-x-1/2"
          variants={dotVariants}
          animate={{
            y: ["-50%", "-40%", "-50%", "-60%", "-50%"],
            scale: [1, 0.9, 1, 1.1, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1,
          }}
        />
      </motion.div>

      <motion.div
        className="relative overflow-hidden rounded-xl bg-light-beige/30 p-6 shadow-md"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ boxShadow: "0 8px 30px rgba(0, 0, 0, 0.05)" }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute top-0 right-0 w-32 h-32 bg-floral-pattern bg-no-repeat bg-contain opacity-10 pointer-events-none"
          variants={floralPatternVariants}
          animate={{
            rotate: [0, 2, 0, -2, 0],
            scale: [1, 1.02, 1, 0.98, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="relative z-10"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default AuthTabs;