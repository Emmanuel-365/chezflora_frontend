"use client"

import type React from "react"
import { motion } from "framer-motion"

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "medium", className = "" }) => {
  // Determine size dimensions
  const dimensions = {
    small: {
      container: "w-8 h-8",
      petal: "w-1.5 h-3.5",
      center: "w-3 h-3",
    },
    medium: {
      container: "w-12 h-12",
      petal: "w-2 h-5",
      center: "w-4 h-4",
    },
    large: {
      container: "w-16 h-16",
      petal: "w-2.5 h-6",
      center: "w-5 h-5",
    },
  }[size]

  // Create an array of 8 petals
  const petals = Array.from({ length: 8 }, (_, i) => i)

  // Animation variants
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 3,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop" as const,
      },
    },
  }

  const petalVariants = {
    animate: (i: number) => ({
      scaleY: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1.5,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        delay: i * 0.15,
        ease: "easeInOut",
      },
    }),
  }

  const centerVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  }

  return (
    <div className={`flex justify-center items-center p-4 ${className}`}>
      <div className={`relative ${dimensions.container}`}>
        {/* Rotating container for petals */}
        <motion.div className="absolute w-full h-full" variants={containerVariants} animate="animate">
          {petals.map((index) => (
            <motion.div
              key={index}
              className={`absolute top-0 left-1/2 -ml-1 ${dimensions.petal} rounded-full bg-[#A8D5BA] origin-bottom`}
              style={{
                rotate: `${index * 45}deg`,
                transformOrigin: "bottom center",
              }}
              variants={petalVariants}
              custom={index}
              animate="animate"
            />
          ))}
        </motion.div>

        {/* Center of the flower */}
        <motion.div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${dimensions.center} rounded-full bg-[#F8C1CC]`}
          variants={centerVariants}
          animate="animate"
        />
      </div>
    </div>
  )
}

export default LoadingSpinner

