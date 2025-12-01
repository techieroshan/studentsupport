import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Loader2, X, Navigation, Languages, ChevronDown, Check, User as UserIcon, ShieldCheck, Mail, Phone, ScanFace, TrendingUp, History } from 'lucide-react';
import { User, UserRole, VerificationStatus } from '../types';
import VerificationBadge from './VerificationBadge';

interface Props {
  currentUser: User;
  onUpdate: (data: Partial<User>) => void;
  onCancel: () => void;
  pastDonations?: number; // New prop for donor history
}

const COUNTRIES = ["United States", "Canada", "United Kingdom", "India", "Australia", "Germany", "France", "Other"];
const LANGUAGES_LIST = ["English", "Spanish", "Mandarin", "Hindi", "Gujarati", "Punjabi", "Marathi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu", "Telugu", "Tamil", "Other"];

const ProfileModal: React.FC<Props> = ({ currentUser, onUpdate, onCancel, pastDonations = 0 }) => {
  const [formData, setFormData] = useState({
    city: currentUser.city,
    state: currentUser.state || '',
    zip: currentUser.zip,
    country: currentUser.country,
    languages: currentUser.languages || ['English'],
    weeklyMealLimit: currentUser.weeklyMealLimit || 5,
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            
            setFormData(prev => ({
                ...prev,
                city: data.city || data.locality || '',
                state: data.principalSubdivision || '',
                country: data.countryName || 'United States',
                zip: data.postcode || ''
            }));
            setError('');
        } catch (err) {
            setError("Could not fetch address details. Please enter manually.");
        } finally {
            setDetecting(false);
        }
    }, () => {
        setError("Unable to retrieve your location.");
        setDetecting(false);
    });
  };

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
        setFormData({ ...formData, languages: formData.languages.filter(l => l !== lang) });
    } else {
        setFormData({ ...formData, languages: [...formData.languages, lang] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city || !formData.state || !formData.zip || !formData.country) {
        setError('All location fields are mandatory.');
        return;
    }
    if (formData.languages.length === 0) {
        setError('Please select at least one language.');
        return;
    }
    
    // Only require reason if location actually changed significantly (simulated check)
    const locationChanged = formData.city !== currentUser.city || formData.zip !== currentUser.zip;
    if (locationChanged && (!formData.reason || formData.reason.length < 5)) {
        setError('Please provide a reason for your location change.');
        return;
    }

    setLoading(true);
    setTimeout(() => {
        onUpdate({
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            languages: formData.languages,
            weeklyMealLimit: Number(formData.weeklyMealLimit)
        });
        setLoading(false);
    }, 800);
  };

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel, loading]);

  // Focus trap: keep focus within modal
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal || loading) return;

    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTab);
    firstElement.focus();

    return () => {
      modal.removeEventListener('keydown', handleTab);
    };
  }, [loading]);

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
            <h3 id="profile-modal-title" className="font-bold flex items-center text-lg">
                <UserIcon className="h-5 w-5 mr-2 text-brand-400" aria-hidden="true" /> My Profile
            </h3>
            <button onClick={onCancel} className="p-1 hover:bg-slate-700 rounded-full transition">
                <X className="h-5 w-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
            
            {/* Header Info */}
            <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-full border-2 ${currentUser.role === UserRole.SEEKER ? 'bg-brand-50 border-brand-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <UserIcon className={`h-8 w-8 ${currentUser.role === UserRole.SEEKER ? 'text-brand-600' : 'text-emerald-600'}`} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">{currentUser.displayName}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            currentUser.role === UserRole.SEEKER ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                            {currentUser.role}
                        </span>
                        <VerificationBadge status={currentUser.verificationStatus} />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{currentUser.email}</p>
                </div>
            </div>

            {/* Verification Steps */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verification Status
                </h4>
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-slate-700"><Mail className="h-3 w-3 mr-2 text-slate-600"/> Email Verified</span>
                        {currentUser.emailVerified ? <Check className="h-4 w-4 text-green-600" /> : <span className="text-xs text-amber-600 font-bold">Pending</span>}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-slate-700"><Phone className="h-3 w-3 mr-2 text-slate-600"/> Phone Verified</span>
                        <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-slate-700"><ScanFace className="h-3 w-3 mr-2 text-slate-600"/> Identity Check</span>
                        {currentUser.verificationStatus === VerificationStatus.VERIFIED ? <Check className="h-4 w-4 text-green-600" /> : <span className="text-xs text-amber-600 font-bold">Pending</span>}
                    </div>
                </div>
            </div>

            {/* Donor Capacity & History */}
            {currentUser.role === UserRole.DONOR && (
                <>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                        <h4 className="text-xs font-bold text-emerald-800 uppercase mb-3 flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Weekly Capacity
                        </h4>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-emerald-900 font-medium">Meals per week committed:</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="50"
                                value={formData.weeklyMealLimit}
                                onChange={e => setFormData({...formData, weeklyMealLimit: parseInt(e.target.value) || 0})}
                                className="w-16 px-2 py-1 text-center rounded border border-emerald-300 bg-white text-emerald-900 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold"
                            />
                        </div>
                        <div className="w-full bg-emerald-200 rounded-full h-2">
                            <div 
                                className="bg-emerald-700 h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${Math.min(((currentUser.currentWeeklyMeals || 0) / (formData.weeklyMealLimit || 1)) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-emerald-700 mt-2 text-right">
                            {currentUser.currentWeeklyMeals || 0} / {formData.weeklyMealLimit} meals provided this week
                        </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                            <History className="h-3 w-3 mr-1" /> Contribution History
                        </h4>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-700">Total Meals Donated</span>
                            <span className="text-lg font-bold text-emerald-600">{pastDonations}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2">Thank you for making a difference!</p>
                    </div>
                </>
            )}

            {/* Languages */}
            <div>
                 <label className="block text-xs font-bold text-slate-700 mb-2 uppercase flex items-center">
                    <Languages className="h-4 w-4 mr-1 text-slate-500" /> Languages Spoken
                 </label>
                 <div className="relative" ref={dropdownRef}>
                    <button 
                       type="button"
                       onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                       className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-left flex justify-between items-center focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    >
                       <span className="text-sm text-slate-700 truncate">
                          {formData.languages.length > 0 
                             ? `${formData.languages.length} selected` 
                             : "Select languages..."}
                       </span>
                       <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangDropdownOpen && (
                       <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                          {LANGUAGES_LIST.map(lang => (
                             <div 
                                key={lang}
                                onClick={() => toggleLanguage(lang)}
                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                             >
                                <span className="text-sm text-slate-700">{lang}</span>
                                {formData.languages.includes(lang) && <Check className="h-4 w-4 text-brand-600" />}
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
                 <div className="flex flex-wrap gap-2 mt-2">
                    {formData.languages.map(lang => (
                        <span key={lang} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                           {lang}
                           <button type="button" onClick={() => toggleLanguage(lang)} className="ml-1 hover:text-red-600 focus:outline-none">×</button>
                        </span>
                    ))}
                 </div>
            </div>

            {/* Location Update */}
            <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-brand-600" /> 
                    Current Location
                    </h4>
                    <button 
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={detecting}
                        className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center"
                    >
                        {detecting ? <Loader2 className="animate-spin h-3 w-3 mr-1"/> : <Navigation className="h-3 w-3 mr-1"/>}
                        Detect
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                        <input 
                            type="text" 
                            value={formData.city}
                            onChange={e => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                        <select 
                            value={formData.country}
                            onChange={e => setFormData({...formData, country: e.target.value})}
                            className="w-full bg-white px-2 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        >
                            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                        <input 
                            type="text" 
                            value={formData.state}
                            onChange={e => setFormData({...formData, state: e.target.value})}
                            className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Zip</label>
                        <input 
                            type="text" 
                            value={formData.zip}
                            onChange={e => setFormData({...formData, zip: e.target.value})}
                            className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Move (If changed)</label>
                    <textarea 
                        value={formData.reason}
                        onChange={e => setFormData({...formData, reason: e.target.value})}
                        placeholder="e.g. Relocated for internship..."
                        rows={2}
                        className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none ${error ? 'border-red-500' : 'border-slate-300'}`}
                    />
                </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{error}</p>}

            <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 flex items-center transition"
                >
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Save Changes
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;