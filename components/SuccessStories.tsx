
import React from 'react';
import { Quote, Star } from 'lucide-react';

const STORIES = [
  {
    id: 1,
    role: 'Student',
    name: 'Alex M.',
    location: 'San Jose, CA',
    text: "Being 2,000 miles from home, I missed my mom's cooking. The warm vegan curry I received from Sarah didn't just fill my stomach, it warmed my heart during finals week.",
    avatar: "https://picsum.photos/seed/student1/100"
  },
  {
    id: 2,
    role: 'Donor',
    name: 'Mrs. Patel',
    location: 'Fremont, CA',
    text: "I cook fresh Jain meals every day for my family. Making two extra portions for a student nearby is effortless for me but means the world to them. It connects our community.",
    avatar: "https://picsum.photos/seed/donor1/100"
  },
  {
    id: 3,
    role: 'Student',
    name: 'Jordan K.',
    location: 'Santa Clara, CA',
    text: "I was hesitant to ask for help, but the anonymity made me feel safe. The process was respectful, and the food was delicious. Thank you, New Abilities!",
    avatar: "https://picsum.photos/seed/student3/100"
  }
];

const SuccessStories: React.FC = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STORIES.map((story) => (
            <div key={story.id} className="relative bg-slate-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100">
              <Quote className="absolute top-6 left-6 h-8 w-8 text-brand-200 opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                   <img 
                     src={story.avatar} 
                     alt={story.name} 
                     className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                   />
                   <div className="ml-4">
                      <h4 className="text-sm font-bold text-slate-900">{story.name}</h4>
                      <p className="text-xs text-slate-500">{story.location} • {story.role}</p>
                   </div>
                </div>
                
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>

                <p className="text-slate-700 italic leading-relaxed">
                  "{story.text}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuccessStories;
