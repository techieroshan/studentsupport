
import React from 'react';
import { Heart, User as UserIcon, LogOut, Menu, Map, MapPin, Info, HelpCircle } from 'lucide-react';
import { User, UserRole } from '../types';
import VerificationBadge from './VerificationBadge';

interface Props {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  onUpdateLocation?: () => void;
}

const Navbar: React.FC<Props> = ({ currentUser, onLogout, onNavigate, onUpdateLocation }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SEEKER: return 'Student';
      case UserRole.DONOR: return 'Donor';
      case UserRole.ADMIN: return 'Admin';
      default: return 'Guest';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SEEKER: return 'bg-brand-100 text-brand-700 border-brand-200';
      case UserRole.DONOR: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case UserRole.ADMIN: return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div 
            className="flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 rounded p-1" 
            onClick={() => onNavigate('home')}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            aria-label="Student Support Home"
          >
            <div className="bg-brand-600 p-2.5 rounded-full mr-3 shadow-sm">
              <Heart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">StudentSupport</h1>
              <p className="text-[10px] text-brand-600 font-bold uppercase tracking-widest">New Abilities Foundation</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
             <button onClick={() => onNavigate('how-it-works')} className="text-sm font-bold text-slate-600 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1 transition-colors">
                How It Works
             </button>
             <button onClick={() => onNavigate('faq')} className="text-sm font-bold text-slate-600 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1 transition-colors flex items-center">
                FAQ
             </button>
             <button onClick={() => onNavigate('donors')} className="text-sm font-bold text-slate-600 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1 transition-colors">
                Donors
             </button>
             <button onClick={() => onNavigate('browse')} className="text-sm font-bold text-slate-600 hover:text-brand-700 flex items-center focus:outline-none focus:ring-2 focus:ring-brand-500 rounded px-2 py-1 transition-colors">
                <Map className="h-4 w-4 mr-1"/> Browse
             </button>
             
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div 
                    className="hidden lg:flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full cursor-pointer hover:bg-slate-100 hover:text-brand-600 transition border border-transparent hover:border-slate-200"
                    onClick={onUpdateLocation}
                    title="Change Location"
                >
                    <MapPin className="h-3 w-3 mr-1" />
                    {currentUser.city}, {currentUser.country}
                </div>
                <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
                
                {/* Clickable User Profile Block */}
                <button 
                    className="flex flex-col items-end cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition group focus:outline-none focus:ring-2 focus:ring-brand-500"
                    onClick={onUpdateLocation}
                    title="My Profile"
                >
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border ${getRoleColor(currentUser.role)}`}>
                        {getRoleLabel(currentUser.role)}
                    </span>
                    <span className="text-sm text-slate-800 font-bold group-hover:text-brand-700 transition-colors">
                        {currentUser.displayName}
                    </span>
                  </div>
                  <div className="flex items-center mt-0.5">
                     <VerificationBadge status={currentUser.verificationStatus} />
                  </div>
                </button>
                
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onNavigate('login-seeker')}
                  className="px-5 py-2.5 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  Student Login
                </button>
                <button 
                  onClick={() => onNavigate('login-donor')}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 selection:bg-brand-700 selection:text-white"
                >
                  I Want to Help
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden space-x-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="p-2 text-slate-700 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-7 w-7" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-4 shadow-lg animate-in slide-in-from-top-2">
           <button 
                onClick={() => { onNavigate('how-it-works'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-slate-700 font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                How It Works
              </button>
           <button 
                onClick={() => { onNavigate('faq'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-slate-700 font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                FAQ
              </button>
           <button 
                onClick={() => { onNavigate('donors'); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg text-slate-700 font-bold hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                Donors
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
             <div className="px-4 py-2 border-t border-slate-100 mt-2 pt-4" onClick={() => { onUpdateLocation?.(); setIsMenuOpen(false); }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-lg">{currentUser.displayName}</span>
                        <VerificationBadge status={currentUser.verificationStatus} />
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded bg-slate-100 uppercase font-bold text-slate-600 border border-slate-200`}>{getRoleLabel(currentUser.role)}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{currentUser.city}, {currentUser.country}</p>
             </div>
             <button 
                onClick={() => { onUpdateLocation?.(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg bg-slate-50 text-slate-700 font-bold flex items-center hover:bg-slate-100"
              >
                <MapPin className="h-4 w-4 mr-2"/> My Profile / Location
              </button>
             <button 
                onClick={() => { onLogout(); setIsMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-lg bg-red-50 text-red-700 font-bold focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center hover:bg-red-100"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
