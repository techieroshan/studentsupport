
import React from 'react';
import { MealRequest, MealOffer, UserRole } from '../types';
import { X, MapPin, User, Utensils, Calendar, Clock, ArrowRight, Repeat, Flag, CheckSquare, Truck, Languages, MessageSquare } from 'lucide-react';

interface Props {
  item: MealRequest | MealOffer;
  userRole: UserRole | 'GUEST';
  onClose: () => void;
  onAction: () => void;
  onFlag?: () => void;
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

const ItemDetailModal: React.FC<Props> = ({ item, userRole, onClose, onAction, onFlag }) => {
  const isRequest = 'seekerId' in item;
  
  const avatarId = isRequest ? (item as MealRequest).seekerAvatarId : (item as MealOffer).donorAvatarId;
  const name = isRequest ? (item as MealRequest).seekerName : (item as MealOffer).donorName;
  const languages = isRequest ? (item as MealRequest).seekerLanguages : (item as MealOffer).donorLanguages;
  const availability = item.availability;
  const title = isRequest ? 'Student Request' : 'Meal Offer';
  const frequency = item.frequency;
  const logistics = item.logistics || [];
  const status = item.status;
  
  const isOwner = (userRole === UserRole.SEEKER && isRequest) || (userRole === UserRole.DONOR && !isRequest);
  
  let actionLabel = 'Login to Respond';
  let actionColor = 'bg-brand-600 hover:bg-brand-700';
  let showAction = true;

  if (status === 'IN_PROGRESS') {
      if (isOwner || (userRole === UserRole.DONOR && isRequest) || (userRole === UserRole.SEEKER && !isRequest)) {
          actionLabel = 'Secure Chat & Verify';
          actionColor = 'bg-emerald-600 hover:bg-emerald-700';
      } else {
          showAction = false;
      }
  } else {
      // OPEN Status
      if (userRole === UserRole.DONOR && isRequest) {
        actionLabel = 'Offer Support';
        actionColor = 'bg-brand-600 hover:bg-brand-700';
      } else if (userRole === UserRole.SEEKER && !isRequest) {
        actionLabel = 'Connect & Claim';
        actionColor = 'bg-emerald-600 hover:bg-emerald-700';
      } else if (userRole !== 'GUEST' && !isOwner) {
        actionLabel = 'Contact Support'; 
        actionColor = 'bg-slate-500 cursor-not-allowed';
      } else if (isOwner) {
        showAction = false;
      }
  }

  const dietaryItems = isRequest 
    ? (item as MealRequest).dietaryNeeds 
    : (item as MealOffer).dietaryTags;

  const medicalItems = isRequest ? (item as MealRequest).medicalNeeds : [];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isRequest ? 'bg-accent-50 border-accent-100' : 'bg-emerald-50 border-emerald-100'}`}>
           <div className="flex items-center">
             <div className={`p-2 rounded-full mr-3 ${isRequest ? 'bg-accent-100 text-accent-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {isRequest ? <User className="h-5 w-5" /> : <Utensils className="h-5 w-5" />}
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900">{title}</h3>
               <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                 {status === 'IN_PROGRESS' ? 'Match In Progress' : (isRequest ? 'Verified Student Needs' : 'Community Share')}
               </p>
             </div>
           </div>
           <button 
             onClick={onClose}
             className="p-2 rounded-full hover:bg-black/5 text-slate-500 hover:text-slate-800 transition focus:outline-none focus:ring-2 focus:ring-brand-500"
           >
             <X className="h-6 w-6" />
           </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 overflow-y-auto">
           <div className="flex items-start mb-6">
              <img 
                src={AVATARS[avatarId] || AVATARS[0]} 
                alt="" 
                className="w-16 h-16 rounded-full border-4 border-slate-50 shadow-sm object-cover bg-slate-200" 
              />
              <div className="ml-4 flex-1">
                 <h4 className="text-xl font-bold text-slate-900">{name}</h4>
                 <div className="flex items-center text-slate-600 mt-1 text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1 text-brand-600" />
                    {item.city}, {item.state} {item.zip}
                 </div>
                 <div className="flex flex-wrap gap-2 mt-2">
                    <div className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-xs font-bold text-blue-700">
                        <Repeat className="h-3 w-3 mr-1" /> {frequency}
                    </div>
                    {availability && (
                        <div className="inline-flex items-center px-2 py-1 rounded bg-purple-50 text-xs font-bold text-purple-700">
                            <Clock className="h-3 w-3 mr-1" /> {availability}
                        </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Description */}
           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 relative">
              <p className="text-slate-800 text-lg leading-relaxed italic">
                "{item.description}"
              </p>
           </div>
           
           {/* Languages */}
           {languages && languages.length > 0 && (
             <div className="mb-6">
                <h5 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center">
                    <Languages className="h-4 w-4 mr-1" /> Languages Spoken
                </h5>
                <div className="flex flex-wrap gap-2">
                    {languages.map(lang => (
                        <span key={lang} className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                            {lang}
                        </span>
                    ))}
                </div>
             </div>
           )}

           {/* Logistics Display */}
           {logistics.length > 0 && (
             <div className="mb-6">
                <h5 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center">
                    <Truck className="h-4 w-4 mr-1" /> Logistics / Handover
                </h5>
                <div className="flex flex-wrap gap-2">
                    {logistics.map(l => (
                        <span key={l} className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                            {l}
                        </span>
                    ))}
                </div>
             </div>
           )}

           {dietaryItems.length > 0 && (
             <div className="mb-6">
               <h5 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Dietary Preferences</h5>
               <div className="flex flex-wrap gap-2">
                 {dietaryItems.map(tag => (
                   <span key={tag} className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-bold border border-brand-100">
                     {tag}
                   </span>
                 ))}
               </div>
             </div>
           )}

           {medicalItems && medicalItems.length > 0 && (
             <div className="mb-6">
               <h5 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide flex items-center">
                 Medical / Other Needs
               </h5>
               <div className="flex flex-wrap gap-2">
                 {medicalItems.map(tag => (
                   <span key={tag} className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-sm font-bold border border-red-100">
                     {tag}
                   </span>
                 ))}
               </div>
             </div>
           )}

           <div className="flex items-center text-xs text-slate-500 font-medium space-x-4 mb-8">
              <span className="flex items-center">
                 <Calendar className="h-4 w-4 mr-1" />
                 Posted {new Date(isRequest ? (item as MealRequest).postedAt : Date.now()).toLocaleDateString()}
              </span>
           </div>

            {/* Actions */}
           <div className="space-y-3">
             {showAction && (
               <button 
                 onClick={onAction}
                 className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg transition transform active:scale-95 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 ${actionColor}`}
               >
                 {actionLabel} <ArrowRight className="ml-2 h-5 w-5" />
               </button>
             )}

             <div className="flex justify-center pt-2">
                <button onClick={onFlag} className="text-xs text-slate-400 hover:text-red-500 font-medium flex items-center">
                   <Flag className="h-3 w-3 mr-1" /> Report / Flag Transaction
                </button>
             </div>
           </div>
           
           {userRole === 'GUEST' && (
             <p className="text-center text-xs text-slate-500 mt-3">
               Sign in or Register to connect safely.
             </p>
           )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
