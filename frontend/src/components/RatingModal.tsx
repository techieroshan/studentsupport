
import React, { useState } from 'react';
import { Star, MessageSquare, Share2 } from 'lucide-react';

interface Props {
  onSubmit: (stars: number, comment: string, isPublic: boolean) => void;
  onCancel: () => void;
}

const RatingModal: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-center text-slate-900 mb-2">How was your experience?</h3>
        <p className="text-sm text-center text-slate-500 mb-6">Your feedback helps keep our community safe and kind.</p>
        
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setStars(star)}
              className="focus:outline-none transition transform hover:scale-110"
            >
              <Star 
                className={`h-8 w-8 ${star <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
              />
            </button>
          ))}
        </div>
        
        <div className="mb-4">
           <label className="block text-xs font-bold text-slate-700 mb-2">Private Comment (Optional)</label>
           <textarea 
             value={comment}
             onChange={(e) => setComment(e.target.value)}
             className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
             placeholder="Thank you for the delicious meal..."
             rows={3}
           />
        </div>

        {stars >= 4 && (
            <div className="mb-6 bg-brand-50 p-3 rounded-lg border border-brand-100">
                <label className="flex items-start cursor-pointer">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded mt-0.5" 
                        />
                    </div>
                    <div className="ml-3 text-xs">
                        <span className="font-bold text-brand-800">Share your story?</span>
                        <p className="text-brand-600 mt-0.5">Feature this on our "Success Stories" wall to inspire others.</p>
                    </div>
                </label>
            </div>
        )}

        <div className="flex space-x-3">
          <button onClick={onCancel} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Skip</button>
          <button 
            onClick={() => onSubmit(stars, comment, isPublic)}
            disabled={stars === 0}
            className={`flex-1 py-2 text-white font-bold rounded-lg shadow-md ${stars === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700'}`}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
