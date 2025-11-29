
import React, { useState } from 'react';
import { Loader2, Truck, CheckSquare, AlertTriangle, EyeOff } from 'lucide-react';
import { DietaryPreference, MedicalPreference, FulfillmentOption, Frequency } from '../types';

interface Props {
  type: 'REQUEST' | 'OFFER';
  onCancel: () => void;
  onSubmit: (data: {
    description: string;
    dietaryNeeds: DietaryPreference[];
    medicalNeeds: MedicalPreference[];
    logistics: FulfillmentOption[];
    frequency: Frequency;
    availability: string;
    isUrgent?: boolean;
    isAnonymous?: boolean;
  }) => Promise<void>;
}

const DIETARY_TOOLTIPS: Record<string, string> = {
    [DietaryPreference.VEGETARIAN]: "No meat, poultry, or seafood.",
    [DietaryPreference.VEGAN]: "No animal products (meat, dairy, eggs, honey).",
    [DietaryPreference.HINDU_VEG]: "Strict vegetarian, no eggs.",
    [DietaryPreference.JAIN_VEG]: "Vegetarian, no root vegetables (onion, garlic, potato, carrot).",
    [DietaryPreference.HALAL]: "Prepared according to Islamic dietary laws.",
    [DietaryPreference.KOSHER]: "Prepared according to Jewish dietary laws.",
    [DietaryPreference.GLUTEN_FREE]: "No wheat, barley, rye, or triticale.",
    [DietaryPreference.NUT_FREE]: "No peanuts or tree nuts.",
    [DietaryPreference.NO_OIL]: "Prepared without added oils or fats."
};

const PostForm: React.FC<Props> = ({ type, onCancel, onSubmit }) => {
  const [desc, setDesc] = useState('');
  const [selectedDiets, setSelectedDiets] = useState<DietaryPreference[]>([]);
  const [selectedMedicals, setSelectedMedicals] = useState<MedicalPreference[]>([]);
  const [selectedLogistics, setSelectedLogistics] = useState<FulfillmentOption[]>([]);
  const [selectedFreq, setSelectedFreq] = useState<Frequency>(Frequency.ONCE);
  const [availability, setAvailability] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logisticsConfirmed, setLogisticsConfirmed] = useState(false);

  const toggleDiet = (d: DietaryPreference) => {
    if (selectedDiets.includes(d)) setSelectedDiets(selectedDiets.filter(x => x !== d));
    else setSelectedDiets([...selectedDiets, d]);
  };
  
  const toggleMedical = (m: MedicalPreference) => {
    if (selectedMedicals.includes(m)) setSelectedMedicals(selectedMedicals.filter(x => x !== m));
    else setSelectedMedicals([...selectedMedicals, m]);
  };

  const toggleLogistic = (l: FulfillmentOption) => {
      if (selectedLogistics.includes(l)) setSelectedLogistics(selectedLogistics.filter(x => x !== l));
      else setSelectedLogistics([...selectedLogistics, l]);
  }

  const handleSubmit = async () => {
     setLoading(true);
     await onSubmit({
       description: desc,
       dietaryNeeds: selectedDiets,
       medicalNeeds: selectedMedicals,
       logistics: selectedLogistics,
       frequency: selectedFreq,
       availability,
       isUrgent,
       isAnonymous
     });
     setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 animate-in slide-in-from-bottom-4 duration-500">
       <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
                {type === 'REQUEST' ? 'Request a Meal' : 'Offer a Meal'}
            </h2>
            {type === 'REQUEST' && (
                <button 
                    onClick={() => setIsUrgent(!isUrgent)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition ${isUrgent ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-500 border-slate-200 hover:border-red-300'}`}
                >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {isUrgent ? 'Marked as Emergency' : 'Mark as Emergency?'}
                </button>
            )}
            {type === 'OFFER' && (
                <button 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border transition ${isAnonymous ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                >
                    <EyeOff className="h-3 w-3 mr-1" />
                    {isAnonymous ? 'Posting Anonymously' : 'Post Anonymously?'}
                </button>
            )}
          </div>
          
          <div className="mb-6">
             <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
             <textarea 
               value={desc}
               onChange={(e) => setDesc(e.target.value)}
               rows={3}
               className="w-full bg-white border border-slate-400 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none placeholder-slate-500"
               placeholder={type === 'REQUEST' ? "e.g. Need a healthy dinner, struggling with finals..." : "e.g. Cooking extra vegetarian lasagna, serves 4..."}
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Frequency</label>
                  <div className="flex flex-wrap gap-2">
                      {Object.values(Frequency).map(freq => (
                          <button
                          key={freq}
                          onClick={() => setSelectedFreq(freq)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${selectedFreq === freq ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200'}`}
                          >
                          {freq}
                          </button>
                      ))}
                  </div>
              </div>
              <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">Logistics / Handover</label>
                   <div className="flex flex-col gap-2">
                      {Object.values(FulfillmentOption).map(opt => (
                          <button
                            key={opt}
                            onClick={() => toggleLogistic(opt)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border text-left flex items-center transition ${selectedLogistics.includes(opt) ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-slate-600 border-slate-200'}`}
                          >
                              <Truck className="h-3 w-3 mr-2" />
                              {opt}
                          </button>
                      ))}
                   </div>
              </div>
          </div>

          <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">Availability / Timing Preference</label>
              <input 
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-white border border-slate-400 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none placeholder-slate-500"
                  placeholder={type === 'REQUEST' ? "e.g. Weeknights after 6pm" : "e.g. Pickup available Sunday 2-4pm"}
              />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(DietaryPreference).map(pref => (
                <button
                  key={pref}
                  onClick={() => toggleDiet(pref)}
                  title={DIETARY_TOOLTIPS[pref]}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${selectedDiets.includes(pref) ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {pref}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-600 mt-2 italic">* Hover over tags for definitions.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">Medical / Other Needs</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(MedicalPreference).map(pref => (
                <button
                  key={pref}
                  onClick={() => toggleMedical(pref)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${selectedMedicals.includes(pref) ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {pref}
                </button>
              ))}
            </div>
          </div>
            
          {type === 'REQUEST' && (
            <div className="mb-6 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <label className="flex items-start cursor-pointer">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox"
                            checked={logisticsConfirmed}
                            onChange={(e) => setLogisticsConfirmed(e.target.checked)}
                            className="h-5 w-5 text-brand-600 focus:ring-brand-500 border-gray-300 rounded mt-0.5 bg-white"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <span className="font-bold text-slate-900">I confirm that I will coordinate pickup or receive delivery safely.</span>
                        <p className="text-slate-600 text-xs mt-1">
                            New Abilities Foundation facilitates the connection but is not responsible for transportation.
                        </p>
                    </div>
                </label>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-100">
             <button onClick={onCancel} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition">Cancel</button>
             <button 
                onClick={handleSubmit} 
                disabled={!desc || loading || selectedLogistics.length === 0 || (type === 'REQUEST' && !logisticsConfirmed)} 
                className="px-8 py-3 rounded-xl text-white font-bold bg-brand-600 hover:bg-brand-700 flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition hover:-translate-y-0.5"
             >
               {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
               Post {type === 'REQUEST' ? (isUrgent ? 'Emergency Request' : 'Request') : 'Meal Offer'}
             </button>
          </div>
       </div>
    </div>
  );
};

export default PostForm;
