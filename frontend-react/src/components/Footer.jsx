import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-500 w-full mt-auto">
      <p>&copy; {new Date().getFullYear()} WattSmart Predictor. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
