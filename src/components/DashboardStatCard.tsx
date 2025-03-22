import React from 'react';
import { motion } from 'framer-motion';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  color?: 'green' | 'pink' | 'brown';
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'green',
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-[#A8D5BA]/10 text-soft-green';
      case 'pink':
        return 'bg-[#F8C1CC]/10 text-powder-pink';
      case 'brown':
        return 'bg-[#D2B48C]/10 text-soft-brown';
      default:
        return 'bg-[#A8D5BA]/10 text-soft-green';
    }
  };

  return (
    <motion.div
      className={`rounded-xl p-6 ${getColorClasses()} relative overflow-hidden`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-soft-brown">{title}</h3>
        <div className={`p-2 rounded-full ${getColorClasses()}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-soft-brown mb-2">{value}</div>
      {trend && (
        <div className={`flex items-center text-sm ${trend.isPositive ? 'text-soft-green' : 'text-powder-pink'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          <span className="ml-1 text-soft-brown/60">vs last month</span>
        </div>
      )}
      <div className="absolute top-0 right-0 w-16 h-16 bg-floral-pattern bg-no-repeat bg-contain opacity-10 transform rotate-90" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-floral-pattern bg-no-repeat bg-contain opacity-10 transform -rotate-90" />
    </motion.div>
  );
};

export default DashboardStatCard;