
import React, { useState } from 'react';
import { Donor, DonorCategory, DonorTier } from '../types';
import { Heart, Globe, Building2, User, GraduationCap, ShieldCheck, ExternalLink, Repeat } from 'lucide-react';

const SEED_DONORS: Donor[] = [
  // Platinum (Gov, Religious, Non-Profits)
  {
    id: 'd1',
    name: 'Zakat Foundation of America',
    category: DonorCategory.NON_PROFIT,
    tier: DonorTier.PLATINUM,
    logoUrl: 'https://via.placeholder.com/150?text=Zakat+Foundation',
    totalContributionDisplay: '$15,000+',
    isAnonymous: false,
    location: 'Chicago, IL',
    since: '2023',
    quote: 'Feeding students is a core part of our domestic hunger relief mandate.'
  },
  {
    id: 'd2',
    name: 'Sri Venkateswara Temple',
    category: DonorCategory.RELIGIOUS,
    tier: DonorTier.PLATINUM,
    logoUrl: 'https://via.placeholder.com/150?text=SVT+Cary',
    totalContributionDisplay: '12,500 Meals',
    isAnonymous: false,
    location: 'Cary, NC',
    since: '2024',
    isRecurring: true
  },
  {
    id: 'd3',
    name: 'City of Fremont',
    category: DonorCategory.GOVERNMENT,
    tier: DonorTier.PLATINUM,
    logoUrl: 'https://via.placeholder.com/150?text=City+Fremont',
    totalContributionDisplay: '$250,000 Grant',
    isAnonymous: false,
    location: 'Fremont, CA',
    since: '2025',
    quote: 'Supporting youth food security through the Community Development Block Grant.'
  },
  {
    id: 'd4',
    name: 'Dr. Anand Patel',
    category: DonorCategory.INDIVIDUAL,
    tier: DonorTier.PLATINUM,
    totalContributionDisplay: '$25,000',
    isAnonymous: false,
    location: 'Bay Area, CA',
    since: '2024'
  },
  {
    id: 'd5',
    name: 'Anonymous',
    anonymousName: 'A Caring Sikh Family from Toronto',
    category: DonorCategory.INDIVIDUAL,
    tier: DonorTier.PLATINUM,
    totalContributionDisplay: '18,000 Meals',
    isAnonymous: true,
    location: 'Toronto, ON',
    since: '2023',
    isRecurring: true
  },
  {
    id: 'd6',
    name: 'Sri Lakshmi Temple',
    category: DonorCategory.RELIGIOUS,
    tier: DonorTier.PLATINUM,
    totalContributionDisplay: '₹15,00,000',
    isAnonymous: false,
    location: 'Singapore',
    since: '2025'
  },

  // Gold
  {
    id: 'd7',
    name: 'City of Austin - Sustainability',
    category: DonorCategory.GOVERNMENT,
    tier: DonorTier.GOLD,
    totalContributionDisplay: '7,200 Meals',
    isAnonymous: false,
    location: 'Austin, TX',
    since: '2024'
  },
  {
    id: 'd8',
    name: 'Sikh Gurudwara of Triangle',
    category: DonorCategory.RELIGIOUS,
    tier: DonorTier.GOLD,
    totalContributionDisplay: '6,800 Meals',
    isAnonymous: false,
    location: 'Durham, NC',
    since: '2023',
    isRecurring: true
  },
  {
    id: 'd9',
    name: 'Tata Consultancy Services',
    category: DonorCategory.BUSINESS,
    tier: DonorTier.GOLD,
    totalContributionDisplay: '$10,000 CSR Grant',
    isAnonymous: false,
    location: 'Mumbai / Global',
    since: '2024'
  },

  // Silver
  {
    id: 'd10',
    name: 'Patel Family Foundation',
    category: DonorCategory.FAMILY_OFFICE,
    tier: DonorTier.SILVER,
    totalContributionDisplay: '$75,000 Annual',
    isAnonymous: false,
    location: 'New Jersey',
    since: '2022',
    isRecurring: true
  },
  {
    id: 'd11',
    name: 'IIT Bombay Class of 1999',
    category: DonorCategory.UNIVERSITY,
    tier: DonorTier.SILVER,
    totalContributionDisplay: '$5,000',
    isAnonymous: false,
    location: 'Global Alumni',
    since: '2025'
  },
  
  // Bronze / Community
  {
    id: 'd12',
    name: 'Mom & Pop Diner',
    category: DonorCategory.BUSINESS,
    tier: DonorTier.BRONZE,
    totalContributionDisplay: '500 Meals',
    isAnonymous: false,
    location: 'Houston, TX',
    since: '2024'
  }
];

const TIER_CONFIG: Record<DonorTier, { color: string, badge: string, height: string }> = {
  [DonorTier.PLATINUM]: { color: 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-slate-300', badge: 'text-slate-800', height: 'h-48' },
  [DonorTier.GOLD]: { color: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border-amber-200', badge: 'text-amber-700', height: 'h-40' },
  [DonorTier.SILVER]: { color: 'bg-white border-slate-200', badge: 'text-slate-600', height: 'h-36' },
  [DonorTier.BRONZE]: { color: 'bg-white border-slate-100', badge: 'text-orange-700', height: 'h-32' },
  [DonorTier.COMMUNITY]: { color: 'bg-white border-slate-50', badge: 'text-slate-500', height: 'h-24' },
};

const DonorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DonorCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'AMOUNT' | 'DATE'>('AMOUNT');

  // Filter & Sort
  const filteredDonors = SEED_DONORS.filter(d => activeTab === 'ALL' || d.category === activeTab);
  
  // Note: Sorting logic is purely visual for this demo as amounts are strings. 
  // In a real app, use the numeric amount_cents field.

  const categories = Object.values(DonorCategory);

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      
      {/* Hero Section */}
      <div className="bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
           <span className="inline-block py-1 px-3 rounded-full bg-brand-900 text-brand-200 text-xs font-bold uppercase tracking-wider mb-4 border border-brand-700">
              501(c)(3) Transparency
           </span>
           <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Every Meal Made Possible by <br className="hidden md:block"/>
              <span className="text-brand-400">Generous Donors Worldwide</span>
           </h1>
           <p className="max-w-2xl mx-auto text-xl text-slate-400 mb-10">
              We connect students with food, but these visionary partners make the platform possible. 
              Thank you for your grants, charitable contributions, and unwavering support.
           </p>

           <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="text-left mr-8">
                 <p className="text-sm text-slate-400 uppercase font-bold">Total Raised (All Time)</p>
                 <p className="text-4xl font-extrabold text-white">$1,247,830</p>
              </div>
              <div className="h-10 w-px bg-white/20 mr-8"></div>
              <div className="text-left">
                 <p className="text-sm text-slate-400 uppercase font-bold">From</p>
                 <p className="text-2xl font-bold text-white">842 Donors <span className="text-base font-normal text-slate-400">across 23 Countries</span></p>
              </div>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-200 shadow-sm overflow-x-auto">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 py-4 min-w-max">
            <button 
              onClick={() => setActiveTab('ALL')}
              className={`text-sm font-bold pb-1 border-b-2 transition ${activeTab === 'ALL' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              All Donors
            </button>
            {categories.map(cat => (
               <button 
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`text-sm font-bold pb-1 border-b-2 transition ${activeTab === cat ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
               >
                 {cat}
               </button>
            ))}
         </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
         
         {/* Sort Controls */}
         <div className="flex justify-end mb-8 text-sm text-slate-500">
            <span className="mr-2">Sort by:</span>
            <button onClick={() => setSortBy('AMOUNT')} className={`font-bold mr-3 ${sortBy === 'AMOUNT' ? 'text-brand-600' : 'text-slate-500'}`}>Highest Contribution</button>
            <button onClick={() => setSortBy('DATE')} className={`font-bold ${sortBy === 'DATE' ? 'text-brand-600' : 'text-slate-500'}`}>Most Recent</button>
         </div>

         {filteredDonors.length === 0 ? (
           <div className="text-center py-20">
              <p className="text-slate-500 text-lg">No donors found in this category yet. Be the first!</p>
           </div>
         ) : (
           <div className="space-y-12">
              {/* Group by Tier for visual hierarchy if 'ALL' is selected, otherwise plain grid */}
              {(Object.values(DonorTier) as DonorTier[]).map(tier => {
                 const donorsInTier = filteredDonors.filter(d => d.tier === tier);
                 if (donorsInTier.length === 0) return null;

                 return (
                    <div key={tier} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                       <h3 className={`text-xl font-extrabold mb-6 flex items-center ${TIER_CONFIG[tier].badge}`}>
                          <Heart className="h-5 w-5 mr-2 fill-current" /> {tier}s
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {donorsInTier.map(donor => (
                             <div 
                               key={donor.id} 
                               className={`relative rounded-xl p-6 border flex flex-col items-center text-center transition hover:-translate-y-1 hover:shadow-lg ${TIER_CONFIG[tier].color}`}
                             >
                                {donor.isRecurring && (
                                   <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                                      <Repeat className="h-3 w-3 mr-1" /> Monthly
                                   </div>
                                )}
                                
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 overflow-hidden border border-slate-100">
                                   {donor.isAnonymous ? (
                                      <User className="h-8 w-8 text-slate-300" />
                                   ) : donor.logoUrl ? (
                                      <img src={donor.logoUrl} alt={donor.name} className="w-full h-full object-contain p-1" />
                                   ) : (
                                      <span className="text-xl font-bold text-slate-400">{donor.name.charAt(0)}</span>
                                   )}
                                </div>

                                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                                   {donor.isAnonymous ? (donor.anonymousName || "Anonymous Donor") : donor.name}
                                </h4>
                                <p className="text-xs font-bold text-brand-600 uppercase tracking-wide mb-3">{donor.category}</p>
                                
                                <div className="mt-auto pt-4 w-full border-t border-slate-200/50">
                                   <p className="text-2xl font-extrabold text-slate-800">{donor.totalContributionDisplay}</p>
                                   <p className="text-xs text-slate-400 mt-1">{donor.location} • Since {donor.since}</p>
                                </div>

                                {donor.quote && (
                                   <div className="mt-4 bg-white/50 p-3 rounded-lg text-xs italic text-slate-600 w-full">
                                      "{donor.quote}"
                                   </div>
                                )}
                             </div>
                          ))}
                       </div>
                    </div>
                 )
              })}
           </div>
         )}

         {/* CTA */}
         <div className="mt-20 bg-brand-600 rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')] bg-cover opacity-10 mix-blend-overlay"></div>
            <div className="relative p-12 text-center text-white">
               <h2 className="text-3xl font-bold mb-4">Make a Tax-Deductible Impact</h2>
               <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
                  New Abilities Foundation is a 501(c)(3) non-profit. Your contributions are tax-deductible in the U.S. 
                  We accept global donations via Wire, Check, Crypto, or Stock.
               </p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a href="https://newabilities.org/donate" target="_blank" rel="noreferrer" className="px-8 py-3 bg-white text-brand-700 font-bold rounded-lg shadow hover:bg-slate-100 transition">
                     Donate Online
                  </a>
                  <a href="mailto:partners@newabilities.org" className="px-8 py-3 bg-brand-700 text-white font-bold rounded-lg border border-brand-500 hover:bg-brand-800 transition">
                     Contact for Grants
                  </a>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DonorsPage;
