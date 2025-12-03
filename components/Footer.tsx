
import React from 'react';
import { Heart } from 'lucide-react';
import { Donor } from '../types';

interface Props {
  onNavigate?: (page: string) => void;
  partners?: Donor[];
}

const Footer: React.FC<Props> = ({ onNavigate, partners = [] }) => (
  <footer className="bg-slate-900 text-white pt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
           <div className="flex items-center mb-4">
             <div className="bg-brand-600 p-1.5 rounded-full mr-2">
                <Heart className="h-4 w-4 text-white" />
             </div>
             <span className="text-lg font-bold">New Abilities Foundation</span>
           </div>
           <p className="text-slate-300 text-sm leading-relaxed max-w-sm">
             A 501(c)(3) Non-profit organization empowering students and communities. 
             This portal connects students in need with generous neighbors. 
             No money changes hands—just kindness and nutrition.
           </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-slate-200" id="footer-links-heading">Links</h3>
          <ul className="space-y-2 text-sm text-slate-300" aria-labelledby="footer-links-heading">
            <li><a href="https://newabilities.org/about" target="_blank" rel="noreferrer" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded">About Us</a></li>
            <li>
                <button onClick={() => onNavigate?.('donors')} className="hover:text-white text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded" aria-label="View our donors page">Our Donors</button>
            </li>
            <li><a href="https://newabilities.org/donate" target="_blank" rel="noreferrer" className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Donate</a></li>
            <li>
                <button onClick={() => onNavigate?.('privacy')} className="hover:text-white text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded" aria-label="View privacy policy">Privacy Policy</button>
            </li>
            <li>
                <button onClick={() => onNavigate?.('terms')} className="hover:text-white text-left transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded" aria-label="View terms of use">Terms of Use</button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-slate-200" id="footer-contact-heading">Contact</h3>
          <ul className="space-y-2 text-sm text-slate-300" aria-labelledby="footer-contact-heading">
            <li><a href="https://newabilities.org/contact" target="_blank" rel="noreferrer" className="hover:text-white underline transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 rounded">Contact Support</a></li>
            <li>+1 (682) 432-9400</li>
            <li>1320 Pepperhill Ln</li>
            <li>Fort Worth, TX, 76131</li>
          </ul>
        </div>
      </div>
    </div>
    
    {/* Partner Strip */}
    {partners.length > 0 && (
      <div className="border-t border-slate-800 bg-slate-950 py-6">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-xs font-bold text-slate-400 uppercase mb-4 text-center">Supported by our Platinum & Gold Partners</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
               {partners.map(p => (
                 <div key={p.id} className="flex items-center space-x-2" title={p.name}>
                    {p.logoUrl ? (
                        <img src={p.logoUrl} alt={`${p.name} logo`} className="h-8 object-contain" />
                    ) : (
                        <div className="h-8 px-3 bg-slate-800 rounded flex items-center text-xs font-bold" aria-label={p.name}>{p.name}</div>
                    )}
                 </div>
               ))}
            </div>
         </div>
      </div>
    )}

    <div className="border-t border-slate-800 py-6 text-center text-sm text-slate-400 bg-slate-900">
      &copy; {new Date().getFullYear()} New Abilities Foundation. All rights reserved.
    </div>
  </footer>
);

export default Footer;