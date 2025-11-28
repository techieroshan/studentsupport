
import React from 'react';
import { Heart, User as UserIcon, LogOut, Menu, Map, MapPin } from 'lucide-react';
import { User, UserRole } from '../types';

interface Props {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onUpdateLocation?: () => void;
}

const Navbar: React.FC<Props> = ({ currentUser, onLogout, onNavigate, onUpdateLocation }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div 
            className="flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded p-1" 
            onClick={() => onNavigate('home')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            aria-label="Student Support Home"
          >
            <div className="bg-brand-600 p-2 rounded-full mr-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">StudentSupport</h1>
              <p className="text-xs text-brand-700 font-bold uppercase tracking-wider">New Abilities Foundation</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
             <a href="https://newabilities.org" target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-600 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">
                Foundation Home
             </a>
             <button onClick={() => onNavigate('donors')} className="text-sm font-bold text-slate-600 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">
                Donors & Partners
             </button>
             <button onClick={() => onNavigate('browse')} className="text-sm font-bold text-slate-600 hover:text-brand-700 flex items-center focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1">
                <Map className="h-4 w-4 mr-1"/> Browse
             </button>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div 
                    className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-100 hover:text-brand-600 transition"
                    onClick={onUpdateLocation}
                    title="Change Location"
                >
                    <MapPin className="h-3 w-3 mr-1" />
                    {currentUser.city}, {currentUser.country}
                </div>
                <div className="h-4 w-px bg-slate-300"></div>
                <span className="text-sm text-slate-700">
                  Hi, <span className="font-bold">{currentUser.displayName}</span>
                </span>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-slate-700 rounded-full hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onNavigate('login-seeker')}
                  className="px-4 py-2 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  Student Login
                </button>
                <button 
                  onClick={() => onNavigate('login-donor')}
                  className="px-4 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                  I Want to Help
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg">
          <a href="https://newabilities.org" className="block text-sm font-bold text-slate-700 py-2">Foundation Home</a>
           <button 
                onClick={() => { onNavigate('donors'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-slate-700 font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Donors & Partners
              </button>
           <button 
                onClick={() => { onNavigate('browse'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-slate-700 font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Browse Map
              </button>
          {!currentUser ? (
            <>
              <button 
                onClick={() => { onNavigate('login-seeker'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg bg-brand-50 text-brand-800 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Student Login
              </button>
              <button 
                 onClick={() => { onNavigate('login-donor'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg bg-brand-600 text-white font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              >
                I Want to Help
              </button>
            </>
          ) : (
            <>
             <button 
                onClick={() => { onUpdateLocation?.(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 font-bold flex items-center"
              >
                <MapPin className="h-4 w-4 mr-2"/> Update Location
              </button>
             <button 
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg bg-slate-100 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
