
import React, { useState } from 'react';
import { ShieldCheck, ScanFace, CheckCircle2, Loader2, FileCheck, MapPin, User, Mail, Phone, Ruler, Globe, Home } from 'lucide-react';

interface OnboardingData {
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
  radius: number;
  avatarId: number;
  displayName: string;
}

interface Props {
  role: 'SEEKER' | 'DONOR';
  onComplete: (data: OnboardingData) => void;
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

const VerificationModal: React.FC<Props> = ({ role, onComplete, onCancel }) => {
  const [mode, setMode] = useState<'FORM' | 'VERIFYING' | 'SUCCESS'>('FORM');
  const [step, setStep] = useState(0);
  
  // Form State
  const [formData, setFormData] = useState<OnboardingData>({
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    radius: 20,
    avatarId: 0,
    displayName: role === 'SEEKER' ? 'Anonymous Student' : 'Kind Neighbor'
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});

  const verificationSteps = role === 'SEEKER' 
    ? [
        { title: 'University Email Check', desc: `Validating enrollment for ${formData.email}...`, icon: FileCheck },
        { title: 'Distance Check', desc: `Verifying permanent address is >30 miles from ${formData.zip}...`, icon: CheckCircle2 },
        { title: 'Persona Identity Verification', desc: 'Analyzing government ID and selfie match...', icon: ScanFace },
      ]
    : [
        { title: 'Identity Verification', desc: 'Validating government ID via Persona...', icon: ScanFace },
        { title: 'Background Check', desc: 'Performing standard community safety check...', icon: ShieldCheck },
      ];

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (role === 'SEEKER' && !formData.email.endsWith('.edu')) newErrors.email = 'Must be a valid .edu email';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.address) newErrors.address = 'Full street address is required for verification';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.zip) newErrors.zip = 'Zip is required';
    if (!formData.country) newErrors.country = 'Country is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartVerification = () => {
    if (!validateForm()) return;
    setMode('VERIFYING');
    
    // Simulate steps
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setStep(current);
      if (current >= verificationSteps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setMode('SUCCESS');
          setTimeout(() => {
            onComplete(formData);
          }, 1500);
        }, 1000);
      }
    }, 2000);
  };

  const renderForm = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-4">
        <label id="avatar-label" className="block text-sm font-bold text-slate-700">Choose your Avatar (Masked Identity)</label>
        <div className="flex gap-3 overflow-x-auto pb-2" role="radiogroup" aria-labelledby="avatar-label">
          {AVATARS.map((url, idx) => (
            <button
              key={idx}
              role="radio"
              aria-checked={formData.avatarId === idx}
              aria-label={`Select avatar option ${idx + 1}`}
              onClick={() => setFormData({ ...formData, avatarId: idx })}
              className={`relative rounded-full p-1 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-600 ${formData.avatarId === idx ? 'border-brand-600 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
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
          <label htmlFor="email-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase">
            {role === 'SEEKER' ? 'University Email' : 'Email Address'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              id="email-input"
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none ${errors.email ? 'border-red-600' : 'border-slate-400'}`}
              placeholder={role === 'SEEKER' ? "student@university.edu" : "you@example.com"}
            />
          </div>
          {errors.email && <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>}
        </div>
        
        <div>
          <label htmlFor="phone-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase">Mobile Number (No VoIP)</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              id="phone-input"
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none ${errors.phone ? 'border-red-600' : 'border-slate-400'}`}
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && <p className="text-xs text-red-600 mt-1 font-medium">{errors.phone}</p>}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-900 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-brand-600" /> 
          Current Location (Private)
        </h4>
        
        <div className="mb-2">
            <label htmlFor="country-input" className="block text-xs font-bold text-slate-700 mb-1">Country</label>
            <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <select 
                  id="country-input"
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="w-full bg-white pl-9 pr-3 py-2 border border-slate-400 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </div>

        <div className="mb-2">
            <label htmlFor="address-input" className="block text-xs font-bold text-slate-700 mb-1">Full Street Address</label>
            <div className="relative">
                <Home className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  id="address-input"
                  type="text" 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className={`w-full bg-white pl-9 pr-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none ${errors.address ? 'border-red-600' : 'border-slate-400'}`}
                  placeholder="123 Campus Dr, Apt 4B"
                />
            </div>
            {errors.address && <p className="text-xs text-red-600 mt-1 font-medium">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
              <label htmlFor="city-input" className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input 
                id="city-input"
                type="text" 
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none ${errors.city ? 'border-red-600' : 'border-slate-400'}`}
                placeholder="e.g. San Jose"
              />
           </div>
           <div>
              <label htmlFor="zip-input" className="block text-xs font-bold text-slate-700 mb-1">Zip Code</label>
              <input 
                id="zip-input"
                type="text" 
                value={formData.zip}
                onChange={e => setFormData({...formData, zip: e.target.value})}
                className={`w-full bg-white px-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none ${errors.zip ? 'border-red-600' : 'border-slate-400'}`}
                placeholder="e.g. 95112"
              />
           </div>
        </div>
        <div>
           <label htmlFor="radius-input" className="flex justify-between text-xs font-bold text-slate-700 mb-2">
             <span>Service Radius</span>
             <span className="font-medium text-brand-700">{formData.radius} miles</span>
           </label>
           <div className="flex items-center">
             <Ruler className="h-4 w-4 text-slate-500 mr-2" />
             <input 
               id="radius-input"
               type="range" 
               min="1" 
               max="20" 
               value={formData.radius}
               onChange={e => setFormData({...formData, radius: parseInt(e.target.value)})}
               className="w-full accent-brand-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500"
               aria-valuemin={1}
               aria-valuemax={20}
               aria-valuenow={formData.radius}
             />
           </div>
        </div>
      </div>
      
      <div>
         <label htmlFor="display-name-input" className="block text-xs font-bold text-slate-700 mb-1 uppercase">Display Name (Visible Publicly)</label>
         <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <input 
              id="display-name-input"
              type="text" 
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="w-full bg-white pl-9 pr-3 py-2 border border-slate-400 rounded-lg text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 outline-none"
            />
         </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-400 to-accent-500"></div>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto bg-brand-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="h-6 w-6 text-brand-700" />
          </div>
          <h2 id="modal-title" className="text-xl font-bold text-slate-900">
            {role === 'SEEKER' ? 'Student Verification' : 'Donor Verification'}
          </h2>
          {mode === 'FORM' && (
            <p className="text-slate-600 mt-1 text-sm">
              Verify your identity and location to join.
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-grow overflow-hidden flex flex-col">
          {mode === 'FORM' && (
             <>
               {renderForm()}
               <div className="mt-6 flex space-x-3 pt-4 border-t border-slate-200">
                  <button 
                    onClick={onCancel}
                    className="flex-1 py-3 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartVerification}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    Verify via Persona
                  </button>
               </div>
             </>
          )}

          {mode === 'VERIFYING' && (
            <div className="space-y-6 py-8">
              {verificationSteps.map((s, idx) => {
                const Icon = s.icon;
                const isCompleted = step > idx;
                const isCurrent = step === idx;
                const isPending = step < idx;

                return (
                  <div key={idx} className={`flex items-start transition-opacity ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                    <div className={`mt-1 rounded-full p-1.5 flex-shrink-0 border-2 ${
                      isCompleted ? 'bg-green-100 border-green-600 text-green-700' : 
                      isCurrent ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-300 text-slate-400'
                    }`}>
                      {isCurrent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-sm font-bold ${isCurrent ? 'text-brand-700' : 'text-slate-900'}`}>{s.title}</h4>
                      <p className="text-xs text-slate-600">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {mode === 'SUCCESS' && (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-300">
               <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                 <CheckCircle2 className="h-10 w-10 text-green-600" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Verified Successfully!</h3>
               <p className="text-slate-600">Welcome to the community, {formData.displayName}.</p>
               <p className="text-xs text-brand-600 mt-4 animate-pulse font-medium">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;