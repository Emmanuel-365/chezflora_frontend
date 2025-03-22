import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="relative w-12 h-12">
        <div className="absolute w-full h-full animate-spin">
          <div className="absolute top-0 left-1/2 -ml-1 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom"></div>
          <div className="absolute top-1/4 right-1/4 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-45"></div>
          <div className="absolute bottom-1/4 right-0 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-90"></div>
          <div className="absolute bottom-0 right-1/4 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-135"></div>
          <div className="absolute bottom-1/4 left-0 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-180"></div>
          <div className="absolute bottom-0 left-1/4 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-225"></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-270"></div>
          <div className="absolute top-0 right-1/4 w-2 h-5 rounded-full bg-[#A8D5BA] origin-bottom rotate-315"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F8C1CC]"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;