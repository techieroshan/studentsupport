
import React from 'react';
import { Heart } from 'lucide-react';

interface Props {
  onNavigate?: (page: string) => void;
}

const Footer: React.FC<Props> = ({ onNavigate }) => (
  <footer className="bg-slate-900 text-white py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
           <div className="flex items-center mb-4">
             <div className="bg-brand-600 p-1.5 rounded-full mr-2">
                <Heart className="h-4 w-4 text-white" />
             </div>
             <span className="text-lg font-bold">New Abilities Foundation</span>
           </div>
           <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
             A 501(c)(3) Non-profit organization empowering students and communities. 
             This portal connects students in need with generous neighbors. 
             No money changes hands—just kindness and nutrition.
           </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-slate-200">Links</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="https://newabilities.org/about" className="hover:text-white">About Us</a></li>
            <li>
                <button onClick={() => onNavigate?.('donors')} className="hover:text-white text-left">Our Donors</button>
            </li>
            <li><a href="https://newabilities.org/donate" className="hover:text-white">Donate</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-4 text-slate-200">Contact</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>help@newabilities.org</li>
            <li>1-800-HEL-PSTUDENT</li>
            <li>San Francisco, CA</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} New Abilities Foundation. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
