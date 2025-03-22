import React from 'react';

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const CardContainer: React.FC<CardContainerProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      className={`
        relative overflow-hidden rounded-xl bg-light-beige p-6 shadow-md
        ${hoverable ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-floral-pattern bg-no-repeat bg-contain"></div>
      </div>
      {children}
    </div>
  );
};

export default CardContainer;