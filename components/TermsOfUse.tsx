
import React from 'react';
import { ShieldAlert, Scale, ScrollText, AlertTriangle, UserX, Lock, Shield } from 'lucide-react';

const TermsOfUse: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Terms of Use & Liability Waiver</h1>
        <p className="text-slate-500 mb-8">Last Updated: November 27, 2025</p>

        <div className="space-y-8 text-slate-700 leading-relaxed">
          
          <section className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg">
            <h2 className="text-xl font-bold text-red-800 flex items-center mb-3">
              <AlertTriangle className="h-6 w-6 mr-2" />
              CRITICAL HEALTH & SAFETY DISCLAIMER
            </h2>
            <p className="font-bold mb-2">PLEASE READ THIS SECTION CAREFULLY. IT LIMITS OUR LIABILITY.</p>
            <p className="text-sm">
              New Abilities Foundation ("The Foundation") is strictly a technology facilitator connecting independent donors with students. 
              <strong> We do not prepare, cook, inspect, package, or handle any food.</strong> All meals are prepared by private individuals in unregulated home kitchens.
            </p>
            <p className="text-sm mt-2">
              By accepting a meal, you acknowledge and agree that:
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>You are consuming food at your own risk.</li>
                <li>The Foundation makes no warranties regarding the safety, ingredients, allergens, or quality of the food.</li>
                <li>You release The Foundation, its officers, donors, and partners from ANY liability regarding food poisoning, allergic reactions, illness, or injury resulting from the consumption of donated food.</li>
              </ul>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
              <Scale className="h-5 w-5 mr-2 text-brand-600" />
              1. The Good Samaritan Food Donation Act
            </h2>
            <p>
              The Foundation and its verified Donors operate under the protection of the <strong>Bill Emerson Good Samaritan Food Donation Act (42 U.S.C. § 1791)</strong>. 
              This Federal law protects individuals and non-profit organizations who donate food in good faith from civil and criminal liability, absent gross negligence or intentional misconduct.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Platform Role</h2>
            <p>
              StudentSupport is a communications platform. We verify identities via Persona™ to enhance community safety, but verification does not guarantee a user's behavior, background, or the safety of their food environment. 
              We are not a restaurant, caterer, or food delivery service. We do not conduct criminal background checks on all users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. User Obligations</h2>
            <ul className="list-disc ml-5 space-y-2">
              <li><strong>Donors:</strong> You agree to follow standard food safety practices (washing hands, avoiding cross-contamination, cooking to proper temperatures). You agree only to donate fresh, wholesome food fit for human consumption.</li>
              <li><strong>Students:</strong> You agree to disclose all severe allergies. However, you understand that cross-contamination in home kitchens is possible and The Foundation cannot guarantee allergen-free environments.</li>
            </ul>
          </section>

          <section className="bg-slate-50 p-6 rounded-lg border border-slate-200">
             <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-slate-600" />
                4. Personal Safety & Interaction Disclaimer
             </h2>
             <p className="mb-3 font-bold">YOU ARE SOLELY RESPONSIBLE FOR YOUR INTERACTIONS WITH OTHER USERS.</p>
             <p>
                The Foundation cannot guarantee the safety of offline interactions. You agree to take reasonable precautions in all interactions with other users, particularly if you decide to meet offline or in person (e.g., for pickup or delivery).
             </p>
             <p className="mt-2">
                We strongly recommend:
             </p>
             <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
                <li>Meeting in public, well-lit areas whenever possible.</li>
                <li>Letting a friend or family member know where you are going.</li>
                <li>Trusting your instincts—if a situation feels unsafe, leave immediately.</li>
             </ul>
             <p className="mt-3 text-xs uppercase font-bold tracking-wide text-red-600">
                It is strongly recommended that sensitive personal, financial, and family information NOT be shared with strangers. The Foundation is not responsible for any physical harm, injury, emotional distress, or other damages resulting from communications or meetings with other registered users.
             </p>
          </section>

          <section>
             <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-slate-600" />
                5. Prohibited Information & Financial Safety
             </h2>
             <p>
                Our platform is designed to be free of charge for students. 
                <strong> You agree NOT to solicit or provide money, loans, or financial assistance</strong> to other users through the platform.
             </p>
             <p className="mt-2">
                You should strictly avoid sharing sensitive personal information with strangers, including but not limited to:
             </p>
             <ul className="list-disc ml-5 mt-1 space-y-1 text-sm">
                <li>Bank account or credit card numbers.</li>
                <li>Social Security or National ID numbers.</li>
                <li>Sensitive family details or schedules of family members.</li>
             </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless New Abilities Foundation, its directors, officers, employees, and agents from any claims, damages, liabilities, costs, or expenses (including legal fees) arising from:
              (i) your use of the platform; (ii) your consumption of donated food; (iii) any physical interaction with other users; or (iv) your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Governing Law & Jurisdiction</h2>
            <p>
              These Terms shall be governed by the laws of the State of Texas. Any dispute arising from these Terms or the use of the platform shall be resolved exclusively in the state or federal courts located in <strong>Fort Worth, Texas</strong>.
            </p>
          </section>

          <section className="border-t border-slate-200 pt-8 mt-12">
            <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
            <p className="mb-2"><strong>New Abilities Foundation</strong> (501(c)(3) Non-Profit)</p>
            <p>1320 Pepperhill Ln</p>
            <p>Fort Worth, TX, 76131</p>
            <p className="mt-2">Phone: +1 (682) 432-9400</p>
            <p className="mt-4">
              For all inquiries, please visit: <a href="https://newabilities.org/contact" className="text-brand-600 font-bold hover:underline">https://newabilities.org/contact</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;
