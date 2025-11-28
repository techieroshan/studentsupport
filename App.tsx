
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
import TermsOfUse from './components/TermsOfUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import HowItWorksPage from './components/HowItWorksPage';
import { User, UserRole, VerificationStatus, DietaryPreference, MedicalPreference, MealRequest, MealOffer, FulfillmentOption, Frequency, Donor, DonorCategory, DonorTier, Rating } from './types';
import { Users, Utensils, MapPin, Search, PlusCircle, Check, AlertCircle, Quote, Loader2, Filter, ArrowRight, Share2, Repeat, Heart, GraduationCap, Globe, CheckCircle2, X, History, TrendingUp, Truck, Trophy, User as UserIcon } from 'lucide-react';
import { analyzeMealDietaryTags, generateEncouragement, moderateContent } from './services/geminiService';

// --- Types for Local State ---
type Page = 'home' | 'login-seeker' | 'login-donor' | 'dashboard-seeker' | 'dashboard-donor' | 'post-offer' | 'post-request' | 'browse' | 'admin' | 'donors' | 'terms' | 'privacy' | 'how-it-works';

// --- Mock Data ---
const MOCK_STATS = [
  { name: 'Jan', value: 420 },
  { name: 'Feb', value: 560 },
  { name: 'Mar', value: 890 },
  { name: 'Apr', value: 1200 },
];

const SEED_DONORS: Donor[] = [
  {
    id: 'd1',
    name: 'Zakat Foundation of America',
    category: DonorCategory.NON_PROFIT,
    tier: DonorTier.PLATINUM,
    logoUrl: 'https://ui-avatars.com/api/?name=Zakat+Foundation&background=0d9488&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=SVT+Cary&background=ea580c&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=City+Fremont&background=2563eb&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=Dr+Anand+Patel&background=4f46e5&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=Sri+Lakshmi&background=f59e0b&color=fff&size=150&bold=true',
    totalContributionDisplay: '₹15,00,000',
    isAnonymous: false,
    location: 'Singapore',
    since: '2025'
  },
  {
    id: 'd7',
    name: 'City of Austin - Sustainability',
    category: DonorCategory.GOVERNMENT,
    tier: DonorTier.GOLD,
    logoUrl: 'https://ui-avatars.com/api/?name=Austin+Gov&background=10b981&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=Sikh+Triangle&background=f97316&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=TCS&background=334155&color=fff&size=150&bold=true',
    totalContributionDisplay: '$10,000 CSR Grant',
    isAnonymous: false,
    location: 'Mumbai / Global',
    since: '2024'
  },
  {
    id: 'd10',
    name: 'Patel Family Foundation',
    category: DonorCategory.FAMILY_OFFICE,
    tier: DonorTier.SILVER,
    logoUrl: 'https://ui-avatars.com/api/?name=Patel+Fdn&background=475569&color=fff&size=150&bold=true',
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
    logoUrl: 'https://ui-avatars.com/api/?name=IIT+Bombay&background=1e293b&color=fff&size=150&bold=true',
    totalContributionDisplay: '$5,000',
    isAnonymous: false,
    location: 'Global Alumni',
    since: '2025'
  },
  {
    id: 'd12',
    name: 'Mom & Pop Diner',
    category: DonorCategory.BUSINESS,
    tier: DonorTier.BRONZE,
    logoUrl: 'https://ui-avatars.com/api/?name=Diner&background=ef4444&color=fff&size=150&bold=true',
    totalContributionDisplay: '500 Meals',
    isAnonymous: false,
    location: 'Houston, TX',
    since: '2024'
  }
];

const MOCK_REQUESTS: MealRequest[] = [
  {
    id: 'req-1',
    seekerId: 's-1',
    seekerName: 'Studious Owl',
    seekerAvatarId: 1,
    seekerLanguages: ['English', 'Spanish'],
    city: 'San Jose',
    state: 'CA',
    zip: '95112',
    country: 'United States',
    dietaryNeeds: [DietaryPreference.VEGAN],
    medicalNeeds: [MedicalPreference.NONE],
    logistics: [FulfillmentOption.PICKUP, FulfillmentOption.DELIVERY],
    description: 'Finals week is crazy! Would love a healthy vegan dinner.',
    availability: 'Evenings after 6pm',
    frequency: Frequency.ONCE,
    postedAt: Date.now() - 3600000,
    status: 'OPEN'
  },
  {
    id: 'req-2',
    seekerId: 's-2',
    seekerName: 'Blue Jay',
    seekerAvatarId: 4,
    seekerLanguages: ['English', 'Hindi', 'Gujarati'],
    city: 'Santa Clara',
    state: 'CA',
    zip: '95050',
    country: 'United States',
    dietaryNeeds: [DietaryPreference.JAIN_VEG],
    medicalNeeds: [MedicalPreference.NO_OIL],
    logistics: [FulfillmentOption.DELIVERY],
    description: 'Missing home cooked Jain food. Any help appreciated.',
    availability: 'Weekends only',
    frequency: Frequency.WEEKLY,
    postedAt: Date.now() - 86400000,
    status: 'OPEN'
  },
  {
    id: 'req-3',
    seekerId: 's-3',
    seekerName: 'Red Fox',
    seekerAvatarId: 2,
    seekerLanguages: ['English', 'Urdu', 'Punjabi'],
    city: 'London',
    state: 'GL',
    zip: 'EC1A',
    country: 'United Kingdom',
    dietaryNeeds: [DietaryPreference.HALAL],
    medicalNeeds: [MedicalPreference.NONE],
    logistics: [FulfillmentOption.PICKUP],
    description: 'Craving some homemade biryani or curry if possible!',
    availability: 'Anytime',
    frequency: Frequency.ONCE,
    postedAt: Date.now() - 172800000,
    status: 'OPEN'
  }
];

const INITIAL_REVIEWS: Rating[] = [
    {
        id: 'r1',
        fromUserId: 'u1',
        reviewerName: 'Alex M.',
        reviewerAvatarId: 1,
        reviewerRole: UserRole.SEEKER,
        reviewerLocation: 'San Jose, CA',
        toUserId: 'system',
        transactionId: 'tx1',
        stars: 5,
        comment: "Being 2,000 miles from home, I missed my mom's cooking. The warm vegan curry I received from Sarah didn't just fill my stomach, it warmed my heart during finals week.",
        timestamp: Date.now() - 86400000
    },
    {
        id: 'r2',
        fromUserId: 'u2',
        reviewerName: 'Mrs. Patel',
        reviewerAvatarId: 4,
        reviewerRole: UserRole.DONOR,
        reviewerLocation: 'Fremont, CA',
        toUserId: 'system',
        transactionId: 'tx2',
        stars: 5,
        comment: "I cook fresh Jain meals every day for my family. Making two extra portions for a student nearby is effortless for me but means the world to them.",
        timestamp: Date.now() - 172800000
    },
    {
        id: 'r3',
        fromUserId: 'u3',
        reviewerName: 'Jordan K.',
        reviewerAvatarId: 3,
        reviewerRole: UserRole.SEEKER,
        reviewerLocation: 'Santa Clara, CA',
        toUserId: 'system',
        transactionId: 'tx3',
        stars: 5,
        comment: "I was hesitant to ask for help, but the anonymity made me feel safe. The process was respectful, and the food was delicious. Thank you!",
        timestamp: Date.now() - 250000000
    }
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
  
  // Data Logic States
  const [filteredItems, setFilteredItems] = useState<(MealRequest | MealOffer)[]>([]);
  const [visibleItems, setVisibleItems] = useState<(MealRequest | MealOffer)[]>([]); 

  const [activeChat, setActiveChat] = useState<{ recipientName: string; recipientAvatarId: number; itemName: string; itemId: string; itemType: 'REQUEST' | 'OFFER' } | null>(null);
  
  // Browse Filter State
  const [browseLocation, setBrowseLocation] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'REQUESTS' | 'OFFERS'>('ALL');
  const [filterDiet, setFilterDiet] = useState<DietaryPreference | 'ALL'>('ALL');
  const [filterLogistic, setFilterLogistic] = useState<FulfillmentOption | 'ALL'>('ALL');

  // App Data
  const [requests, setRequests] = useState<MealRequest[]>(MOCK_REQUESTS);
  const [offers, setOffers] = useState<MealOffer[]>([]);
  const [donors, setDonors] = useState<Donor[]>(SEED_DONORS);
  const [reviews, setReviews] = useState<Rating[]>(INITIAL_REVIEWS);
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
    // Centralized Logic to update Filtered Items
    let items: (MealRequest | MealOffer)[] = [];
    
    if (currentPage === 'dashboard-donor') {
        items = requests.filter(r => r.status === 'OPEN');
        if (dashboardTab === 'HISTORY') {
           items = offers.filter(o => o.donorId === currentUser?.id);
        }
    } else if (currentPage === 'dashboard-seeker') {
        items = offers.filter(o => o.status === 'AVAILABLE');
         if (dashboardTab === 'HISTORY') {
            items = requests.filter(r => r.seekerId === currentUser?.id);
         }
    } else if (currentPage === 'browse') {
        let pool: (MealRequest | MealOffer)[] = [];
        if (filterType === 'ALL' || filterType === 'REQUESTS') {
            pool = [...pool, ...requests.filter(r => r.status === 'OPEN')];
        }
        if (filterType === 'ALL' || filterType === 'OFFERS') {
            pool = [...pool, ...offers.filter(o => o.status === 'AVAILABLE')];
        }
        items = pool;
    } else {
        setFilteredItems([]);
        setVisibleItems([]);
        return; 
    }

    if (browseLocation.trim()) {
        const lower = browseLocation.toLowerCase();
        items = items.filter(item => 
          item.city.toLowerCase().includes(lower) || 
          item.country.toLowerCase().includes(lower) || 
          item.zip.includes(lower)
        );
    }

    if (currentPage === 'browse') {
        if (filterDiet !== 'ALL') {
             items = items.filter(item => {
                 const tags = 'seekerId' in item ? (item as MealRequest).dietaryNeeds : (item as MealOffer).dietaryTags;
                 return tags.includes(filterDiet);
             });
        }
        if (filterLogistic !== 'ALL') {
             items = items.filter(item => item.logistics.includes(filterLogistic));
        }
    }

    setFilteredItems(items);
    setVisibleItems(items);

  }, [currentPage, requests, offers, browseLocation, filterType, filterDiet, filterLogistic, dashboardTab, currentUser]);

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
            email: data.email,
            languages: ['English']
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
      languages: data.languages || ['English'],
      preferences: pendingRole === UserRole.SEEKER ? [] : undefined
    };

    setCurrentUser(newUser);
    setCurrentPage(pendingRole === UserRole.SEEKER ? 'dashboard-seeker' : 'dashboard-donor');
    setPendingRole(UserRole.SEEKER);
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
     setVisibleItems(items);
  };

  const handleShareStats = () => {
    const text = `Join me in supporting students! ${MOCK_STATS.reduce((acc, curr) => acc + curr.value, 0)} meals shared on StudentSupport. Visit https://studentsupport.newabilities.org`;
    navigator.clipboard.writeText(text);
    showToast('Impact link copied to clipboard!');
  };

  const handleModalAction = () => {
    if (!currentUser) {
      setSelectedItem(null);
      // Fallback if closed, but we are just getting role from the selected item logic before state updates
      const isRequest = selectedItem && 'seekerId' in selectedItem;
      handleLoginStart(isRequest ? UserRole.DONOR : UserRole.SEEKER, 'LOGIN');
      return;
    }
    if (selectedItem) {
        const isRequest = 'seekerId' in selectedItem;
        setActiveChat({
            recipientName: isRequest ? (selectedItem as MealRequest).seekerName : (selectedItem as MealOffer).donorName,
            recipientAvatarId: isRequest ? (selectedItem as MealRequest).seekerAvatarId : (selectedItem as MealOffer).donorAvatarId,
            itemName: selectedItem.description,
            itemId: selectedItem.id,
            itemType: isRequest ? 'REQUEST' : 'OFFER'
        });
        setSelectedItem(null); 
    }
  };

  const handleFlagItem = () => {
     if(selectedItem) {
         handleFlagTransaction(selectedItem.id, 'seekerId' in selectedItem ? 'REQUEST' : 'OFFER');
         setSelectedItem(null);
     }
  };

  const handleFlagTransaction = (itemId: string, itemType: 'REQUEST' | 'OFFER') => {
     if (itemType === 'REQUEST') {
         setRequests(prev => prev.filter(r => r.id !== itemId));
     } else {
         setOffers(prev => prev.filter(o => o.id !== itemId));
     }
     setActiveChat(null);
     alert("Transaction has been flagged and removed for moderation.");
  };

  const handleAcceptMatch = () => {
      if(!activeChat || !currentUser) return;
      const { itemId, itemType } = activeChat;
      
      // Generate 4-digit PIN
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      
      if (itemType === 'REQUEST') {
          setRequests(prev => prev.map(r => r.id === itemId ? { ...r, status: 'IN_PROGRESS', completionPin: pin } : r));
      } else {
          setOffers(prev => prev.map(o => o.id === itemId ? { ...o, status: 'IN_PROGRESS', completionPin: pin } : o));
      }
      
      showToast("Match Accepted! Use the Secure PIN to complete the transaction.");
  };

  const handleVerifyPin = (itemId: string, itemType: 'REQUEST' | 'OFFER', inputPin: string) => {
      // Find item
      let item: MealRequest | MealOffer | undefined;
      if (itemType === 'REQUEST') item = requests.find(r => r.id === itemId);
      else item = offers.find(o => o.id === itemId);

      if (!item || !item.completionPin) {
          showToast("Error verifying transaction.");
          return;
      }

      if (item.completionPin !== inputPin) {
          alert("Incorrect PIN. Please ask the student for the code.");
          return;
      }

      // If correct
      if (itemType === 'REQUEST') {
         setRequests(prev => prev.map(r => r.id === itemId ? { ...r, status: 'FULFILLED' } : r));
      } else {
         setOffers(prev => prev.map(o => o.id === itemId ? { ...o, status: 'CLAIMED' } : o));
      }

      setActiveChat(null);
      setShowRatingModal(true);
      showToast("PIN Verified! Transaction Complete.");
  };

  const handleRatingSubmit = (stars: number, comment: string) => {
     if (currentUser) {
         const newRating: Rating = {
             id: Date.now().toString(),
             fromUserId: currentUser.id,
             reviewerName: currentUser.displayName,
             reviewerAvatarId: currentUser.avatarId,
             reviewerRole: currentUser.role,
             reviewerLocation: `${currentUser.city}, ${currentUser.state}`,
             toUserId: 'system',
             transactionId: `tx-${Date.now()}`,
             stars: stars,
             comment: comment,
             timestamp: Date.now()
         };
         setReviews(prev => [newRating, ...prev]);
     }
     setShowRatingModal(false);
     showToast("Transaction completed and rated. Thank you for building our community!");
  };

  const handlePostRequest = async (description: string, dietaryNeeds: DietaryPreference[], medicalNeeds: MedicalPreference[], logistics: FulfillmentOption[], frequency: Frequency, availability: string) => {
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
      seekerLanguages: currentUser.languages,
      city: currentUser.city,
      state: currentUser.state,
      zip: currentUser.zip,
      country: currentUser.country,
      dietaryNeeds,
      medicalNeeds,
      logistics,
      description,
      availability,
      frequency,
      postedAt: Date.now(),
      status: 'OPEN'
    };
    setRequests([newReq, ...requests]);
    setCurrentPage('dashboard-seeker');
    showToast('Request posted successfully!');
  };

  const handlePostOffer = async (description: string, logistics: FulfillmentOption[], frequency: Frequency, availability: string) => {
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
      donorLanguages: currentUser.languages,
      city: currentUser.city,
      state: currentUser.state,
      zip: currentUser.zip,
      country: currentUser.country,
      description,
      dietaryTags: tags,
      availableUntil: Date.now() + 86400000,
      logistics,
      availability,
      frequency,
      status: 'AVAILABLE'
    };
    setOffers([newOffer, ...offers]);
    setCurrentPage('dashboard-donor');
    showToast('Meal offer posted successfully!');
  };

  const handleDeleteDonor = (id: string) => {
     setDonors(prev => prev.filter(d => d.id !== id));
     showToast('Donor removed successfully.');
  };

  const handleBrowseSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (browseLocation.trim()) {
      showToast(`Zooming into area: ${browseLocation}`);
    }
  };

  // --- Helpers for Chat Context ---
  const getActiveItem = () => {
      if(!activeChat) return null;
      if (activeChat.itemType === 'REQUEST') return requests.find(r => r.id === activeChat.itemId);
      return offers.find(o => o.id === activeChat.itemId);
  };
  
  const currentItem = getActiveItem();

  const getTopCities = () => {
    const counts: Record<string, number> = {};
    [...requests, ...offers].forEach(item => {
      if (item.city) {
        counts[item.city] = (counts[item.city] || 0) + 1;
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
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

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-brand-100 p-8 hover:-translate-y-1 transition duration-300 flex flex-col items-center text-center group cursor-pointer" onClick={() => handleLoginStart(UserRole.SEEKER, 'REGISTER')}>
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-600 transition-colors">
                        <GraduationCap className="h-8 w-8 text-brand-600 group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Request a Meal</h3>
                    <p className="text-slate-600 mb-6 flex-grow">
                        Living &gt;30 miles from home? Verified students can request free, nutritious meals.
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
                 <div key={i} className="text-center bg-white p-6 rounded-xl shadow-sm md:bg-transparent md:shadow-none cursor-pointer hover:bg-slate-50 transition" onClick={() => setCurrentPage('how-it-works')}>
                    <div className="w-24 h-24 mx-auto bg-white border-4 border-brand-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <s.icon className="h-10 w-10 text-brand-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600">{s.t}</p>
                </div>
                ))}
            </div>
            <div className="text-center mt-10">
                <button 
                  onClick={() => setCurrentPage('how-it-works')}
                  className="inline-flex items-center text-brand-600 font-bold hover:text-brand-800 hover:underline"
                >
                    View detailed process <ArrowRight className="ml-1 h-4 w-4" />
                </button>
            </div>
         </div>
      </div>
      <SuccessStories reviews={reviews} />
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
         <button onClick={() => setDashboardTab('ACTIVE')} className={`pb-2 font-bold ${dashboardTab === 'ACTIVE' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}>Available Offers</button>
         <button onClick={() => setDashboardTab('HISTORY')} className={`pb-2 font-bold ${dashboardTab === 'HISTORY' ? 'text-brand-600 border-b-2 border-brand-600' : 'text-slate-500'}`}>My Requests</button>
      </div>

      {dashboardTab === 'ACTIVE' ? (
        <>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    Community Offers 
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
                items={filteredItems} 
                centerCity={currentUser?.city || "San Jose"} 
                radius={currentUser?.radius || 20} 
                userRole={UserRole.SEEKER} 
                onSelect={handleViewItem}
                onVisibleItemsChange={handleMapVisibleItemsChange}
                />
            </div>
        </>
      ) : (
          <div className="bg-white rounded-xl shadow p-6">
             <h3 className="text-lg font-bold mb-4">My Requests</h3>
             {requests.filter(r => r.seekerId === currentUser?.id).length === 0 ? (
                 <p className="text-slate-500">No requests yet.</p>
             ) : (
                 <div className="space-y-4">
                     {requests.filter(r => r.seekerId === currentUser?.id).map(req => (
                         <div key={req.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => handleViewItem(req)}>
                             <div>
                                 <p className="font-bold">{req.description}</p>
                                 <p className="text-xs text-slate-500">Status: {req.status}</p>
                             </div>
                             <ArrowRight className="h-4 w-4 text-slate-400" />
                         </div>
                     ))}
                 </div>
             )}
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

      {dashboardTab === 'ACTIVE' ? (
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
            items={filteredItems} 
            centerCity={currentUser?.city || "San Jose"} 
            radius={currentUser?.radius || 20} 
            userRole={UserRole.DONOR} 
            onSelect={handleViewItem}
            onVisibleItemsChange={handleMapVisibleItemsChange}
            />
        </div>
      </>
      ) : (
        <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">My Offers</h3>
            {offers.filter(o => o.donorId === currentUser?.id).length === 0 ? (
                <p className="text-slate-500">No offers posted yet.</p>
            ) : (
                <div className="space-y-4">
                    {offers.filter(o => o.donorId === currentUser?.id).map(off => (
                        <div key={off.id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-slate-50 cursor-pointer" onClick={() => handleViewItem(off)}>
                            <div>
                                <p className="font-bold">{off.description}</p>
                                <p className="text-xs text-slate-500">Status: {off.status}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
     </div>
  );

  const renderPublicBrowse = () => (
    <div className="min-h-screen bg-slate-50">
      {/* ... Browse implementation kept same as before ... */}
      <div className="bg-slate-900 text-white pb-12 pt-8">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Community Map</h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-8">
               See where students in your area need a helping hand. Log in to offer support.
            </p>
            
            <div className="max-w-xl mx-auto mb-6 relative z-10">
               <form onSubmit={handleBrowseSearch} className="relative shadow-lg rounded-full">
                  <input 
                     type="text" 
                     value={browseLocation}
                     onChange={(e) => setBrowseLocation(e.target.value)}
                     placeholder="Search by City, Zip, or Country..."
                     className="w-full pl-6 pr-14 py-4 rounded-full border-none bg-brand-50 focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 placeholder-slate-500 font-medium"
                  />
                  <button 
                     type="submit" 
                     className="absolute right-2 top-2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full transition"
                  >
                     <Search className="h-5 w-5" />
                  </button>
               </form>
            </div>
            
            <div className="flex justify-center gap-8 text-sm font-bold">
               <div className="flex items-center text-accent-400">
                  <div className="w-2 h-2 rounded-full bg-accent-500 mr-2 animate-pulse"></div>
                  {requests.filter(r => r.status === 'OPEN').length} Active Requests
               </div>
               <div className="flex items-center text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                  {offers.filter(o => o.status === 'AVAILABLE').length} Available Offers
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                 <h4 className="font-bold text-slate-900 flex items-center mb-4">
                    <Trophy className="h-4 w-4 mr-2 text-yellow-500" /> Top Active Cities
                 </h4>
                 <ul className="space-y-3">
                    {getTopCities().map(([city, count], idx) => (
                       <li key={city} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 flex items-center">
                             <span className="w-5 text-slate-400 font-mono">{idx + 1}.</span> {city}
                          </span>
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 rounded-full text-xs">{count}</span>
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-slate-900 flex items-center">
                        <Filter className="h-4 w-4 mr-2 text-slate-500" /> Filters
                    </h4>
                    <button 
                      onClick={() => { setFilterType('ALL'); setFilterDiet('ALL'); setFilterLogistic('ALL'); }}
                      className="text-xs text-brand-600 hover:underline"
                    >
                       Reset
                    </button>
                 </div>
                 <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Show</label>
                        <select 
                           value={filterType}
                           onChange={(e) => setFilterType(e.target.value as any)}
                           className="w-full text-sm border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                           <option value="ALL">All Activity</option>
                           <option value="REQUESTS">Student Requests Only</option>
                           <option value="OFFERS">Meal Offers Only</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Dietary Preference</label>
                        <select 
                           value={filterDiet}
                           onChange={(e) => setFilterDiet(e.target.value as any)}
                           className="w-full text-sm border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                           <option value="ALL">Any Preference</option>
                           {Object.values(DietaryPreference).map(dp => (
                              <option key={dp} value={dp}>{dp}</option>
                           ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Logistics / Delivery</label>
                        <select 
                           value={filterLogistic}
                           onChange={(e) => setFilterLogistic(e.target.value as any)}
                           className="w-full text-sm border-slate-200 rounded-lg p-2 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                           <option value="ALL">Any Method</option>
                           {Object.values(FulfillmentOption).map(fo => (
                              <option key={fo} value={fo}>{fo}</option>
                           ))}
                        </select>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
                 <MapVisualizer 
                    items={filteredItems} 
                    centerCity={browseLocation || "Global View"} 
                    radius={20} 
                    userRole={'GUEST'} 
                    onSelect={handleViewItem}
                    onVisibleItemsChange={handleMapVisibleItemsChange}
                 />
              </div>

              <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                    <span>
                       {filterType === 'ALL' ? 'Visible Activity' : filterType === 'REQUESTS' ? 'Student Needs' : 'Community Offers'}
                    </span>
                    <span className="text-xs font-normal text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded">
                        {visibleItems.length} results found
                    </span>
                  </h3>
                  
                  {visibleItems.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <Globe className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No matching results in this area. Try adjusting filters.</p>
                        </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleItems.map(item => {
                        const isRequest = 'seekerId' in item;
                        return (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center">
                                    <div className={`p-1.5 rounded-full mr-3 ${isRequest ? 'bg-accent-100 text-accent-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {isRequest ? <UserIcon className="h-4 w-4" /> : <Utensils className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 leading-none mb-1">
                                            {isRequest ? (item as MealRequest).seekerName : (item as MealOffer).donorName}
                                        </h4>
                                        <p className="text-xs text-slate-500">{item.city}, {item.country}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${isRequest ? 'bg-accent-50 text-accent-700' : 'bg-emerald-50 text-emerald-700'}`}>
                                    {isRequest ? 'Request' : 'Offer'}
                                </span>
                            </div>
                            <p className="text-slate-800 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">"{item.description}"</p>
                            
                            <div className="flex flex-wrap gap-1 mb-4">
                                {(isRequest ? (item as MealRequest).dietaryNeeds : (item as MealOffer).dietaryTags).slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        {tag}
                                    </span>
                                ))}
                                {item.logistics.slice(0, 1).map(l => (
                                     <span key={l} className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                        <Truck className="inline h-3 w-3 mr-1"/>{l.split(' ')[0]}
                                     </span>
                                ))}
                            </div>

                            <button 
                                onClick={() => handleViewItem(item)}
                                className="w-full py-2 text-brand-600 border border-brand-200 rounded-lg text-sm font-bold hover:bg-brand-50 transition"
                            >
                                View Details
                            </button>
                        </div>
                    )})}
                    </div>
                  )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderPostForm = (type: 'OFFER' | 'REQUEST') => {
    // ... Post Form Logic (Identical to previous, ensuring availability included)
    const [desc, setDesc] = useState('');
    const [selectedDiets, setSelectedDiets] = useState<DietaryPreference[]>([]);
    const [selectedMedicals, setSelectedMedicals] = useState<MedicalPreference[]>([]);
    const [selectedLogistics, setSelectedLogistics] = useState<FulfillmentOption[]>([]);
    const [selectedFreq, setSelectedFreq] = useState<Frequency>(Frequency.ONCE);
    const [availability, setAvailability] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleDiet = (d: DietaryPreference) => {
      if (selectedDiets.includes(d)) setSelectedDiets(selectedDiets.filter(x => x !== d));
      else setSelectedDiets([...selectedDiets, d]);
    };
    
    const toggleMedical = (m: MedicalPreference) => {
      if (selectedMedicals.includes(m)) setSelectedMedicals(selectedMedicals.filter(x => x !== m));
      else setSelectedMedicals([...selectedMedicals, m]);
    };

    const toggleLogistic = (l: FulfillmentOption) => {
        if (selectedLogistics.includes(l)) setSelectedLogistics(selectedLogistics.filter(x => x !== l));
        else setSelectedLogistics([...selectedLogistics, l]);
    }

    const submit = async () => {
       setLoading(true);
       if(type === 'REQUEST') await handlePostRequest(desc, selectedDiets, selectedMedicals, selectedLogistics, selectedFreq, availability);
       else await handlePostOffer(desc, selectedLogistics, selectedFreq, availability);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
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
                <div>
                     <label className="block text-sm font-bold text-slate-700 mb-3">Logistics / Handover</label>
                     <div className="flex flex-col gap-2">
                        {Object.values(FulfillmentOption).map(opt => (
                            <button
                              key={opt}
                              onClick={() => toggleLogistic(opt)}
                              className={`px-3 py-1.5 rounded-lg text-sm border text-left flex items-center transition ${selectedLogistics.includes(opt) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}
                            >
                                <Truck className="h-3 w-3 mr-2" />
                                {opt}
                            </button>
                        ))}
                     </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Availability / Timing Preference</label>
                <input 
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full bg-white border border-slate-400 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none"
                    placeholder={type === 'REQUEST' ? "e.g. Weeknights after 6pm" : "e.g. Pickup available Sunday 2-4pm"}
                />
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
               <button onClick={submit} disabled={!desc || loading || selectedLogistics.length === 0} className="px-6 py-2 rounded-lg text-white font-bold bg-brand-600 hover:bg-brand-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
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
          {currentPage === 'admin' && <AdminDashboard donors={donors} onDeleteDonor={handleDeleteDonor} />}
          {currentPage === 'donors' && <DonorsPage items={donors} />}
          {currentPage === 'terms' && <TermsOfUse />}
          {currentPage === 'privacy' && <PrivacyPolicy />}
          {currentPage === 'how-it-works' && <HowItWorksPage />}
          {currentPage === 'browse' && renderPublicBrowse()}
          {currentPage === 'dashboard-seeker' && currentUser?.role === UserRole.SEEKER && renderSeekerDashboard()}
          {currentPage === 'dashboard-donor' && currentUser?.role === UserRole.DONOR && renderDonorDashboard()}
          {(currentPage === 'post-request' || currentPage === 'post-offer') && renderPostForm(currentPage === 'post-request' ? 'REQUEST' : 'OFFER')}
        </main>

        <Footer onNavigate={handleNavigate} partners={donors.filter(d => d.tier === DonorTier.PLATINUM || d.tier === DonorTier.GOLD)} />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        {showAuthModal && <AuthModal initialMode={authInitialMode} targetRole={pendingRole} onComplete={handleAuthComplete} onCancel={() => setShowAuthModal(false)} />}
        {showLocationModal && currentUser && <LocationUpdateModal currentUser={currentUser} onUpdate={handleLocationUpdate} onCancel={() => setShowLocationModal(false)} />}
        
        {selectedItem && (
             <ItemDetailModal 
                item={selectedItem} 
                userRole={currentUser?.role || 'GUEST'} 
                onClose={() => setSelectedItem(null)} 
                onAction={handleModalAction} 
                onFlag={handleFlagItem}
             />
        )}
        
        {activeChat && currentUser && currentItem && (
             <ChatModal 
                recipientName={activeChat.recipientName} 
                recipientAvatarId={activeChat.recipientAvatarId} 
                itemName={activeChat.itemName} 
                currentUser={currentUser} 
                onClose={() => setActiveChat(null)} 
                onFlag={() => handleFlagTransaction(activeChat.itemId, activeChat.itemType)}
                onAcceptMatch={handleAcceptMatch}
                onVerifyPin={(pin) => handleVerifyPin(activeChat.itemId, activeChat.itemType, pin)}
                status={currentItem.status as any} // 'OPEN' | 'IN_PROGRESS' | 'FULFILLED' | 'CLAIMED'
                completionPin={(currentItem as any).completionPin} // might be undefined if not in progress
                userRole={currentUser.role}
                itemType={activeChat.itemType}
                isOwner={(activeChat.itemType === 'REQUEST' && currentUser.id === requests.find(r => r.id === activeChat.itemId)?.seekerId) || (activeChat.itemType === 'OFFER' && currentUser.id === offers.find(o => o.id === activeChat.itemId)?.donorId)}
             />
        )}

        {showRatingModal && <RatingModal onSubmit={handleRatingSubmit} onCancel={() => setShowRatingModal(false)} />}
      </div>
    </HashRouter>
  );
}

export default App;
