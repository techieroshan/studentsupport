import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ScanFace, CheckCircle2, Loader2, FileCheck, MapPin, User, Mail, Phone, Globe, Home, KeyRound, Languages, ArrowLeft, Navigation, ChevronDown, Check, Building2 } from 'lucide-react';
import { UserRole, DonorCategory } from '../types';

interface OnboardingData {
  email: string;
  password?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  radius: number;
  avatarId: number;
  displayName: string;
  languages: string[];
  donorCategory?: DonorCategory;
}

interface Props {
  initialMode: 'LOGIN' | 'REGISTER';
  targetRole: UserRole;
  onComplete: (data: OnboardingData, isLogin: boolean) => void;
  onCancel: () => void;
}

const AVATARS = [
  "https://picsum.photos/seed/student1/200",
  "https://picsum.photos/seed/student2/200",
  "https://picsum.photos/seed/student3/200",
  "https://picsum.photos/seed/student4/200",
  "https://picsum.photos/seed/donor1/200",
  "https://picsum.photos/seed/donor2/200",
  "https://picsum.photos/seed/tech/200",
  "https://picsum.photos/seed/art/200"
];

const COUNTRIES = ["United States", "Canada", "United Kingdom", "India", "Australia", "Germany", "France", "Other"];
const LANGUAGES_LIST = ["English", "Spanish", "Mandarin", "Hindi", "Gujarati", "Punjabi", "Marathi", "French", "Arabic", "Bengali", "Portuguese", "Russian", "Urdu", "Telugu", "Tamil", "Other"];

const AuthModal: React.FC<Props> = ({ initialMode, targetRole, onComplete, onCancel }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'>(initialMode);
  const [verificationStep, setVerificationStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [awaitingEmail, setAwaitingEmail] = useState(false);
  
  const [resetSent, setResetSent] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<OnboardingData>({
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    radius: 20,
    avatarId: 0,
    displayName: targetRole === UserRole.SEEKER ? 'Anonymous Student' : 'Kind Neighbor',
    languages: ['English'],
    donorCategory: targetRole === UserRole.DONOR ? DonorCategory.INDIVIDUAL : undefined
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});

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

  const verificationSteps = targetRole === UserRole.SEEKER 
    ? [
        { title: 'University Email Check', desc: `Validating enrollment for ${formData.email}...`, icon: FileCheck },
        { title: 'Distance Check', desc: `Verifying permanent address is >30 miles from ${formData.zip}...`, icon: CheckCircle2 },
        { title: 'Persona Identity Verification', desc: 'Analyzing government ID and selfie match...', icon: ScanFace },
      ]
    : [
        { title: 'Identity Verification', desc: 'Validating government ID via Persona™...', icon: ScanFace },
        { title: 'Background Check', desc: 'Performing standard community safety check...', icon: ShieldCheck },
      ];

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
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
        } catch (err) {
            console.error("Geo error", err);
        } finally {
            setDetecting(false);
        }
    }, () => setDetecting(false));
  };

  const validateRegister = () => {
    const newErrors: any = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (targetRole === UserRole.SEEKER && !formData.email.endsWith('.edu') && !formData.email.includes('admin')) newErrors.email = 'Must be a valid .edu email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Full street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip) newErrors.zip = 'Zip is required';
    if (formData.languages.length === 0) newErrors.languages = 'Select at least one language';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateRegister()) return;
    setProcessing(true);
    
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVerificationStep(current);
      if (current >= verificationSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setProcessing(false);
          setAwaitingEmail(true);
        }, 1000);
      }
    }, 1500);
  };

  const handleEmailVerified = () => {
    onComplete(formData, false);
  };

  const handleLogin = () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const mockData = {
        ...formData,
        displayName: formData.email.includes('admin') ? 'System Admin' : (targetRole === UserRole.SEEKER ? 'Returning Student' : 'Returning Donor'),
        city: 'San Jose',
        state: 'CA',
        zip: '95112',
        country: 'United States',
        address: '123 Login Lane',
        languages: ['English', 'Gujarati']
      };
      onComplete(mockData, true);
    }, 1500);
  };

  const handleForgotPassword = () => {
     if (!formData.email) {
         setErrors({ email: 'Please enter your email to reset password' });
         return;
     }
     setProcessing(true);
     setTimeout(() => {
         setProcessing(false);
         setResetSent(true);
     }, 1500);
  };

  const toggleLanguage = (lang: string) => {
    if (formData.languages.includes(lang)) {
        setFormData({ ...formData, languages: formData.languages.filter(l => l !== lang) });
    } else {
        setFormData({ ...formData, languages: [...formData.languages, lang] });
    }
  };

  const fillDemo = (email: string, password: string) => {
    setFormData(prev => ({ ...prev, email, password }));
  };

  const renderRegisterForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-2">
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Choose your Avatar (Masked Identity)</label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {AVATARS.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setFormData({ ...formData, avatarId: idx })}
              className={`relative rounded-full p-1 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-600 ${formData.avatarId === idx ? 'border-brand-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={url} alt="" className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              {formData.avatarId === idx && (
                <div className="absolute bottom-0 right-0 bg-brand-600 rounded-full p-0.5 border-2 border-white">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {targetRole === UserRole.DONOR && (
        <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Donor Type</label>
            <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <select 
                    value={formData.donorCategory}
                    onChange={e => setFormData({...formData, donorCategory: e.target.value as DonorCategory})}
                    className="w-full bg-white dark:bg-slate-800 pl-9 pr-3 py-2 border border-slate-400 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    {Object.values(DonorCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">
            {targetRole === UserRole.SEEKER ? 'University Email' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-white dark:bg-slate-800 pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.email ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
              placeholder={targetRole === UserRole.SEEKER ? "student@university.edu" : "you@example.com"}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Mobile Number (No VoIP)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className={`w-full bg-white dark:bg-slate-800 pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.phone ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-4 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-brand-600 dark:text-brand-400" /> 
            Current Location (Required)
            </h4>
            <button 
                onClick={handleDetectLocation}
                disabled={detecting}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 flex items-center"
            >
                {detecting ? <Loader2 className="animate-spin h-3 w-3 mr-1"/> : <Navigation className="h-3 w-3 mr-1"/>}
                Auto-Detect
            </button>
        </div>
        
        <div className="mb-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Country</label>
            <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-white dark:bg-slate-900 pl-9 pr-3 py-2 border border-slate-400 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        <div className="mb-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Street Address</label>
            <div className="relative">
                <Home className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className={`w-full bg-white dark:bg-slate-900 pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.address ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
                  placeholder="123 Campus Dr, Apt 4B"
                />
            </div>
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
           <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City</label>
              <input 
                type="text" 
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className={`w-full bg-white dark:bg-slate-900 px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.city ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
                placeholder="San Jose"
              />
           </div>
           <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">State/Prov</label>
              <input 
                type="text" 
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                className={`w-full bg-white dark:bg-slate-900 px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.state ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
                placeholder="CA"
              />
           </div>
           <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Zip</label>
              <input 
                type="text" 
                value={formData.zip}
                onChange={e => setFormData({...formData, zip: e.target.value})}
                className={`w-full bg-white dark:bg-slate-900 px-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.zip ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
                placeholder="95112"
              />
           </div>
        </div>
      </div>
      
      <div>
         <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase flex items-center">
            <Languages className="h-4 w-4 mr-1 text-slate-500" /> Languages Spoken
         </label>
         <div className="relative" ref={dropdownRef}>
            <button 
               onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
               className="w-full bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded-lg py-2 px-3 text-left flex justify-between items-center focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
               <span className="text-sm text-slate-700 dark:text-slate-300">
                  {formData.languages.length > 0 
                     ? `${formData.languages.length} selected (${formData.languages.slice(0, 2).join(', ')}${formData.languages.length > 2 ? '...' : ''})` 
                     : "Select languages..."}
               </span>
               <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isLangDropdownOpen && (
               <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                  {LANGUAGES_LIST.map(lang => (
                     <div 
                        key={lang}
                        onClick={() => toggleLanguage(lang)}
                        className="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between"
                     >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{lang}</span>
                        {formData.languages.includes(lang) && <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
                     </div>
                  ))}
               </div>
            )}
         </div>
         <div className="flex flex-wrap gap-2 mt-2">
            {formData.languages.map(lang => (
                <span key={lang} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
                   {lang}
                   <button onClick={() => toggleLanguage(lang)} className="ml-1 hover:text-brand-900 dark:hover:text-brand-200 focus:outline-none">×</button>
                </span>
            ))}
         </div>
         {errors.languages && <p className="text-xs text-red-600 mt-1">{errors.languages}</p>}
      </div>
      
      <div>
         <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Display Name (Visible Publicly)</label>
         <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-white dark:bg-slate-800 pl-9 pr-3 py-2 border border-slate-400 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none"
            />
         </div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="space-y-6 py-4">
      
      {/* Demo Credentials Helper */}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
         <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 text-center">One-Click Demo Login</p>
         <div className="flex gap-2">
            <button 
                onClick={() => fillDemo('admin@newabilities.org', 'password')}
                className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded"
            >
                Admin
            </button>
            <button 
                onClick={() => fillDemo('student@university.edu', 'password')}
                className="flex-1 py-1.5 bg-brand-100 dark:bg-brand-900/30 hover:bg-brand-200 dark:hover:bg-brand-900/50 text-brand-700 dark:text-brand-300 text-xs font-bold rounded"
            >
                Student
            </button>
            <button 
                onClick={() => fillDemo('donor@gmail.com', 'password')}
                className="flex-1 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded"
            >
                Donor
            </button>
         </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input 
            type="email" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className={`w-full bg-white dark:bg-slate-800 pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.email ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Password</label>
        <input 
          type="password" 
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
          className="w-full bg-white dark:bg-slate-800 px-3 py-2 border border-slate-400 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none"
          placeholder="••••••••"
        />
      </div>
      <div className="text-right">
        <button 
            onClick={() => { setErrors({}); setAuthMode('FORGOT_PASSWORD'); }}
            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 font-medium hover:underline focus:outline-none"
        >
            Forgot Password?
        </button>
      </div>
    </div>
  );

  const renderEmailVerification = () => (
    <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Verify your Email</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 px-4">
            We've sent a verification link to <span className="font-bold text-slate-900 dark:text-white">{formData.email}</span>.<br/>
            Please check your inbox and click the link to activate your account.
        </p>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-xs text-amber-900 dark:text-amber-300 mb-6 mx-4">
            <strong>Simulation:</strong> In a real app, you would click a link in your email. Click below to simulate that action.
        </div>
        <button
            onClick={handleEmailVerified}
            className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 transition shadow-lg"
        >
            (Simulate) Click Link from Email
        </button>
        <button
            onClick={() => setAwaitingEmail(false)}
            className="mt-4 text-slate-500 dark:text-slate-400 text-sm font-bold hover:text-slate-700 dark:hover:text-slate-200"
        >
            Back
        </button>
    </div>
  );

  const renderForgotPassword = () => (
     <div className="space-y-6 py-8">
        {!resetSent ? (
            <>
                <p className="text-sm text-slate-600 dark:text-slate-300 text-center">Enter your email address and we'll send you a link to reset your password.</p>
                <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase">Email Address</label>
                    <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className={`w-full bg-white dark:bg-slate-800 pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.email ? 'border-red-600' : 'border-slate-400 dark:border-slate-600'}`}
                        placeholder="you@example.com"
                    />
                    </div>
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <button onClick={handleForgotPassword} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                    Send Reset Link
                </button>
                <div className="text-center">
                    <button onClick={() => { setErrors({}); setAuthMode('LOGIN'); }} className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-4 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center mx-auto">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                    </button>
                </div>
            </>
        ) : (
            <div className="text-center animate-in fade-in zoom-in duration-300">
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Check your inbox</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">We've sent a password reset link to <span className="font-bold">{formData.email}</span>.</p>
                <button onClick={() => { setResetSent(false); setAuthMode('LOGIN'); }} className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl transition">
                    Return to Login
                </button>
            </div>
        )}
     </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="mb-6">
           <div className="flex items-center justify-center mb-4">
              <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-full">
                {authMode === 'FORGOT_PASSWORD' ? <KeyRound className="h-6 w-6 text-brand-700 dark:text-brand-300" /> : <ShieldCheck className="h-6 w-6 text-brand-700 dark:text-brand-300" />}
              </div>
           </div>
           
           {!awaitingEmail && authMode !== 'FORGOT_PASSWORD' && (
            <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                <button 
                    onClick={() => { setErrors({}); setAuthMode('LOGIN'); }}
                    className={`flex-1 pb-2 text-sm font-bold transition ${authMode === 'LOGIN' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    Log In
                </button>
                <button 
                    onClick={() => { setErrors({}); setAuthMode('REGISTER'); }}
                    className={`flex-1 pb-2 text-sm font-bold transition ${authMode === 'REGISTER' ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-600 dark:border-brand-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                    Join (Verification)
                </button>
            </div>
           )}
           
           <h2 className="text-xl font-bold text-center text-slate-900 dark:text-white">
             {awaitingEmail ? 'Check Your Email' : authMode === 'LOGIN' ? 'Welcome Back' : authMode === 'REGISTER' ? 'Secure Verification' : 'Reset Password'}
           </h2>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {!processing && !awaitingEmail && authMode === 'LOGIN' && (
             <>
               {renderLoginForm()}
               <div className="mt-6 flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={onCancel} className="flex-1 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                  <button onClick={handleLogin} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                    Log In
                  </button>
               </div>
             </>
          )}

          {!processing && !awaitingEmail && authMode === 'REGISTER' && (
             <>
               {renderRegisterForm()}
               <div className="mt-6 flex space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={onCancel} className="flex-1 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">Cancel</button>
                  <button onClick={handleRegister} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                    Verify Identity
                  </button>
               </div>
             </>
          )}

          {!processing && !awaitingEmail && authMode === 'FORGOT_PASSWORD' && renderForgotPassword()}

          {!processing && awaitingEmail && renderEmailVerification()}

          {processing && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-300">
                {authMode === 'LOGIN' || authMode === 'FORGOT_PASSWORD' ? (
                   <>
                     <Loader2 className="h-10 w-10 text-brand-600 dark:text-brand-400 animate-spin" />
                     <p className="text-slate-600 dark:text-slate-400 font-medium">Processing...</p>
                   </>
                ) : (
                   <div className="w-full space-y-6">
                      {verificationSteps.map((s, idx) => {
                        const isCompleted = verificationStep > idx;
                        const isCurrent = verificationStep === idx;
                        return (
                            <div key={idx} className={`flex items-start ${isCompleted ? 'text-green-700 dark:text-green-400' : isCurrent ? 'text-brand-700 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600'}`}>
                                <div className="mr-3 mt-1">
                                    {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isCurrent ? <Loader2 className="h-5 w-5 animate-spin" /> : <s.icon className="h-5 w-5" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">{s.title}</h4>
                                    {isCurrent && <p className="text-xs">{s.desc}</p>}
                                </div>
                            </div>
                        )
                      })}
                   </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;