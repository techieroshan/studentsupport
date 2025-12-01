
import React, { useState } from 'react';
import { User, Utensils, ShieldCheck, MapPin, MessageSquare, KeyRound, Star, CheckCircle2 } from 'lucide-react';

const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'DONOR'>('STUDENT');

  const steps = activeTab === 'STUDENT' ? [
      {
          icon: ShieldCheck,
          title: "1. Verified Registration",
          desc: "Sign up with your university email (.edu) and verify your identity securely via Persona™. We ensure you are a real student living away from home."
      },
      {
          icon: MapPin,
          title: "2. Request or Browse",
          desc: "Post a meal request detailing your dietary needs (e.g., Vegan, Halal) or browse active offers from neighbors in your city."
      },
      {
          icon: MessageSquare,
          title: "3. Connect Securely",
          desc: "When a donor accepts your request, a secure, private chat opens. Coordinate pickup or delivery details without sharing your personal phone number."
      },
      {
          icon: KeyRound,
          title: "4. Digital Handshake",
          desc: "You'll receive a unique 4-digit PIN. Share this with the donor only when you receive the food. This verifies the transaction safely."
      },
      {
          icon: Star,
          title: "5. Rate & Review",
          desc: "Enjoy your home-cooked meal! Leave a star rating and comment to help build trust in the community."
      }
  ] : [
      {
          icon: ShieldCheck,
          title: "1. Verified Registration",
          desc: "Register as a donor and verify your identity. We perform basic checks to ensure community safety."
      },
      {
          icon: Utensils,
          title: "2. Offer or Browse",
          desc: "Cooked extra? Post a meal offer with photos and dietary tags. Or, browse requests from verified students nearby."
      },
      {
          icon: MessageSquare,
          title: "3. Coordinate",
          desc: "Chat securely with the student. Confirm logistics (Pickup, Drop-off, or Meetup) and dietary safety precautions."
      },
      {
          icon: KeyRound,
          title: "4. Verify Delivery",
          desc: "Upon handover, ask the student for their 4-digit PIN. Entering this PIN in the app marks the transaction as successfully completed."
      },
      {
          icon: Star,
          title: "5. Community Impact",
          desc: "Receive feedback and see your impact grow. Your generosity fuels the next generation of scholars."
      }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Hero */}
      <header className="bg-slate-900 text-white py-20 relative overflow-hidden" role="banner">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">How It Works</h1>
            <p className="text-xl text-slate-100 max-w-2xl mx-auto">
               A simple, safe, and transparent process to connect students in need with generous neighbors.
            </p>
         </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10" role="main">
         <div className="bg-white rounded-2xl shadow-xl p-2 inline-flex space-x-2 mb-12" role="tablist" aria-label="Select user type">
            <button
              role="tab" 
              onClick={() => setActiveTab('STUDENT')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'STUDENT' ? 'bg-brand-600 text-white shadow-md' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
              aria-pressed={activeTab === 'STUDENT'}
            >
               I'm a Student
            </button>
            <button 
              role="tab"
              onClick={() => setActiveTab('DONOR')}
              className={`px-8 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'DONOR' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'}`}
              aria-pressed={activeTab === 'DONOR'}
            >
               I'm a Donor
            </button>
         </div>

         <section className="space-y-8" aria-label="Registration steps">
            {steps.map((step, idx) => (
                <article key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start text-center md:text-left animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className={`flex-shrink-0 p-4 rounded-full mb-4 md:mb-0 md:mr-8 ${activeTab === 'STUDENT' ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <step.icon className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h2>
                        <p className="text-slate-600 leading-relaxed">
                            {step.desc}
                        </p>
                    </div>
                </article>
            ))}
         </section>

         <section className="mt-16 text-center bg-brand-50 rounded-3xl p-10 border border-brand-100" aria-labelledby="cta-heading">
             <h2 id="cta-heading" className="text-2xl font-bold text-brand-900 mb-4">Ready to get started?</h2>
             <p className="text-brand-700 mb-8 max-w-xl mx-auto">
                Join thousands of verified community members making a difference today.
             </p>
             <div className="flex justify-center space-x-4">
                 <button 
                   className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                 >
                    {activeTab === 'STUDENT' ? 'Register as Student' : 'Register as Donor'}
                 </button>
             </div>
         </section>
      </main>
    </div>
  );
};

export default HowItWorksPage;