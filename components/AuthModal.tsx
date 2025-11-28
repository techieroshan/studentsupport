
import React, { useState } from 'react';
import { ShieldCheck, ScanFace, CheckCircle2, Loader2, FileCheck, MapPin, User, Mail, Phone, Ruler, Globe, Home, LogIn } from 'lucide-react';
import { UserRole } from '../types';

interface OnboardingData {
  email: string;
  password?: string; // Mock password
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  radius: number;
  avatarId: number;
  displayName: string;
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

const AuthModal: React.FC<Props> = ({ initialMode, targetRole, onComplete, onCancel }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [verificationStep, setVerificationStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  
  // Form State
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
    displayName: targetRole === UserRole.SEEKER ? 'Anonymous Student' : 'Kind Neighbor'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});

  const verificationSteps = targetRole === UserRole.SEEKER 
    ? [
        { title: 'University Email Check', desc: `Validating enrollment for ${formData.email}...`, icon: FileCheck },
        { title: 'Distance Check', desc: `Verifying permanent address is >30 miles from ${formData.zip}...`, icon: CheckCircle2 },
        { title: 'Persona Identity Verification', desc: 'Analyzing government ID and selfie match...', icon: ScanFace },
      ]
    : [
        { title: 'Identity Verification', desc: 'Validating government ID via Persona...', icon: ScanFace },
        { title: 'Background Check', desc: 'Performing standard community safety check...', icon: ShieldCheck },
      ];

  const validateRegister = () => {
    const newErrors: any = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (targetRole === UserRole.SEEKER && !formData.email.endsWith('.edu') && !formData.email.includes('admin')) newErrors.email = 'Must be a valid .edu email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Full street address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.zip) newErrors.zip = 'Zip is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateRegister()) return;
    setProcessing(true);
    
    // Simulate verification steps
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVerificationStep(current);
      if (current >= verificationSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete(formData, false);
        }, 1000);
      }
    }, 1500);
  };

  const handleLogin = () => {
    if (!formData.email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    setProcessing(true);
    // Simulate login network request
    setTimeout(() => {
      // Mock data refill for login
      const mockData = {
        ...formData,
        displayName: formData.email.includes('admin') ? 'System Admin' : (targetRole === UserRole.SEEKER ? 'Returning Student' : 'Returning Donor'),
        city: 'San Jose',
        state: 'CA',
        zip: '95112',
        country: 'United States',
        address: '123 Login Lane'
      };
      onComplete(mockData, true);
    }, 1500);
  };

  const renderRegisterForm = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <label className="block text-sm font-bold text-slate-700">Choose your Avatar (Masked Identity)</label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {AVATARS.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setFormData({ ...formData, avatarId: idx })}
              className={`relative rounded-full p-1 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-brand-600 ${formData.avatarId === idx ? 'border-brand-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={url} alt="" className="w-12 h-12 rounded-full bg-slate-200" />
              {formData.avatarId === idx && (
                <div className="absolute bottom-0 right-0 bg-brand-600 rounded-full p-0.5 border-2 border-white">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
            {targetRole === UserRole.SEEKER ? 'University Email' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.email ? 'border-red-600' : 'border-slate-400'}`}
              placeholder={targetRole === UserRole.SEEKER ? "student@university.edu" : "you@example.com"}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Mobile Number (No VoIP)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.phone ? 'border-red-600' : 'border-slate-400'}`}
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-brand-600" /> 
          Current Location (Required)
        </h4>
        
        <div className="mb-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
            <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-white pl-9 pr-3 py-2 border border-slate-400 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        <div className="mb-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
            <div className="relative">
                <Home className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.address ? 'border-red-600' : 'border-slate-400'}`}
                  placeholder="123 Campus Dr, Apt 4B"
                />
            </div>
            {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
           <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input 
                type="text" 
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.city ? 'border-red-600' : 'border-slate-400'}`}
                placeholder="San Jose"
              />
           </div>
           <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">State/Prov</label>
              <input 
                type="text" 
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value})}
                className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.state ? 'border-red-600' : 'border-slate-400'}`}
                placeholder="CA"
              />
           </div>
           <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">Zip</label>
              <input 
                type="text" 
                value={formData.zip}
                onChange={e => setFormData({...formData, zip: e.target.value})}
                className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.zip ? 'border-red-600' : 'border-slate-400'}`}
                placeholder="95112"
              />
           </div>
        </div>
      </div>
      
      <div>
         <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Display Name (Visible Publicly)</label>
         <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-white pl-9 pr-3 py-2 border border-slate-400 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none"
            />
         </div>
      </div>
    </div>
  );

  const renderLoginForm = () => (
    <div className="space-y-6 py-4">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input 
            type="email" 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none ${errors.email ? 'border-red-600' : 'border-slate-400'}`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Password</label>
        <input 
          type="password" 
          value={formData.password}
          onChange={e => setFormData({...formData, password: e.target.value})}
          className="w-full bg-white px-3 py-2 border border-slate-400 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none"
          placeholder="••••••••"
        />
      </div>
      <div className="text-right">
        <a href="#" className="text-xs text-brand-600 hover:text-brand-800 font-medium">Forgot Password?</a>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Tabs */}
        <div className="mb-6">
           <div className="flex items-center justify-center mb-4">
              <div className="bg-brand-100 p-2 rounded-full">
                <ShieldCheck className="h-6 w-6 text-brand-700" />
              </div>
           </div>
           
           <div className="flex border-b border-slate-200 mb-4">
              <button 
                onClick={() => setAuthMode('LOGIN')}
                className={`flex-1 pb-2 text-sm font-bold transition ${authMode === 'LOGIN' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Log In
              </button>
              <button 
                onClick={() => setAuthMode('REGISTER')}
                className={`flex-1 pb-2 text-sm font-bold transition ${authMode === 'REGISTER' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Join (Verification)
              </button>
           </div>
           
           <h2 className="text-xl font-bold text-center text-slate-900">
             {authMode === 'LOGIN' ? 'Welcome Back' : 'Secure Verification'}
           </h2>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {!processing && authMode === 'LOGIN' && (
             <>
               {renderLoginForm()}
               <div className="mt-6 flex space-x-3 pt-4 border-t border-slate-200">
                  <button onClick={onCancel} className="flex-1 py-3 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition">Cancel</button>
                  <button onClick={handleLogin} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                    Log In
                  </button>
               </div>
             </>
          )}

          {!processing && authMode === 'REGISTER' && (
             <>
               {renderRegisterForm()}
               <div className="mt-6 flex space-x-3 pt-4 border-t border-slate-200">
                  <button onClick={onCancel} className="flex-1 py-3 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition">Cancel</button>
                  <button onClick={handleRegister} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
                    Verify Identity
                  </button>
               </div>
             </>
          )}

          {processing && (
            <div className="py-12 flex flex-col items-center justify-center space-y-6">
                {authMode === 'LOGIN' ? (
                   <>
                     <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                     <p className="text-slate-600 font-medium">Authenticating...</p>
                   </>
                ) : (
                   <div className="w-full space-y-6">
                      {verificationSteps.map((s, idx) => {
                        const isCompleted = verificationStep > idx;
                        const isCurrent = verificationStep === idx;
                        return (
                            <div key={idx} className={`flex items-start ${isCompleted ? 'text-green-700' : isCurrent ? 'text-brand-700' : 'text-slate-400'}`}>
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
