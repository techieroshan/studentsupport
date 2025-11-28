
import React from 'react';
import { Users, AlertTriangle, FileText, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  // Mock Admin Data
  const flaggedItems = [
    { id: '1', type: 'REQUEST', reason: 'Inappropriate language', reporter: 'Student B.', time: '2h ago' },
    { id: '2', type: 'OFFER', reason: 'Suspicious location', reporter: 'Donor A.', time: '5h ago' }
  ];

  const recentUsers = [
    { id: 'u1', name: 'Anonymous Owl', role: 'SEEKER', status: 'VERIFIED', location: 'San Jose, CA' },
    { id: 'u2', name: 'Kind Bear', role: 'DONOR', status: 'VERIFIED', location: 'Austin, TX' },
    { id: 'u3', name: 'Unknown User', role: 'SEEKER', status: 'PENDING', location: 'New York, NY' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
               <p className="text-3xl font-bold text-red-600">2</p>
             </div>
             <AlertTriangle className="h-8 w-8 text-red-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Flagged Content */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-red-50 flex justify-between items-center">
               <h3 className="font-bold text-red-800 flex items-center">
                 <AlertTriangle className="h-4 w-4 mr-2" /> Pending Flags
               </h3>
               <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded-full font-bold">Action Required</span>
            </div>
            <div className="divide-y divide-slate-100">
               {flaggedItems.map(item => (
                 <div key={item.id} className="p-4 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="font-bold text-sm text-slate-900">{item.type} Flagged</p>
                          <p className="text-xs text-slate-500">Reported by {item.reporter} • {item.time}</p>
                          <p className="text-sm text-red-600 mt-1">Reason: "{item.reason}"</p>
                       </div>
                       <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded hover:bg-slate-300">Ignore</button>
                          <button className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700">Delete Content</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Recent Users */}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
