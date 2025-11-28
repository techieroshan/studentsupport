
import React from 'react';
import { ShieldCheck, Clock, AlertCircle } from 'lucide-react';
import { VerificationStatus } from '../types';

interface Props {
  status: VerificationStatus;
  showLabel?: boolean;
}

const VerificationBadge: React.FC<Props> = ({ status, showLabel = true }) => {
  if (status === VerificationStatus.VERIFIED) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200" title="Identity Verified">
        <ShieldCheck className="w-3 h-3 mr-1" />
        {showLabel && "Verified"}
      </span>
    );
  }
  
  if (status === VerificationStatus.PENDING) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200" title="Verification Pending">
        <Clock className="w-3 h-3 mr-1" />
        {showLabel && "Pending"}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200" title="Unverified">
      <AlertCircle className="w-3 h-3 mr-1" />
      {showLabel && "Unverified"}
    </span>
  );
};

export default VerificationBadge;
