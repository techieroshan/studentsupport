
import React, { useState } from 'react';
import { MapPin, Globe, Loader2, Save, X } from 'lucide-react';
import { User } from '../types';

interface Props {
  currentUser: User;
  onUpdate: (data: { city: string; state: string; zip: string; country: string; reason: string }) => void;
  onCancel: () => void;
}

const COUNTRIES = ["United States", "Canada", "United Kingdom", "India", "Australia", "Germany", "France", "Other"];

const LocationUpdateModal: React.FC<Props> = ({ currentUser, onUpdate, onCancel }) => {
  const [formData, setFormData] = useState({
    city: currentUser.city,
    state: currentUser.state || '',
    zip: currentUser.zip,
    country: currentUser.country,
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
                <MapPin className="h-5 w-5 mr-2 text-brand-400" /> Update Location
            </h3>
            <button onClick={onCancel} className="p-1 hover:bg-slate-700 rounded-full transition">
                <X className="h-5 w-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-4">
                <strong>Note:</strong> Frequent location changes may trigger a re-verification check.
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
                <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <select 
                        value={formData.country}
                        onChange={e => setFormData({...formData, country: e.target.value})}
                        className="w-full bg-white pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                        required
                    />
                </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State/Prov</label>
                    <input 
                        type="text" 
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
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
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none ${error ? 'border-red-500' : 'border-slate-300'}`}
                />
                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>

            <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 flex items-center transition"
                >
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Update Location
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default LocationUpdateModal;
