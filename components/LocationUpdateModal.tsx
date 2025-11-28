
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Globe, Loader2, Save, X, Navigation, Languages, ChevronDown, Check, User as UserIcon } from 'lucide-react';
import { User, UserRole } from '../types';

interface Props {
  currentUser: User;
  onUpdate: (data: { city: string; state: string; zip: string; country: string; reason: string; languages: string[] }) => void;
  onCancel: () => void;
}

const COUNTRIES = ["United States", "Canada", "United Kingdom", "India", "Australia", "Germany", "France", "Other"];
const LANGUAGES_LIST = ["English", "Spanish", "Mandarin", "Hindi", "Gujarati", "Punjabi", "Marathi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu", "Telugu", "Tamil", "Other"];

const LocationUpdateModal: React.FC<Props> = ({ currentUser, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    city: currentUser.city,
    state: currentUser.state || '',
    zip: currentUser.zip,
    country: currentUser.country,
    reason: '',
    languages: currentUser.languages || ['English']
  });
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState('');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
            // Using a free reverse geocoding API for demo purposes
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
    if (!formData.reason.trim()) {
      setError('A reason is required for location changes for security tracking.');
      return;
    }
    if (formData.reason.length < 10) {
      setError('Please provide a clearer reason (e.g. "Relocated for new semester").');
      return;
    }
    if (!formData.city || !formData.state || !formData.zip || !formData.country) {
        setError('All location fields are mandatory.');
        return;
    }
    if (formData.languages.length === 0) {
        setError('Please select at least one language.');
        return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        onUpdate(formData);
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-brand-400" /> Update Profile & Location
            </h3>
            <button onClick={onCancel} className="p-1 hover:bg-slate-700 rounded-full transition">
                <X className="h-5 w-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* User Info Header with Role */}
            <div className="flex items-center space-x-3 mb-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
               <div className={`p-2 rounded-full border border-slate-200 ${currentUser.role === UserRole.SEEKER ? 'bg-brand-100' : 'bg-emerald-100'}`}>
                  <UserIcon className={`h-5 w-5 ${currentUser.role === UserRole.SEEKER ? 'text-brand-600' : 'text-emerald-600'}`} />
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-900">{currentUser.displayName}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentUser.role === UserRole.SEEKER ? 'bg-brand-100 text-brand-700 border border-brand-200' : 
                      currentUser.role === UserRole.DONOR ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                      {currentUser.role === UserRole.SEEKER ? 'Student' : currentUser.role === UserRole.DONOR ? 'Donor' : currentUser.role}
                  </span>
               </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 mb-4">
                <strong>Note:</strong> Frequent location changes may trigger a re-verification check.
            </div>

            <button 
                type="button"
                onClick={handleDetectLocation}
                disabled={detecting}
                className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg border border-brand-200 flex items-center justify-center transition mb-4"
            >
                {detecting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Navigation className="h-4 w-4 mr-2" />}
                {detecting ? "Detecting..." : "Auto-Detect Current Location"}
            </button>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <select 
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        className="w-full bg-white pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input 
                        type="text" 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State/Prov</label>
                    <input 
                        type="text" 
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value})}
                        className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                        required
                    />
                </div>
            </div>
            
            <div>
                 <label className="block text-xs font-bold text-slate-700 mb-1">Zip/Postal Code</label>
                 <input 
                    type="text" 
                    value={formData.zip}
                    onChange={e => setFormData({...formData, zip: e.target.value})}
                    className="w-full bg-white px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Move (Required)</label>
                <textarea 
                    value={formData.reason}
                    onChange={e => setFormData({...formData, reason: e.target.value})}
                    placeholder="e.g. Returned to campus, Internship in new city..."
                    rows={2}
                    className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none resize-none ${error ? 'border-red-500' : 'border-slate-300'}`}
                />
            </div>

            <div className="pt-2 border-t border-slate-200">
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
                             ? `${formData.languages.length} selected (${formData.languages.slice(0, 2).join(', ')}${formData.languages.length > 2 ? '...' : ''})` 
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

            {error && <p className="text-xs text-red-600 mt-1 font-bold bg-red-50 p-2 rounded">{error}</p>}

            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 flex items-center transition"
                >
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Update Profile
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LocationUpdateModal;
