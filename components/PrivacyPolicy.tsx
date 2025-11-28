
import React from 'react';
import { Lock, Eye, ShieldCheck, Database } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last Updated: November 27, 2025</p>

        <div className="space-y-8 text-slate-700 leading-relaxed">
          
          <p className="text-lg">
            New Abilities Foundation ("we", "our") is committed to protecting the privacy of the students and donors who use our StudentSupport platform. 
            This policy outlines how we handle sensitive data, including health information and location.
          </p>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
              <Database className="h-5 w-5 mr-2 text-brand-600" />
              1. Information We Collect
            </h2>
            <ul className="list-disc ml-5 space-y-2">
              <li><strong>Identity Verification Data:</strong> Government ID images and selfie biometrics are processed securely by our partner, Persona™. We do not store raw biometric data on our servers; we only store the verification result (Pass/Fail).</li>
              <li><strong>Health & Dietary Data:</strong> We collect dietary preferences (e.g., Vegan, Halal) and medical needs (e.g., Allergies) solely to facilitate safe food matching.</li>
              <li><strong>Location Data:</strong> We collect your city, zip code, and precise address. While your city is public to facilitate matching, your <strong>precise street address is never displayed publicly</strong> and is only shared with a confirmed match upon your consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your data to:</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Verify that students are currently enrolled and living away from home.</li>
              <li>Match students with donors based on proximity and dietary compatibility.</li>
              <li>Ensure the safety and security of our community.</li>
              <li>Comply with legal obligations and 501(c)(3) reporting requirements (anonymized/aggregated data only).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center">
              <Eye className="h-5 w-5 mr-2 text-brand-600" />
              3. Data Visibility & Anonymity
            </h2>
            <p>
              <strong>Students:</strong> Your profile is masked by default. Publicly, you are represented by an Avatar and a generic Display Name (e.g., "Student in San Jose"). Your real name and contact info are hidden until you confirm a match.
            </p>
            <p className="mt-2">
              <strong>Donors:</strong> You may choose to be anonymous or public. If anonymous, your contributions are listed under a pseudonym or "Anonymous Donor".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Data Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal information. We may share data with:
            </p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li><strong>Service Providers:</strong> Third-party vendors who help us operate (e.g., Persona for verification, Google Cloud for hosting).</li>
              <li><strong>Legal Authorities:</strong> If required by law, subpoena, or to protect the safety of any person.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Children's Privacy</h2>
            <p>
              This platform is intended for university students and adult donors (18+). We do not knowingly collect data from children under 13.
            </p>
          </section>

          <section className="border-t border-slate-200 pt-8 mt-12">
            <h3 className="font-bold text-slate-900 mb-4">Contact Us</h3>
            <p>If you have questions about this Privacy Policy, please contact us at:</p>
            <p className="mt-2"><strong>New Abilities Foundation</strong></p>
            <p>1320 Pepperhill Ln, Fort Worth, TX, 76131</p>
            <p>Phone: +1 (682) 432-9400</p>
            <p className="mt-4">
              <a href="https://newabilities.org/contact" className="text-brand-600 font-bold hover:underline">Contact Support</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
