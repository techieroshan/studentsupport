
import React from 'react';
import { Quote, Star, MessageSquare } from 'lucide-react';
import { Rating } from '../types';

interface Props {
  reviews: Rating[];
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

const SuccessStories: React.FC<Props> = ({ reviews }) => {
  // Sort reviews by latest first, take top 3
  const displayReviews = [...reviews].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  return (
    <div className="bg-white py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-base text-brand-600 font-bold tracking-wide uppercase">Community Voices</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Real Stories, Real Impact
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            See how a simple meal can bridge the distance between home and university.
          </p>
        </div>

        {displayReviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {displayReviews.map((review) => (
              <div key={review.id} className="relative bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Quote className="absolute top-6 left-6 h-8 w-8 text-brand-200 opacity-50" />
                
                <div className="relative z-10 flex-grow">
                  <div className="flex items-center mb-6">
                     <img 
                       src={AVATARS[review.reviewerAvatarId] || AVATARS[0]} 
                       alt={review.reviewerName} 
                       className="h-12 w-12 rounded-full border-2 border-white shadow-sm bg-slate-200"
                     />
                     <div className="ml-4">
                        <h4 className="text-sm font-bold text-slate-900">{review.reviewerName}</h4>
                        <p className="text-xs text-slate-500">{review.reviewerLocation} • {review.reviewerRole}</p>
                     </div>
                  </div>
                  
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.stars ? 'fill-current' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>

                  <p className="text-slate-700 italic leading-relaxed">
                    "{review.comment}"
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400 font-medium">
                   {new Date(review.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessStories;