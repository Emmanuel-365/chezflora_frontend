"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

interface ServicesOverviewProps {
  services: Service[];
  title: string;
}

export default function ServicesOverview({ services, title }: ServicesOverviewProps) {
  return (
    <section className="bg-light-beige py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-medium text-soft-brown mb-12 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-16 h-16 bg-soft-green/20 rounded-full flex items-center justify-center mb-4">
                {service.icon}
              </div>
              <h3 className="text-xl font-medium text-soft-brown mb-2">{service.title}</h3>
              <p className="text-soft-brown/70 mb-4">{service.description}</p>
              <Link to={service.link}>
                <span className="text-soft-green hover:underline mt-auto">En savoir plus</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}