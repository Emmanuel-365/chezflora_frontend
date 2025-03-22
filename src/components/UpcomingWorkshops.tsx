"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, Users } from "lucide-react";

interface Workshop {
  id: string;
  title: string;
  date: string;
  places: number;
  link: string;
}

interface UpcomingWorkshopsProps {
  workshops: Workshop[];
  title: string;
}

export default function UpcomingWorkshops({ workshops, title }: UpcomingWorkshopsProps) {
  return (
    <section className="bg-off-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-serif font-medium text-soft-brown mb-8 text-center">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workshops.map((workshop, index) => (
            <motion.div
              key={workshop.id}
              className="bg-white rounded-lg shadow-md p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-medium text-soft-brown mb-4">{workshop.title}</h3>
              <div className="flex items-center text-soft-brown/70 mb-2">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{workshop.date}</span>
              </div>
              <div className="flex items-center text-soft-brown/70 mb-4">
                <Users className="w-5 h-5 mr-2" />
                <span>{workshop.places} places disponibles</span>
              </div>
              <Link to={workshop.link}>
                <span className="inline-block bg-soft-green text-white px-4 py-2 rounded-md hover:bg-soft-green/90 transition-colors">
                  S'inscrire
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}