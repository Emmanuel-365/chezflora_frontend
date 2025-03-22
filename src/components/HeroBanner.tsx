"use client";

import { motion } from "framer-motion";
import ButtonPrimary from "./ButtonPrimary";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
}

export default function HeroBanner({ title, subtitle, buttonText, buttonLink, backgroundImage }: HeroBannerProps) {
  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <img
        src={backgroundImage || "/images/hero-fleurs.jpg"}
        alt="Bannière ChezFlora"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-soft-brown/50 to-transparent" />
      <div className="absolute inset-0 bg-floral-pattern bg-repeat opacity-10" />
      <div className="relative h-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <motion.h1
          className="text-4xl md:text-6xl font-serif font-bold text-white mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {title}
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ButtonPrimary href={buttonLink} size="lg" className="bg-soft-green hover:bg-soft-green/90">
            {buttonText}
          </ButtonPrimary>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-off-white to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
    </div>
  );
}