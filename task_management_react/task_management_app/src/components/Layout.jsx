import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ user, onLogout }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      {/* 1. Sidebar - Passing user prop for dynamic name/role display */}
      <Sidebar user={user} />

      {/* 2. Right Side Wrapper - Vertical stack of Header and Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* 3. Header - Passing user for profile and onLogout for functionality */}
        <Header user={user} onLogout={onLogout} />

        {/* 4. Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="p-8 max-w-7xl mx-auto w-full h-full">
            {/* The Outlet renders the current page. 
                The layout props (user) can also be passed via context if needed,
                but standard routing handles the page components via App.js.
            */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;