import React from 'react';
import Navbar from './Navbar';
import DailyRewardModal from './DailyRewardModal';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      <DailyRewardModal />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;