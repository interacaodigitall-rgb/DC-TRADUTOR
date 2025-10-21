
import React from 'react';

const Logo: React.FC = () => (
  <div className="flex justify-center items-center mb-4">
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" className="stroke-sky-500" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 7L12 12" className="stroke-sky-500" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 22V12" className="stroke-sky-500" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M22 7L12 12" className="stroke-sky-500" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M17 4.5L7 9.5" className="stroke-sky-400" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  </div>
);

export default Logo;
