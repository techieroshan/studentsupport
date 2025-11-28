
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StatsChart from './components/StatsChart';
import AuthModal from './components/AuthModal';
import LocationUpdateModal from './components/LocationUpdateModal';
import MapVisualizer from './components/MapVisualizer';
import ItemDetailModal from './components/ItemDetailModal';
import ChatModal from './components/ChatModal';
import SuccessStories from './components/SuccessStories';
import AdminDashboard from './components/AdminDashboard';
import RatingModal from './components/RatingModal';
import DonorsPage from './components/DonorsPage';
import { User, UserRole, VerificationStatus, DietaryPreference, MedicalPreference, MealRequest, MealOffer, DeliveryMethod, Frequency } from './types';
import { Users, Utensils, MapPin, Search, PlusCircle, Check, AlertCircle, Quote, Loader2, Filter, ArrowRight, Share2, Repeat, Heart, GraduationCap, Globe, CheckCircle2, X, History, TrendingUp } from 'lucide-react';
import { analyzeMealDietaryTags, generateEncouragement, moderateContent } from './services/geminiService';

// --- Types for Local State ---
type Page = 'home' | 'login-seeker' | 'login-donor' | 'dashboard-seeker' | 'dashboard-donor' | 'post-offer' | 'post-request' | 'browse' | 'admin' | 'donors';

// --- Mock Data ---
const MOCK_STATS = [
  { name: 'Jan', value: 420 },
  { name: 'Feb', value: 560 },
  { name: 'Mar', value: 890 },
  { name: 'Apr', value: 1200 },
];

const MOCK_REQUESTS: MealRequest[] = [
  {
    id: 'req-1',
    seekerId: 's-1',
    seekerName: 'Studious Owl',
    seekerAvatarId: 1,
    city: 'San Jose',
    state: 'CA',
    zip: '95112',
    country: 'United States',
    dietaryNeeds: [DietaryPreference.VEGAN],
    medicalNeeds: [MedicalPreference.NONE],
    description: 'Finals week is crazy! Would love a healthy vegan dinner.',
    frequency: Frequency.ONCE,
    postedAt: Date.now() - 3600000,
    status: 'OPEN'
  },
  {
    id: 'req-2',
    seekerId: 's-2',
    seekerName: 'Blue Jay',
    seekerAvatarId: 4,
    city: 'Santa Clara',
    state: 'CA',
    zip: '95050',
    country: 'United States',
    dietaryNeeds: [DietaryPreference.JAIN_VEG],
    medicalNeeds: [MedicalPreference.NO_OIL],
    description: 'Missing home cooked Jain food. Any help appreciated.',
    frequency: Frequency.WEEKLY,
    postedAt: Date.now() - 86400000,
    status: 'OPEN'
  },
  {
    id: 'req-3',
    seekerId: 's-3',
    seekerName: 'Red Fox',
    seekerAvatarId: 2,
    city: 'London',
    state: 'GL',
    zip: 'EC1A',
    country: 'United Kingdom',
    dietaryNeeds: [DietaryPreference.HALAL],
    medicalNeeds: [MedicalPreference.NONE],
    description: 'Craving some homemade biryani or curry if possible!',
    frequency: Frequency.ONCE,
    postedAt: Date.now() - 172800000,
    status: 'OPEN'
  }
];

const AVATARS = [
  "https://picsum.photos/seed/student1/200",
  "https://picsum.photos/seed/student2/200",
  "https://picsum.photos/seed/student3/200",
  "https://picsum.photos/seed/student4/200",
  "https://picsum.photos/seed/donor1/200",
  "https://picsum.photos/seed/donor2/200",
  "https://picsum.photos/seed/tech/200",
  "https://picsum.photos/seed/art/200"
];

// --- Simple Toast Component ---
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed top-24 right-4 z-[100] bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center animate-in slide-in-from-right duration-300">
    <div className="bg-green-500 rounded-full p-1 mr-3">
      <CheckCircle2 className="h-4 w-4 text-white" />
    </div>
    <span className="font-medium text-sm mr-4">{message}</span>
    <button onClick={onClose} className="text-slate-400 hover:text-white">
      <X className="h-4 w-4" />
    </button>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole>(UserRole.SEEKER);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dashboard Tabs
  const [dashboardTab, setDashboardTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  // Interaction State
  const [selectedItem, setSelectedItem] = useState<MealRequest | MealOffer | null>(null);
  const [visibleItems, setVisibleItems] = useState<(MealRequest | MealOffer)[]>([]); 
  const [activeChat, setActiveChat] = useState<{ recipientName: string; recipientAvatarId: number; itemName: string } | null>(null);
  
  // Browse Search State
  const [browseLocation, setBrowseLocation] = useState('');

  // App Data
  const [requests, setRequests] = useState<MealRequest[]>(MOCK_REQUESTS);
  const [offers, setOffers] = useState<MealOffer[]>([]);
  const [motivationalQuote, setMotivationalQuote] = useState<string>("");

  // --- Effects ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    if (currentUser?.role === UserRole.SEEKER) {
      generateEncouragement(currentUser.displayName).then(setMotivationalQuote);
    }
  }, [currentUser]);

  useEffect(() => {
     if (currentPage === 'dashboard-donor') {
       setVisibleItems(requests.filter(r => r.status === 'OPEN'));
     } else if (currentPage === 'dashboard-seeker') {
       setVisibleItems(offers);
     } else if (currentPage === 'browse') {
       // Apply location filter if exists, otherwise show all active
       if (browseLocation.trim()) {
         const lower = browseLocation.toLowerCase();
         const filtered = requests.filter(r => 
           r.city.toLowerCase().includes(lower) || 
           r.country.toLowerCase().includes(lower) || 
           r.zip.includes(lower)
         );
         setVisibleItems(filtered);
       } else {
         setVisibleItems(requests);
       }
     }
  }, [currentPage, requests, offers, browseLocation]);

  // --- Handlers ---

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigate = (page: string) => {
    if (page === 'login-seeker') {
      handleLoginStart(UserRole.SEEKER, 'LOGIN');
    } else if (page === 'login-donor') {
      handleLoginStart(UserRole.DONOR, 'LOGIN');
    } else {
      setCurrentPage(page as Page);
    }
  };

  const handleLoginStart = (role: UserRole, mode: 'LOGIN' | 'REGISTER') => {
    setPendingRole(role);
    setAuthInitialMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthComplete = (data: any, isLogin: boolean) => {
    setShowAuthModal(false);
    
    // Check if Admin
    if (data.email?.includes('admin')) {
        const adminUser: User = {
            id: 'admin',
            role: UserRole.ADMIN,
            verificationStatus: VerificationStatus.VERIFIED,
            displayName: 'System Admin',
            avatarId: 0,
            city: data.city,
            state: data.state || 'CA',
            zip: data.zip,
            country: data.country,
            radius: 0,
            email: data.email
        };
        setCurrentUser(adminUser);
        setCurrentPage('admin');
        showToast('Welcome, Admin.');
        return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      role: pendingRole,
      verificationStatus: VerificationStatus.VERIFIED,
      displayName: data.displayName || (pendingRole === UserRole.SEEKER ? 'Hopeful Scholar' : 'Kind Neighbor'),
      avatarId: data.avatarId,
      city: data.city,
      state: data.state,
      zip: data.zip,
      country: data.country,
      address: data.address,
      radius: data.radius,
      email: data.email, 
      phone: data.phone,
      isAnonymous: true,
      preferences: pendingRole === UserRole.SEEKER ? [] : undefined
    };

    setCurrentUser(newUser);
    setCurrentPage(pendingRole === UserRole.SEEKER ? 'dashboard-seeker' : 'dashboard-donor');
    setPendingRole(UserRole.SEEKER); // reset default
    showToast(isLogin ? `Welcome back, ${newUser.displayName}!` : `Verification Complete. Welcome!`);
  };

  const handleLocationUpdate = (data: { city: string; state: string; zip: string; country: string; reason: string }) => {
    if (currentUser) {
        setCurrentUser({
            ...currentUser,
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country
        });
    }
    setShowLocationModal(false);
    showToast('Location updated successfully.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    showToast('Logged out successfully.');
  };

  const handleViewItem = (item: MealRequest | MealOffer) => {
    setSelectedItem(item);
  };

  const handleMapVisibleItemsChange = (items: (MealRequest | MealOffer)[]) => {
     // Only update if we are not explicitly searching
     if (!browseLocation.trim()) {
        setVisibleItems(items);
     }
  };

  const handleShareStats = () => {
    const text = `Join me in supporting students! ${MOCK_STATS.reduce((acc, curr) => acc + curr.value, 0)} meals shared on StudentSupport. Visit https://studentsupport.newabilities.org`;
    navigator.clipboard.writeText(text);
    showToast('Impact link copied to clipboard!');
  };

  const handleModalAction = () => {
    if (!currentUser) {
      setSelectedItem(null);
      const isRequest = 'seekerId' in selectedItem!;
      handleLoginStart(isRequest ? UserRole.DONOR : UserRole.SEEKER, 'LOGIN');
      return;
    }
    if (selectedItem) {
        const isRequest = 'seekerId' in selectedItem;
        setActiveChat({
            recipientName: isRequest ? (selectedItem as MealRequest).seekerName : (selectedItem as MealOffer).donorName,
            recipientAvatarId: isRequest ? (selectedItem as MealRequest).seekerAvatarId : (selectedItem as MealOffer).donorAvatarId,
            itemName: selectedItem.description
        });
        setSelectedItem(null); 
    }
  };

  const handleFlagItem = () => {
     alert("Item has been flagged for Admin review.");
     setSelectedItem(null);
  };

  const handleMarkComplete = () => {
     setSelectedItem(null);
     setShowRatingModal(true);
  };

  const handleRatingSubmit = (stars: number, comment: string) => {
     setShowRatingModal(false);
     showToast("Transaction completed and rated. Thank you!");
  };

  const handlePostRequest = async (description: string, dietaryNeeds: DietaryPreference[], medicalNeeds: MedicalPreference[], frequency: Frequency) => {
    if (!currentUser) return;
    
    const isSafe = await moderateContent(description);
    if (!isSafe) {
      alert("Please revise your message to keep our community safe.");
      return;
    }

    const newReq: MealRequest = {
      id: Date.now().toString(),
      seekerId: currentUser.id,
      seekerName: currentUser.displayName,
      seekerAvatarId: currentUser.avatarId,
      city: currentUser.city,
      state: currentUser.state,
      zip: currentUser.zip,
      country: currentUser.country,
      dietaryNeeds,
      medicalNeeds,
      description,
      frequency,
      postedAt: Date.now(),
      status: 'OPEN'
    };
    setRequests([newReq, ...requests]);
    setCurrentPage('dashboard-seeker');
    showToast('Request posted successfully!');
  };

  const handlePostOffer = async (description: string, delivery: DeliveryMethod, frequency: Frequency) => {
    if (!currentUser) return;

    const isSafe = await moderateContent(description);
    if (!isSafe) {
       alert("Content flagged. Please be respectful.");
       return;
    }

    const tags = await analyzeMealDietaryTags(description);
    
    const newOffer: MealOffer = {
      id: Date.now().toString(),
      donorId: currentUser.id,
      donorName: currentUser.displayName,
      donorAvatarId: currentUser.avatarId,
      city: currentUser.city,
      state: currentUser.state,
      zip: currentUser.zip,
      country: currentUser.country,
      description,
      dietaryTags: tags,
      availableUntil: Date.now() + 86400000,
      deliveryMethod: delivery,
      frequency,
      status: 'AVAILABLE'
    };
    setOffers([newOffer, ...offers]);
    setCurrentPage('dashboard-donor');
    showToast('Meal offer posted successfully!');
  };

  const handleBrowseSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (browseLocation.trim()) {
      showToast(`Zooming into area: ${browseLocation}`);
    }
  };

  // --- Render Helpers ---

  const renderHome = () => (
    <>
      <div className="relative bg-slate-50 overflow-hidden pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 text-center">
             <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                No Student Should <span className="text-brand-600">Go Hungry.</span>
             </h1>
             <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
                A global community connecting students away from home with free, home-cooked meals from verified neighbors.
             </p>

             {/* Main CTAs */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-brand-100 p-8 hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group cursor-pointer" onClick={() => handleLoginStart(UserRole.SEEKER, 'REGISTER')}>
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                        <GraduationCap className="h-8 w-8 text-brand-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Request a Meal</h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                        Living >30 miles from home? Verified students can request free, nutritious meals.
                    </p>
                    <button className="w-full py-3 rounded-xl font-bold bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition">
                        I Need Food
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-8 hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group cursor-pointer" onClick={() => handleLoginStart(UserRole.DONOR, 'REGISTER')}>
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                        <Utensils className="h-8 w-8 text-emerald-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Share a Meal</h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                        Cooked extra? Share your home-cooked food with a verified student nearby.
                    </p>
                    <button className="w-full py-3 rounded-xl font-bold bg-emerald-600 text-white shadow-lg hover:bg-emerald-700 transition">
                        Post Meal Offer
                    </button>
                </div>

                 <div className="bg-white rounded-2xl shadow-xl border border-accent-100 p-8 hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group cursor-pointer" onClick={() => setCurrentPage('browse')}>
                    <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-accent-600 transition-colors">
                        <Heart className="h-8 w-8 text-accent-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Browse Requests</h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                        See who needs help in your city and offer to fulfill a specific request.
                    </p>
                    <button className="w-full py-3 rounded-xl font-bold bg-accent-600 text-white shadow-lg hover:bg-accent-700 transition">
                        I Want to Help
                    </button>
                </div>
             </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-white py-12 border-b border-slate-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
               <div className="w-full md:w-1/2">
                  <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Our Growing Impact</h2>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <p className="text-4xl font-extrabold text-brand-600 mb-1">2.4k</p>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Meals Shared</p>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <p className="text-4xl font-extrabold text-emerald-600 mb-1">850+</p>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Students Helped</p>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <p className="text-4xl font-extrabold text-accent-600 mb-1">120</p>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">Cities Active</p>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-center items-center cursor-pointer hover:bg-slate-100 transition" onClick={handleShareStats}>
                        <Share2 className="h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-slate-500">Share Impact</p>
                     </div>
                  </div>
               </div>
               <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800">Monthly Meals Provided</h3>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <StatsChart data={MOCK_STATS} />
               </div>
            </div>
         </div>
      </div>

      <div className="bg-slate-50 py-16">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-slate-900">How It Works</h2>
                <p className="mt-2 text-lg text-slate-500">Safe, secure, and community-driven.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-slate-200 -z-10"></div>
                {[{icon:Check,title:'1. Verify',t:'We verify student enrollment & location to ensure safety and authenticity.'},{icon:MapPin,title:'2. Connect',t:'Post a request or offer. Matches are based on location (20mi radius) & diet.'},{icon:Utensils,title:'3. Share',t:'Coordinate pickup or delivery via our secure, anonymous chat.'},{icon:Heart,title:'4. Impact',t:'Enjoy a home-cooked meal. Rate the experience and spread the love.'}].map((s,i)=>(
                 <div key={i} className="text-center bg-white p-6 rounded-xl shadow-sm md:bg-transparent md:shadow-none">
                    <div className="w-24 h-24 mx-auto bg-white border-4 border-brand-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <s.icon className="h-10 w-10 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600">{s.t}</p>
                </div>
                ))}
            </div>
         </div>
      </div>
      <SuccessStories />
    </>
  );

  const renderSeekerDashboard = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {motivationalQuote && (
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
          <Quote className="absolute top-2 left-2 h-12 w-12 text-white opacity-20" />
          <p className="text-center text-lg font-medium relative z-10">"{motivationalQuote}"</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-slate-200 pb-2">
         <button onClick={() => setDashboardTab('ACTIVE')} className={`pb-2 font-bold ${dashboardTab === 'ACTIVE' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}>Active Offers</button>
         <button onClick={() => setDashboardTab('HISTORY')} className={`pb-2 font-bold ${dashboardTab === 'HISTORY' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}>Request History</button>
      </div>

      {dashboardTab === 'ACTIVE' ? (
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    Available Meals 
                    <span className="ml-3 px-3 py-1 bg-slate-200 text-slate-700 text-sm rounded-full font-semibold flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> {currentUser?.city}, {currentUser?.country}
                    </span>
                </h2>
                <p className="text-slate-600 text-sm mt-1 font-medium">
                    Showing {visibleItems.length} active offers
                </p>
                </div>
                <button 
                onClick={() => setCurrentPage('post-request')}
                className="flex items-center bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 transition shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                >
                <PlusCircle className="h-5 w-5 mr-2" />
                Request a Meal
                </button>
            </div>
            <div className="mb-8">
                <MapVisualizer 
                items={offers} 
                centerCity={currentUser?.city || "San Jose"} 
                radius={currentUser?.radius || 20} 
                userRole={UserRole.SEEKER} 
                onSelect={handleViewItem}
                onVisibleItemsChange={handleMapVisibleItemsChange}
                />
            </div>
        </>
      ) : (
          <div className="bg-white rounded-xl shadow p-6 text-center text-slate-500">
             <History className="h-12 w-12 mx-auto mb-3 text-slate-300"/>
             <p>No past requests found.</p>
          </div>
      )}
    </div>
  );

  const renderDonorDashboard = () => (
     <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6 border-b border-slate-200 pb-2">
            <button onClick={() => setDashboardTab('ACTIVE')} className={`pb-2 font-bold ${dashboardTab === 'ACTIVE' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}>Community Needs</button>
            <button onClick={() => setDashboardTab('HISTORY')} className={`pb-2 font-bold ${dashboardTab === 'HISTORY' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}>My Offers</button>
        </div>

      {dashboardTab === 'ACTIVE' && (
      <>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
            <div>
            <h2 className="text-2xl font-bold text-slate-900">Active Requests</h2>
            <p className="text-slate-600 text-sm flex items-center mt-1 font-medium">
                <Filter className="h-3 w-3 mr-1" />
                Showing {visibleItems.length} students in map view
            </p>
            </div>
            <button 
            onClick={() => setCurrentPage('post-offer')}
            className="flex items-center bg-accent-600 text-white px-6 py-2.5 rounded-lg hover:bg-accent-700 transition shadow-lg shadow-accent-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
            >
            <PlusCircle className="h-5 w-5 mr-2" />
            Offer a Meal
            </button>
        </div>

        <div className="mb-8">
            <MapVisualizer 
            items={requests.filter(r => r.status === 'OPEN')} 
            centerCity={currentUser?.city || "San Jose"} 
            radius={currentUser?.radius || 20} 
            userRole={UserRole.DONOR} 
            onSelect={handleViewItem}
            onVisibleItemsChange={handleMapVisibleItemsChange}
            />
        </div>
      </>
      )}
     </div>
  );

  const renderPublicBrowse = () => (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Community Map</h2>
        <p className="text-slate-600 mt-2 max-w-2xl mx-auto text-lg">
          See where students in your area need a helping hand. Log in to offer support.
        </p>
      </div>
      
      {/* Location Search Bar */}
      <div className="max-w-xl mx-auto mb-8 relative z-10">
         <form onSubmit={handleBrowseSearch} className="relative shadow-lg rounded-full">
            <input 
               type="text" 
               value={browseLocation}
               onChange={(e) => setBrowseLocation(e.target.value)}
               placeholder="Search by City, Zip, or Country..."
               className="w-full pl-6 pr-14 py-4 rounded-full border border-slate-200 bg-brand-50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-slate-700 placeholder-slate-500"
            />
            <button 
               type="submit" 
               className="absolute right-2 top-2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full transition"
            >
               <Search className="h-5 w-5" />
            </button>
         </form>
      </div>

      <div className="mb-10">
         <MapVisualizer 
           items={visibleItems} 
           centerCity={browseLocation || "Global View"} 
           radius={20} 
           userRole={'GUEST'} 
           onSelect={handleViewItem}
           onVisibleItemsChange={handleMapVisibleItemsChange}
         />
      </div>
      
      {/* List view */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center justify-between">
           <span>Visible Requests</span>
           <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">
             {visibleItems.length} found
           </span>
        </h3>
        {visibleItems.length === 0 ? (
             <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Globe className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No requests found in this area. Try a different search term.</p>
             </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {visibleItems.map(item => {
              const req = item as MealRequest;
              return (
              <div key={req.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col h-full hover:shadow-md transition">
                  <div className="flex items-center mb-4">
                      <img src={AVATARS[req.seekerAvatarId] || AVATARS[0]} alt="" className="h-10 w-10 rounded-full bg-slate-200" />
                      <div className="ml-3">
                        <h4 className="text-sm font-bold text-slate-900">{req.seekerName}</h4>
                        <p className="text-xs text-slate-500">{req.city}, {req.state}, {req.country}</p>
                      </div>
                  </div>
                  <p className="text-slate-800 text-sm mb-4 flex-grow line-clamp-3">"{req.description}"</p>
                  <button 
                    onClick={() => handleViewItem(req)}
                    className="w-full mt-2 py-2 text-brand-600 border border-brand-200 rounded-lg text-sm font-bold hover:bg-brand-50 transition"
                  >
                    View Details
                  </button>
              </div>
           )})}
        </div>
        )}
      </div>
    </div>
  );

  const renderPostForm = (type: 'OFFER' | 'REQUEST') => {
    const [desc, setDesc] = useState('');
    const [selectedDiets, setSelectedDiets] = useState<DietaryPreference[]>([]);
    const [selectedMedicals, setSelectedMedicals] = useState<MedicalPreference[]>([]);
    const [selectedFreq, setSelectedFreq] = useState<Frequency>(Frequency.ONCE);
    const [loading, setLoading] = useState(false);

    const toggleDiet = (d: DietaryPreference) => {
      if (selectedDiets.includes(d)) setSelectedDiets(selectedDiets.filter(x => x !== d));
      else setSelectedDiets([...selectedDiets, d]);
    };
    
    const toggleMedical = (m: MedicalPreference) => {
      if (selectedMedicals.includes(m)) setSelectedMedicals(selectedMedicals.filter(x => x !== m));
      else setSelectedMedicals([...selectedMedicals, m]);
    };

    const submit = async () => {
       setLoading(true);
       if(type === 'REQUEST') await handlePostRequest(desc, selectedDiets, selectedMedicals, selectedFreq);
       else await handlePostOffer(desc, DeliveryMethod.PICKUP, selectedFreq);
       setLoading(false);
    };

    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
         <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {type === 'REQUEST' ? 'Request a Meal' : 'Offer a Meal'}
            </h2>
            
            <div className="mb-6">
               <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
               <textarea 
                 value={desc}
                 onChange={(e) => setDesc(e.target.value)}
                 rows={3}
                 className="w-full bg-white border border-slate-400 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                 placeholder={type === 'REQUEST' ? "e.g. Need a healthy dinner..." : "e.g. Cooking lasagna..."}
               />
            </div>

            <div className="mb-6">
               <label className="block text-sm font-bold text-slate-700 mb-3">Frequency</label>
               <div className="flex flex-wrap gap-2">
                 {Object.values(Frequency).map(freq => (
                    <button
                      key={freq}
                      onClick={() => setSelectedFreq(freq)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedFreq === freq ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                      {freq}
                    </button>
                 ))}
               </div>
            </div>

            {type === 'REQUEST' && (
             <>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Dietary Preferences</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(DietaryPreference).map(pref => (
                    <button
                      key={pref}
                      onClick={() => toggleDiet(pref)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedDiets.includes(pref) ? 'bg-brand-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-3">Medical / Other Needs</label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(MedicalPreference).map(pref => (
                    <button
                      key={pref}
                      onClick={() => toggleMedical(pref)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition ${selectedMedicals.includes(pref) ? 'bg-red-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>
             </>
            )}

            <div className="flex items-center justify-end space-x-4">
               <button onClick={() => setCurrentPage('home')} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg">Cancel</button>
               <button onClick={submit} disabled={!desc || loading} className="px-6 py-2 rounded-lg text-white font-bold bg-brand-600 hover:bg-brand-700 flex items-center">
                 {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                 Post
               </button>
            </div>
         </div>
      </div>
    );
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onUpdateLocation={() => setShowLocationModal(true)}
        />
        
        <main className="flex-grow">
          {currentPage === 'home' && renderHome()}
          {currentPage === 'admin' && <AdminDashboard />}
          {currentPage === 'donors' && <DonorsPage />}
          {currentPage === 'browse' && renderPublicBrowse()}
          {currentPage === 'dashboard-seeker' && currentUser?.role === UserRole.SEEKER && renderSeekerDashboard()}
          {currentPage === 'dashboard-donor' && currentUser?.role === UserRole.DONOR && renderDonorDashboard()}
          {(currentPage === 'post-request' || currentPage === 'post-offer') && renderPostForm(currentPage === 'post-request' ? 'REQUEST' : 'OFFER')}
        </main>

        <Footer onNavigate={handleNavigate} />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        {showAuthModal && <AuthModal initialMode={authInitialMode} targetRole={pendingRole} onComplete={handleAuthComplete} onCancel={() => setShowAuthModal(false)} />}
        {showLocationModal && currentUser && <LocationUpdateModal currentUser={currentUser} onUpdate={handleLocationUpdate} onCancel={() => setShowLocationModal(false)} />}
        {selectedItem && <ItemDetailModal item={selectedItem} userRole={currentUser?.role || 'GUEST'} onClose={() => setSelectedItem(null)} onAction={handleModalAction} onFlag={handleFlagItem} onComplete={handleMarkComplete} />}
        {activeChat && currentUser && <ChatModal recipientName={activeChat.recipientName} recipientAvatarId={activeChat.recipientAvatarId} itemName={activeChat.itemName} currentUser={currentUser} onClose={() => setActiveChat(null)} />}
        {showRatingModal && <RatingModal onSubmit={handleRatingSubmit} onCancel={() => setShowRatingModal(false)} />}
      </div>
    </HashRouter>
  );
}

export default App;
