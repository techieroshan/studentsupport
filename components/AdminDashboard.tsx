
import React, { useState } from 'react';
import { Users, AlertTriangle, FileText, CheckCircle, XCircle, Trash2, Shield, Eye, Check } from 'lucide-react';
import { Donor, DonorTier, FlaggedContent } from '../types';

interface Props {
  donors: Donor[];
  flaggedItems: FlaggedContent[];
  onDeleteDonor: (id: string) => void;
  onDismissFlag: (id: string, itemId: string, itemType: 'REQUEST' | 'OFFER') => void;
  onDeleteContent: (id: string, itemId: string, itemType: 'REQUEST' | 'OFFER') => void;
}

const AdminDashboard: React.FC<Props> = ({ donors, flaggedItems, onDeleteDonor, onDismissFlag, onDeleteContent }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DONORS' | 'MODERATION'>('OVERVIEW');

  const recentUsers = [
    { id: 'u1', name: 'Anonymous Owl', role: 'SEEKER', status: 'VERIFIED', location: 'San Jose, CA' },
    { id: 'u2', name: 'Kind Bear', role: 'DONOR', status: 'VERIFIED', location: 'Austin, TX' },
    { id: 'u3', name: 'Unknown User', role: 'SEEKER', status: 'PENDING', location: 'New York, NY' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Admin Dashboard</h1>
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('OVERVIEW')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'OVERVIEW' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Overview
           </button>
           <button 
             onClick={() => setActiveTab('MODERATION')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'MODERATION' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Moderation ({flaggedItems.length})
           </button>
           <button 
             onClick={() => setActiveTab('DONORS')}
             className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'DONORS' ? 'bg-white shadow text-brand-600' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Manage Donors
           </button>
        </div>
      </div>
      
      {activeTab === 'OVERVIEW' && (
        <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Total Users</p>
                    <p className="text-3xl font-bold text-brand-600">1,240</p>
                    </div>
                    <Users className="h-8 w-8 text-brand-200" />
                </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Active Requests</p>
                    <p className="text-3xl font-bold text-accent-600">342</p>
                    </div>
                    <FileText className="h-8 w-8 text-accent-200" />
                </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Flagged Items</p>
                    <p className={`text-3xl font-bold ${flaggedItems.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>{flaggedItems.length}</p>
                    </div>
                    <AlertTriangle className={`h-8 w-8 ${flaggedItems.length > 0 ? 'text-red-200' : 'text-slate-200'}`} />
                </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Total Donors</p>
                    <p className="text-3xl font-bold text-emerald-600">{donors.length}</p>
                    </div>
                    <Shield className="h-8 w-8 text-emerald-200" />
                </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Recent Registrations</h3>
                </div>
                <div className="divide-y divide-slate-100">
                {recentUsers.map(u => (
                    <div key={u.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600">
                            {u.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.location}</p>
                        </div>
                        </div>
                        <div className="flex items-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold mr-2 ${u.role === 'SEEKER' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {u.role}
                        </span>
                        {u.status === 'VERIFIED' ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-slate-300" />}
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </>
      )}

      {activeTab === 'MODERATION' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex justify-between items-center">
            <h3 className="font-bold text-red-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" /> Moderation Queue
            </h3>
            <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">{flaggedItems.length} Pending</span>
            </div>
            {flaggedItems.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-200" />
                    <p>All clear! No flagged content to review.</p>
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                {flaggedItems.map(item => (
                    <div key={item.id} className="p-4 hover:bg-slate-50 transition">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mr-2 ${item.itemType === 'REQUEST' ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                        {item.itemType}
                                    </span>
                                    <span className="text-xs text-slate-500">Flagged by {item.flaggedBy} • {new Date(item.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="font-bold text-sm text-slate-900 mb-1">Reason: <span className="text-red-600">"{item.reason}"</span></p>
                                <div className="bg-slate-100 p-3 rounded text-sm text-slate-700 italic border border-slate-200">
                                    "{item.description}"
                                </div>
                            </div>
                            <div className="flex space-x-2 shrink-0">
                                <button 
                                    onClick={() => onDismissFlag(item.id, item.itemId, item.itemType)}
                                    className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300 flex items-center"
                                >
                                    <Check className="h-3 w-3 mr-1" /> Keep (Dismiss)
                                </button>
                                <button 
                                    onClick={() => onDeleteContent(item.id, item.itemId, item.itemType)}
                                    className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700 flex items-center"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" /> Delete Content
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
        </div>
      )}

      {activeTab === 'DONORS' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Institutional Donors & Partners</h3>
                <span className="text-sm text-slate-500">{donors.length} records</span>
             </div>
             <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-3 font-bold">Name</th>
                      <th className="px-6 py-3 font-bold">Tier</th>
                      <th className="px-6 py-3 font-bold">Contribution</th>
                      <th className="px-6 py-3 font-bold text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {donors.map(donor => (
                      <tr key={donor.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="font-bold text-slate-900">{donor.isAnonymous ? (donor.anonymousName || "Anonymous") : donor.name}</div>
                            <div className="text-xs text-slate-500">{donor.category}</div>
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${donor.tier === DonorTier.PLATINUM ? 'bg-slate-100 text-slate-800' : donor.tier === DonorTier.GOLD ? 'bg-amber-100 text-amber-800' : 'bg-slate-50 text-slate-600'}`}>
                                {donor.tier}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-700">
                            {donor.totalContributionDisplay}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button 
                               onClick={() => {
                                   if(confirm('Are you sure you want to remove this donor?')) {
                                       onDeleteDonor(donor.id);
                                   }
                               }}
                               className="p-2 text-slate-600 hover:text-red-600 transition"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;
