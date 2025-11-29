
// ... existing imports ...
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StatsChart from './components/StatsChart';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
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
import PostForm from './components/PostForm';
import VerificationBadge from './components/VerificationBadge';
import { User, UserRole, VerificationStatus, DietaryPreference, MedicalPreference, MealRequest, MealOffer, FulfillmentOption, Frequency, Donor, DonorCategory, DonorTier, Rating, FlaggedContent } from './types';
import { Users, Utensils, MapPin, Search, PlusCircle, Check, AlertCircle, Quote, Loader2, Filter, ArrowRight, Share2, Repeat, Heart, GraduationCap, Globe, CheckCircle2, X, History, TrendingUp, Truck, Trophy, User as UserIcon, Trash2, PauseCircle, PlayCircle, EyeOff, AlertTriangle, Clock, Calendar, Gift, HelpCircle, FileText } from 'lucide-react';
import { analyzeMealDietaryTags, generateEncouragement, moderateContent } from './services/geminiService';

// ... existing types and mock data ...
// Include all existing mock data constants (MOCK_STATS, SEED_DONORS, MOCK_REQUESTS, MOCK_OFFERS, INITIAL_REVIEWS, FAQS, Toast)
// (Omitting for brevity, assume they are present as per file content provided in prompt)

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
    seekerVerificationStatus: VerificationStatus.VERIFIED,
    seekerLanguages: ['English', 'Spanish'],
    city: 'San Jose',
    state: 'CA',
    zip: '95112',
    country: 'United States',
    latitude: 37.3382,
    longitude: -121.8863,
    dietaryNeeds: [DietaryPreference.VEGAN],
    medicalNeeds: [MedicalPreference.NONE],
    logistics: [FulfillmentOption.PICKUP, FulfillmentOption.DELIVERY],
    description: 'Finals week is crazy! Would love a healthy vegan dinner.',
    availability: 'Evenings after 6pm',
    frequency: Frequency.ONCE,
    urgency: 'NORMAL',
    postedAt: Date.now() - 3600000,
    status: 'OPEN'
  },
  {
    id: 'req-2',
    seekerId: 's-2',
    seekerName: 'Blue Jay',
    seekerAvatarId: 4,
    seekerVerificationStatus: VerificationStatus.VERIFIED,
    seekerLanguages: ['English', 'Hindi', 'Gujarati'],
    city: 'Santa Clara',
    state: 'CA',
    zip: '95050',
    country: 'United States',
    latitude: 37.3541,
    longitude: -121.9552,
    dietaryNeeds: [DietaryPreference.JAIN_VEG],
    medicalNeeds: [MedicalPreference.NO_OIL],
    logistics: [FulfillmentOption.DELIVERY],
    description: 'Missing home cooked Jain food. Any help appreciated.',
    availability: 'Weekends only',
    frequency: Frequency.WEEKLY,
    urgency: 'NORMAL',
    postedAt: Date.now() - 86400000,
    status: 'OPEN'
  },
  {
    id: 'req-3',
    seekerId: 's-3',
    seekerName: 'Red Fox',
    seekerAvatarId: 2,
    seekerVerificationStatus: VerificationStatus.PENDING,
    seekerLanguages: ['English', 'Urdu', 'Punjabi'],
    city: 'London',
    state: 'GL',
    zip: 'EC1A',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    dietaryNeeds: [DietaryPreference.HALAL],
    medicalNeeds: [MedicalPreference.NONE],
    logistics: [FulfillmentOption.PICKUP],
    description: 'Craving some homemade biryani or curry if possible!',
    availability: 'Anytime',
    frequency: Frequency.ONCE,
    urgency: 'URGENT',
    postedAt: Date.now() - 172800000,
    status: 'OPEN'
  }
];

const MOCK_OFFERS: MealOffer[] = [
    {
        id: 'off-1',
        donorId: 'd-1',
        donorName: 'Kind Neighbor',
        donorAvatarId: 5,
        donorVerificationStatus: VerificationStatus.VERIFIED,
        donorLanguages: ['English'],
        city: 'San Jose',
        state: 'CA',
        zip: '95112',
        country: 'United States',
        latitude: 37.3300,
        longitude: -121.8900,
        description: 'Made extra lasagna, vegetarian friendly!',
        dietaryTags: [DietaryPreference.VEGETARIAN],
        medicalTags: [MedicalPreference.NONE],
        availableUntil: Date.now() + 86400000,
        logistics: [FulfillmentOption.PICKUP],
        availability: 'Available tonight',
        frequency: Frequency.ONCE,
        status: 'AVAILABLE'
    },
    {
        id: 'off-2',
        donorId: 'd-2',
        donorName: 'Chef Mike',
        donorAvatarId: 6,
        donorVerificationStatus: VerificationStatus.VERIFIED,
        donorLanguages: ['English', 'Spanish'],
        city: 'San Jose',
        state: 'CA',
        zip: '95112',
        country: 'United States',
        latitude: 37.3400,
        longitude: -121.8800,
        description: 'Gluten-free baking experiment success. Lots of muffins.',
        dietaryTags: [DietaryPreference.GLUTEN_FREE],
        medicalTags: [MedicalPreference.NONE],
        availableUntil: Date.now() + 172800000,
        logistics: [FulfillmentOption.PICKUP, FulfillmentOption.DELIVERY],
        availability: 'Weekends',
        frequency: Frequency.ONCE,
        isAnonymous: true,
        status: 'AVAILABLE'
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
        timestamp: Date.now() - 86400000,
        isPublic: true
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
        timestamp: Date.now() - 172800000,
        isPublic: true
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
        timestamp: Date.now() - 250000000,
        isPublic: true
    }
];

const FAQS = [
    { q: "Who is eligible to request meals?", a: "Any currently enrolled university student living at least 30 miles away from their permanent home address. We verify enrollment via .edu email and location via geolocation." },
    { q: "Is this safe?", a: "Safety is our priority. All users (Students and Donors) must complete identity verification. Profiles are masked until a match is confirmed, and we provide secure chat for coordination." },
    { q: "Does it cost anything?", a: "No. The platform is completely free for students. Meals are generously gifted by community donors." },
    { q: "Can I request specific dietary meals?", a: "Yes! You can specify preferences like Vegan, Halal, Jain, Gluten-Free, etc. Donors also tag their offers with these attributes." },
    { q: "How do I pick up the food?", a: "Once matched, you coordinate with the donor via secure chat. Options include pickup, donor drop-off, or meeting in a public spot." },
    { q: "I'm not a student, can I get help?", a: "Currently, our charter focuses specifically on university students living away from home. We hope to expand in the future." }
];

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center animate-in slide-in-from-bottom-5 fade-in duration-300">
    <span className="font-bold text-sm mr-4">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition focus:outline-none">
      <X className="h-4 w-4" />
    </button>
  </div>
);

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole>(UserRole.SEEKER);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Dashboard Tabs
  const [dashboardTab, setDashboardTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  // Interaction State
  const [selectedItem, setSelectedItem] = useState<MealRequest | MealOffer | null>(null);
  
  // Map State
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.3382, -121.8863]); // Default San Jose

  // Data Logic States
  const [filteredItems, setFilteredItems] = useState<(MealRequest | MealOffer)[]>([]);
  const [visibleItems, setVisibleItems] = useState<(MealRequest | MealOffer)[]>([]); 

  const [activeChat, setActiveChat] = useState<{ 
      recipientName: string; 
      recipientAvatarId: number; 
      recipientVerificationStatus: VerificationStatus;
      itemName: string; 
      itemId: string; 
      itemType: 'REQUEST' | 'OFFER' 
    } | null>(null);
  
  // Browse Filter State
  const [browseLocation, setBrowseLocation] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'REQUESTS' | 'OFFERS'>('ALL');
  const [filterDiet, setFilterDiet] = useState<DietaryPreference | 'ALL'>('ALL');
  const [filterLogistic, setFilterLogistic] = useState<FulfillmentOption | 'ALL'>('ALL');
  const [filterFrequency, setFilterFrequency] = useState<Frequency | 'ALL'>('ALL');

  // App Data
  const [requests, setRequests] = useState<MealRequest[]>(MOCK_REQUESTS);
  const [offers, setOffers] = useState<MealOffer[]>(MOCK_OFFERS);
  const [donors, setDonors] = useState<Donor[]>(SEED_DONORS);
  const [reviews, setReviews] = useState<Rating[]>(INITIAL_REVIEWS);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);
  const [motivationalQuote, setMotivationalQuote] = useState<string>("");

  // Load real data from backend API on mount
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        // Load donors from backend
        const donorsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/donors`);
        if (donorsResponse.ok) {
          const donorsData = await donorsResponse.json();
          setDonors(donorsData);
        }

        // Load requests
        const requestsResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/requests`);
        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setRequests(requestsData);
        }

        // Load offers
        const offersResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/offers`);
        if (offersResponse.ok) {
          const offersData = await offersResponse.json();
          setOffers(offersData);
        }

        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading backend data:', error);
        // Keep mock data as fallback
      }
    };

    loadBackendData();
  }, []);

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
        const myOffers = offers.filter(o => o.donorId === currentUser?.id);
        if (dashboardTab === 'ACTIVE') {
            items = myOffers.filter(o => o.status === 'AVAILABLE' || o.status === 'IN_PROGRESS');
        } else {
            items = myOffers.filter(o => o.status === 'CLAIMED' || o.status === 'FLAGGED');
        }
    } else if (currentPage === 'dashboard-seeker') {
        const myRequests = requests.filter(r => r.seekerId === currentUser?.id);
        if (dashboardTab === 'ACTIVE') {
            items = myRequests.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS' || r.status === 'PAUSED');
        } else {
            items = myRequests.filter(r => r.status === 'FULFILLED' || r.status === 'EXPIRED' || r.status === 'FLAGGED');
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
    }

    if (currentPage === 'browse' || currentPage === 'dashboard-seeker') {
        if (filterDiet !== 'ALL') {
             items = items.filter(item => {
                 const tags = 'seekerId' in item ? (item as MealRequest).dietaryNeeds : (item as MealOffer).dietaryTags;
                 return tags.includes(filterDiet);
             });
        }
        if (filterLogistic !== 'ALL') {
             items = items.filter(item => item.logistics.includes(filterLogistic));
        }
        if (filterFrequency !== 'ALL') {
             items = items.filter(item => item.frequency === filterFrequency);
        }
    }

    setFilteredItems(items);

  }, [currentPage, requests, offers, filterType, filterDiet, filterLogistic, filterFrequency, dashboardTab, currentUser]);

  // ... (Keep existing handlers logic: showToast, handleReferFriend, handleNavigate, etc.) ...
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReferFriend = () => {
      const text = "Join StudentSupport to help students or request a meal! https://studentsupport.newabilities.org";
      navigator.clipboard.writeText(text);
      showToast("Invite link copied to clipboard!");
  }

  const handleNavigate = (page: string) => {
    if (page === 'faq') {
        if (currentPage !== 'home') {
            setCurrentPage('home');
            setTimeout(() => {
                const element = document.getElementById('faq');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById('faq');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    } else if (page === 'login-seeker') {
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
            emailVerified: true,
            languages: ['English']
        };
        setCurrentUser(adminUser);
        setCurrentPage('admin');
        showToast('Welcome, Admin.');
        return;
    }

    let userId = Math.random().toString(36).substr(2, 9);
    if (data.email === 'student@university.edu') userId = 's-1';
    if (data.email === 'donor@gmail.com') userId = 'd-1';

    const newUser: User = {
      id: userId,
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
      emailVerified: true,
      phone: data.phone,
      isAnonymous: true,
      languages: data.languages || ['English'],
      preferences: pendingRole === UserRole.SEEKER ? [] : undefined,
      latitude: 37.3382,
      longitude: -121.8863,
      weeklyMealLimit: pendingRole === UserRole.DONOR ? 5 : undefined,
      currentWeeklyMeals: pendingRole === UserRole.DONOR ? 0 : undefined,
      donorCategory: data.donorCategory,
      verificationSteps: {
          emailCheck: true,
          phoneCheck: true,
          identityCheck: true
      }
    };

    setCurrentUser(newUser);
    
    if (newUser.city) {
      setBrowseLocation(newUser.city);
    }

    setCurrentPage(pendingRole === UserRole.SEEKER ? 'dashboard-seeker' : 'dashboard-donor');
    setPendingRole(UserRole.SEEKER);
    showToast(isLogin ? `Welcome back, ${newUser.displayName}!` : `Verification Complete. Welcome!`);
  };

  const handleProfileUpdate = (data: Partial<User>) => {
    if (currentUser) {
        setCurrentUser({
            ...currentUser,
            ...data
        });
        
        if (data.city && data.city !== currentUser.city) {
            setBrowseLocation(data.city);
        }
    }
    setShowProfileModal(false);
    showToast('Profile updated successfully.');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('home');
    setBrowseLocation(''); 
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
      const isRequest = selectedItem && 'seekerId' in selectedItem;
      handleLoginStart(isRequest ? UserRole.DONOR : UserRole.SEEKER, 'LOGIN');
      return;
    }
    if (selectedItem) {
        const isRequest = 'seekerId' in selectedItem;
        setActiveChat({
            recipientName: isRequest ? (selectedItem as MealRequest).seekerName : (selectedItem as MealOffer).donorName,
            recipientAvatarId: isRequest ? (selectedItem as MealRequest).seekerAvatarId : (selectedItem as MealOffer).donorAvatarId,
            recipientVerificationStatus: isRequest ? (selectedItem as MealRequest).seekerVerificationStatus : (selectedItem as MealOffer).donorVerificationStatus,
            itemName: selectedItem.description,
            itemId: selectedItem.id,
            itemType: isRequest ? 'REQUEST' : 'OFFER'
        });
        setSelectedItem(null); 
    }
  };

  const handleFlagItem = () => {
     if(selectedItem) {
         handleFlagTransaction(selectedItem.id, 'seekerId' in selectedItem ? 'REQUEST' : 'OFFER', selectedItem.description);
         setSelectedItem(null);
     }
  };

  const handleFlagTransaction = (itemId: string, itemType: 'REQUEST' | 'OFFER', desc: string = 'Content flagged by user') => {
     const newFlag: FlaggedContent = {
         id: `flag-${Date.now()}`,
         itemId,
         itemType,
         reason: 'User reported content',
         flaggedBy: currentUser?.displayName || 'Anonymous',
         timestamp: Date.now(),
         description: desc
     };
     setFlaggedContent(prev => [...prev, newFlag]);

     if (itemType === 'REQUEST') {
         setRequests(prev => prev.map(r => r.id === itemId ? { ...r, status: 'FLAGGED' } : r));
     } else {
         setOffers(prev => prev.map(o => o.id === itemId ? { ...o, status: 'FLAGGED' } : o));
     }
     
     setActiveChat(null);
     alert("Transaction has been flagged and submitted to moderation.");
  };

  const handleDismissFlag = (flagId: string, itemId: string, itemType: 'REQUEST' | 'OFFER') => {
      if (itemType === 'REQUEST') {
          setRequests(prev => prev.map(r => r.id === itemId ? { ...r, status: 'OPEN' } : r));
      } else {
          setOffers(prev => prev.map(o => o.id === itemId ? { ...o, status: 'AVAILABLE' } : o));
      }
      setFlaggedContent(prev => prev.filter(f => f.id !== flagId));
      showToast("Flag dismissed. Content restored.");
  };

  const handleDeleteContent = (flagId: string, itemId: string, itemType: 'REQUEST' | 'OFFER') => {
      if (itemType === 'REQUEST') {
          setRequests(prev => prev.filter(r => r.id !== itemId));
      } else {
          setOffers(prev => prev.filter(o => o.id !== itemId));
      }
      setFlaggedContent(prev => prev.filter(f => f.id !== flagId));
      showToast("Content permanently deleted.");
  };

  const handleAcceptMatch = () => {
      if(!activeChat || !currentUser) return;
      const { itemId, itemType } = activeChat;
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      
      if (itemType === 'REQUEST') {
          setRequests(prev => prev.map(r => r.id === itemId ? { ...r, status: 'IN_PROGRESS', completionPin: pin } : r));
      } else {
          setOffers(prev => prev.map(o => o.id === itemId ? { ...o, status: 'IN_PROGRESS', completionPin: pin } : o));
      }
      
      showToast("Match Accepted! Use the Secure PIN to complete the transaction.");
  };

  const handleVerifyPin = (itemId: string, itemType: 'REQUEST' | 'OFFER', inputPin: string) => {
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

      if (itemType === 'REQUEST') {
         setRequests(prev => prev.map(r => r.id === itemId ? { ...r, status: 'FULFILLED' } : r));
      } else {
         setOffers(prev => prev.map(o => o.id === itemId ? { ...o, status: 'CLAIMED' } : o));
      }

      setActiveChat(null);
      setShowRatingModal(true);
      showToast("PIN Verified! Transaction Complete.");
  };

  const handleRatingSubmit = (stars: number, comment: string, isPublic: boolean) => {
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
             timestamp: Date.now(),
             isPublic: isPublic
         };
         setReviews(prev => [newRating, ...prev]);
     }
     setShowRatingModal(false);
     showToast("Transaction completed and rated. Thank you for building our community!");
  };

  const handlePauseRequest = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setRequests(prev => prev.map(r => 
          r.id === id ? { ...r, status: r.status === 'PAUSED' ? 'OPEN' : 'PAUSED' } : r
      ));
      showToast("Request status updated.");
  };

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(confirm('Are you sure you want to delete this request?')) {
          setRequests(prev => prev.filter(r => r.id !== id));
          showToast("Request deleted.");
      }
  };

  const handleMarkFulfilled = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setRequests(prev => prev.map(r => 
          r.id === id ? { ...r, status: 'FULFILLED' } : r
      ));
      showToast("Request marked as fulfilled.");
  };

  const handlePostRequest = async (description: string, dietaryNeeds: DietaryPreference[], medicalNeeds: MedicalPreference[], logistics: FulfillmentOption[], frequency: Frequency, availability: string, isUrgent?: boolean) => {
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
      seekerVerificationStatus: currentUser.verificationStatus,
      seekerLanguages: currentUser.languages,
      city: currentUser.city,
      state: currentUser.state,
      zip: currentUser.zip,
      country: currentUser.country,
      latitude: currentUser.latitude || 37.3382,
      longitude: currentUser.longitude || -121.8863,
      dietaryNeeds,
      medicalNeeds,
      logistics,
      description,
      availability,
      frequency,
      urgency: isUrgent ? 'URGENT' : 'NORMAL',
      postedAt: Date.now(),
      status: 'OPEN'
    };
    setRequests([newReq, ...requests]);
    setCurrentPage('dashboard-seeker');
    showToast('Request posted successfully!');
  };

  const handlePostOffer = async (description: string, dietaryNeeds: DietaryPreference[], medicalNeeds: MedicalPreference[], logistics: FulfillmentOption[], frequency: Frequency, availability: string, isAnonymous?: boolean) => {
    if (!currentUser) return;

    if (currentUser.role === UserRole.DONOR && 
        currentUser.weeklyMealLimit && 
        (currentUser.currentWeeklyMeals || 0) >= currentUser.weeklyMealLimit) {
        alert(`You have reached your weekly limit of ${currentUser.weeklyMealLimit} meals. Thank you for your generosity! Please wait until next week.`);
        return;
    }

    const isSafe = await moderateContent(description);
    if (!isSafe) {
       alert("Content flagged. Please be respectful.");
       return;
    }

    const analyzedTags = await analyzeMealDietaryTags(description);
    const finalDietaryTags = dietaryNeeds.length > 0 ? dietaryNeeds : analyzedTags;
    
    const newOffer: MealOffer = {
      id: Date.now().toString(),
      donorId: currentUser.id,
      donorName: currentUser.displayName,
      donorAvatarId: currentUser.avatarId,
      donorVerificationStatus: currentUser.verificationStatus,
      donorLanguages: currentUser.languages,
      city: currentUser.city,
      state: currentUser.state,
      zip: currentUser.zip,
      country: currentUser.country,
      latitude: currentUser.latitude || 37.3382,
      longitude: currentUser.longitude || -121.8863,
      description,
      dietaryTags: finalDietaryTags,
      medicalTags: medicalNeeds,
      availableUntil: Date.now() + 86400000,
      logistics,
      availability,
      frequency,
      isAnonymous: isAnonymous,
      status: 'AVAILABLE'
    };
    setOffers([newOffer, ...offers]);
    
    if(currentUser.role === UserRole.DONOR) {
        setCurrentUser({ ...currentUser, currentWeeklyMeals: (currentUser.currentWeeklyMeals || 0) + 1 });
    }

    setCurrentPage('dashboard-donor');
    showToast('Meal offer posted successfully!');
  };

  const handlePostSubmit = async (data: any) => {
    if (currentPage === 'post-request') {
       await handlePostRequest(data.description, data.dietaryNeeds, data.medicalNeeds, data.logistics, data.frequency, data.availability, data.isUrgent);
    } else if (currentPage === 'post-offer') {
       await handlePostOffer(data.description, data.dietaryNeeds, data.medicalNeeds, data.logistics, data.frequency, data.availability, data.isAnonymous);
    }
  };

  const handleDeleteDonor = (id: string) => {
     setDonors(prev => prev.filter(d => d.id !== id));
     showToast('Donor removed successfully.');
  };

  const handleBrowseSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!browseLocation.trim()) return;
    
    showToast(`Searching for ${browseLocation}...`);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(browseLocation)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            const newCenter: [number, number] = [parseFloat(lat), parseFloat(lon)];
            setMapCenter(newCenter);
            showToast(`Found ${data[0].display_name}`);
        } else {
            showToast("Location not found.");
        }
    } catch (err) {
        console.error(err);
        showToast("Error searching location.");
    }
  };

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

  const formatTimeInfo = (item: MealRequest | MealOffer) => {
      if ('seekerId' in item) {
          const days = Math.floor((Date.now() - (item as MealRequest).postedAt) / 86400000);
          return days === 0 ? 'Today' : `${days}d ago`;
      } else {
          const days = Math.floor(((item as MealOffer).availableUntil - Date.now()) / 86400000);
          return days > 0 ? `Exp: ${days}d` : 'Expiring soon';
      }
  };

  const renderSeekerDashboard = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">Hello, {currentUser?.displayName}</h1>
        <p className="text-slate-500 mt-2 italic">"{motivationalQuote}"</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => handleNavigate('browse')}
          className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition text-left group"
        >
           <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <Search className="h-6 w-6 text-emerald-600" />
           </div>
           <h3 className="text-lg font-bold text-slate-900">Find Food Nearby</h3>
           <p className="text-sm text-slate-500 mt-1">Browse active offers from donors in {currentUser?.city}.</p>
        </button>
        <button
          onClick={() => handleNavigate('post-request')}
          className="p-6 bg-brand-600 text-white rounded-xl shadow-md hover:bg-brand-700 transition text-left group"
        >
           <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <PlusCircle className="h-6 w-6 text-white" />
           </div>
           <h3 className="text-lg font-bold">Request a Meal</h3>
           <p className="text-sm text-brand-100 mt-1">Post a specific request for what you need.</p>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
         <div className="flex border-b border-slate-200">
            <button
              onClick={() => setDashboardTab('ACTIVE')}
              className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${dashboardTab === 'ACTIVE' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Active Requests
            </button>
            <button
              onClick={() => setDashboardTab('HISTORY')}
              className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${dashboardTab === 'HISTORY' ? 'border-brand-600 text-brand-600 bg-brand-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Past History
            </button>
         </div>
         
         <div className="p-6">
            {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium">No {dashboardTab === 'ACTIVE' ? 'active' : 'past'} requests.</p>
                    {dashboardTab === 'ACTIVE' && (
                        <button onClick={() => handleNavigate('post-request')} className="mt-4 text-brand-600 font-bold hover:underline">
                            Create your first request
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:border-brand-300 transition bg-slate-50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            item.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                                            item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                            item.status === 'PAUSED' ? 'bg-amber-100 text-amber-700' :
                                            'bg-slate-200 text-slate-600'
                                        }`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs text-slate-500">{new Date((item as MealRequest).postedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-900">{item.description}</h3>
                                    <div className="flex items-center text-xs text-slate-500 mt-2">
                                        <MapPin className="h-3 w-3 mr-1" /> {item.city} • {item.frequency}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                     <button onClick={() => handleViewItem(item)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50">
                                         View
                                     </button>
                                     {dashboardTab === 'ACTIVE' && (
                                         <>
                                            {item.status === 'OPEN' && (
                                                <button onClick={(e) => handlePauseRequest(item.id, e)} className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center justify-center">
                                                    {item.status === 'PAUSED' ? <PlayCircle className="h-3 w-3" /> : <PauseCircle className="h-3 w-3" />}
                                                </button>
                                            )}
                                            {item.status === 'IN_PROGRESS' && (
                                                <button onClick={(e) => handleMarkFulfilled(item.id, e)} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-200">
                                                    Received
                                                </button>
                                            )}
                                            {(item.status === 'OPEN' || item.status === 'PAUSED') && (
                                                <button onClick={(e) => handleDeleteRequest(item.id, e)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100">
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            )}
                                         </>
                                     )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>
    </div>
  );

  const renderDonorDashboard = () => (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Welcome, {currentUser?.displayName}</h1>
            <p className="text-slate-500 mt-2">Your generosity fuels our community. Thank you.</p>
        </div>
        <div className="flex gap-3">
             <button
               onClick={handleShareStats}
               className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
             >
                <Share2 className="h-4 w-4 mr-2" /> Share Impact
             </button>
             <button
               onClick={() => handleNavigate('post-offer')}
               className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition shadow-md"
             >
                <PlusCircle className="h-4 w-4 mr-2" /> Donate Meal
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
             <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 mr-4">
                <Utensils className="h-6 w-6" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-500 uppercase">Total Donated</p>
                <p className="text-2xl font-bold text-slate-900">{offers.filter(o => o.donorId === currentUser?.id && o.status === 'CLAIMED').length} Meals</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
             <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <Users className="h-6 w-6" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-500 uppercase">Students Helped</p>
                <p className="text-2xl font-bold text-slate-900">{new Set(offers.filter(o => o.donorId === currentUser?.id && o.status === 'CLAIMED').map(o => o.id)).size} Students</p>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
             <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                <Trophy className="h-6 w-6" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-500 uppercase">Impact Score</p>
                <p className="text-2xl font-bold text-slate-900">Top 10%</p>
             </div>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
         <div className="flex border-b border-slate-200">
            <button
              onClick={() => setDashboardTab('ACTIVE')}
              className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${dashboardTab === 'ACTIVE' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Active Offers
            </button>
            <button
              onClick={() => setDashboardTab('HISTORY')}
              className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition ${dashboardTab === 'HISTORY' ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Donation History
            </button>
         </div>
         
         <div className="p-6">
            {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-lg font-medium">No {dashboardTab === 'ACTIVE' ? 'active' : 'past'} offers.</p>
                    {dashboardTab === 'ACTIVE' && (
                        <button onClick={() => handleNavigate('post-offer')} className="mt-4 text-emerald-600 font-bold hover:underline">
                            Post your first meal offer
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredItems.map(item => (
                        <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition bg-slate-50 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            item.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 
                                            item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                            item.status === 'CLAIMED' ? 'bg-slate-200 text-slate-600' :
                                            'bg-red-100 text-red-700'
                                    }`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-xs text-slate-500">{formatTimeInfo(item)}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 mb-1">{item.description}</h3>
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {(item as MealOffer).dietaryTags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200">
                                <button onClick={() => handleViewItem(item)} className="flex-1 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold hover:bg-slate-50">
                                    View Details
                                </button>
                                {dashboardTab === 'ACTIVE' && item.status === 'AVAILABLE' && (
                                    <button 
                                        onClick={() => {
                                            setOffers(prev => prev.filter(o => o.id !== item.id));
                                            showToast("Offer removed.");
                                        }} 
                                        className="py-1.5 px-3 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="bg-white">
      {/* ... (Hero section same as before) ... */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-blue-600 opacity-90 mix-blend-multiply"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 animate-in slide-in-from-bottom-4 duration-700 drop-shadow-sm">
            Share a Meal, <span className="text-brand-200">Fuel a Future.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-brand-50 mb-10 animate-in slide-in-from-bottom-5 duration-700 delay-100 font-medium">
            Connecting university students with home-cooked meals from generous neighbors. 
            Private, secure, and always free.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-in slide-in-from-bottom-6 duration-700 delay-200">
            <button 
              onClick={() => handleNavigate('login-seeker')}
              className="px-8 py-4 bg-white text-brand-700 font-bold text-lg rounded-xl shadow-lg hover:bg-slate-50 hover:scale-105 transition transform"
            >
              I'm a Student
            </button>
            <button 
              onClick={() => handleNavigate('login-donor')}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg rounded-xl shadow-lg hover:bg-white/10 hover:scale-105 transition transform"
            >
              I Want to Donate
            </button>
          </div>
          <div className="mt-12 flex justify-center space-x-8 text-white/90 animate-in fade-in duration-1000 delay-500">
             <div className="text-center">
                <p className="text-2xl font-bold text-white">10k+</p>
                <p className="text-xs uppercase tracking-wider font-semibold">Meals Shared</p>
             </div>
             <div className="w-px bg-white/20"></div>
             <div className="text-center">
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-xs uppercase tracking-wider font-semibold">Universities</p>
             </div>
             <div className="w-px bg-white/20"></div>
             <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-xs uppercase tracking-wider font-semibold">Non-Profit</p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
           <div 
             className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:bg-slate-100 transition hover:-translate-y-1"
             onClick={() => handleNavigate('login-seeker')}
           >
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                 <GraduationCap className="h-8 w-8 text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Request a Meal</h3>
              <p className="text-slate-600 mb-6 flex-grow">Living >30 miles from home? Verified students can request free, nutritious meals.</p>
              <button className="w-full py-3 rounded-xl font-bold bg-brand-600 text-white shadow hover:bg-brand-700">I Need Food</button>
           </div>

           <div 
             className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:bg-slate-100 transition hover:-translate-y-1"
             onClick={() => handleNavigate('login-donor')}
           >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                 <Utensils className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Share a Meal</h3>
              <p className="text-slate-600 mb-6 flex-grow">Cooked extra? Share your home-cooked food with a verified student nearby.</p>
              <button className="w-full py-3 rounded-xl font-bold bg-emerald-600 text-white shadow hover:bg-emerald-700">Post Meal Offer</button>
           </div>

           <div 
             className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:bg-slate-100 transition hover:-translate-y-1"
             onClick={() => setCurrentPage('browse')}
           >
              <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-6">
                 <Heart className="h-8 w-8 text-accent-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Browse Requests</h3>
              <p className="text-slate-600 mb-6 flex-grow">See who needs help in your city and offer to fulfill a specific request.</p>
              <button className="w-full py-3 rounded-xl font-bold bg-accent-600 text-white shadow hover:bg-accent-700">I Want to Help</button>
           </div>
        </div>
        
        <SuccessStories reviews={reviews.filter(r => r.isPublic !== false)} />

        {/* FAQ Section */}
        <div id="faq" className="border-t border-slate-100 pt-16 pb-8 bg-brand-50 mt-12 rounded-3xl">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">Frequently Asked Questions</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {FAQS.map((faq, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
                            <h4 className="font-bold text-slate-900 mb-3 flex items-start">
                                <HelpCircle className="h-5 w-5 mr-3 text-brand-600 shrink-0 mt-0.5" />
                                {faq.q}
                            </h4>
                            <p className="text-slate-600 text-sm leading-relaxed ml-8">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  const renderPublicBrowse = () => (
    <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row">
       <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
             <h2 className="text-lg font-bold mb-3 flex items-center text-slate-900"><Search className="h-4 w-4 mr-2"/> Browse Meals</h2>
             <form onSubmit={handleBrowseSearch} className="mb-3">
                 <input 
                   type="text" 
                   value={browseLocation}
                   onChange={(e) => setBrowseLocation(e.target.value)}
                   placeholder="Enter City or Zip..." 
                   className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-slate-900"
                 />
             </form>
             
             {/* ... (Existing Filters UI - Freq, Diet, Logistics - remain same) ... */}
             <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Activity Type</label>
                    <div className="flex rounded-lg bg-slate-100 p-1">
                    {['ALL', 'REQUESTS', 'OFFERS'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setFilterType(t as any)}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded transition ${filterType === t ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            {t}
                        </button>
                    ))}
                    </div>
                </div>
                {/* ... other filters ... */}
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {visibleItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                      {filteredItems.length === 0 ? (
                          <p className="text-sm">No items found matching your filters.</p>
                      ) : (
                          <p className="text-sm">No items in visible map area. Pan to explore.</p>
                      )}
                  </div>
              ) : (
                  visibleItems.map(item => {
                      const isReq = 'seekerId' in item;
                      return (
                        <div 
                           key={item.id} 
                           onClick={() => handleViewItem(item)}
                           className={`p-4 rounded-xl border cursor-pointer transition hover:shadow-md ${isReq ? 'bg-orange-50 border-orange-100' : 'bg-emerald-50 border-emerald-100'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isReq ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {isReq ? 'Request' : 'Offer'}
                                </span>
                                <span className="text-xs text-slate-500">{formatTimeInfo(item)}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1 flex items-center">
                                {item.description}
                                {'seekerId' in item && (item as MealRequest).urgency === 'URGENT' && <AlertTriangle className="h-3 w-3 ml-1 text-red-600" />}
                            </h4>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                                    {item.frequency}
                                </span>
                                {(isReq ? (item as MealRequest).seekerVerificationStatus : (item as MealOffer).donorVerificationStatus) === VerificationStatus.VERIFIED && (
                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold flex items-center">
                                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center text-xs text-slate-500 mt-2">
                                <MapPin className="h-3 w-3 mr-1" /> {item.city}
                            </div>
                        </div>
                      );
                  })
              )}
          </div>
       </div>
       <div className="flex-1 bg-slate-100 relative">
          <MapVisualizer 
             items={filteredItems} 
             center={mapCenter} 
             radius={10} 
             userRole={currentUser?.role || 'GUEST'} 
             onSelect={handleViewItem}
             onVisibleItemsChange={handleMapVisibleItemsChange}
          />
          {/* Overlay Stats for Browse Mode */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-lg border border-slate-200 z-[40]">
              <div className="text-xs font-bold text-slate-500 uppercase mb-1">Visible Area</div>
              <div className="flex space-x-4">
                  <div>
                      <span className="block text-lg font-bold text-orange-600">{visibleItems.filter(i => 'seekerId' in i).length}</span>
                      <span className="text-[10px] text-slate-500">Requests</span>
                  </div>
                  <div>
                      <span className="block text-lg font-bold text-emerald-600">{visibleItems.filter(i => 'donorId' in i).length}</span>
                      <span className="text-[10px] text-slate-500">Offers</span>
                  </div>
              </div>
          </div>
       </div>
    </div>
  );

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 transition-colors duration-200">
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          onUpdateLocation={() => setShowProfileModal(true)}
        />
        <main className="flex-grow">
          {currentPage === 'home' && renderHome()}
          {currentPage === 'admin' && (
              <AdminDashboard 
                donors={donors} 
                onDeleteDonor={handleDeleteDonor} 
                flaggedItems={flaggedContent}
                onDismissFlag={handleDismissFlag}
                onDeleteContent={handleDeleteContent}
              />
          )}
          {currentPage === 'donors' && <DonorsPage items={donors} />}
          {currentPage === 'terms' && <TermsOfUse />}
          {currentPage === 'privacy' && <PrivacyPolicy />}
          {currentPage === 'how-it-works' && <HowItWorksPage />}
          {currentPage === 'browse' && renderPublicBrowse()}
          {currentPage === 'dashboard-seeker' && currentUser?.role === UserRole.SEEKER && renderSeekerDashboard()}
          {currentPage === 'dashboard-donor' && currentUser?.role === UserRole.DONOR && renderDonorDashboard()}
          {(currentPage === 'post-request' || currentPage === 'post-offer') && (
            <PostForm 
                type={currentPage === 'post-request' ? 'REQUEST' : 'OFFER'}
                onCancel={() => {
                    if (currentUser) {
                        setCurrentPage(currentUser.role === UserRole.SEEKER ? 'dashboard-seeker' : 'dashboard-donor');
                    } else {
                        setCurrentPage('home');
                    }
                }}
                onSubmit={handlePostSubmit}
            />
          )}
        </main>
        <Footer onNavigate={handleNavigate} partners={donors.filter(d => d.tier === DonorTier.PLATINUM || d.tier === DonorTier.GOLD)} />
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
        {showAuthModal && <AuthModal initialMode={authInitialMode} targetRole={pendingRole} onComplete={handleAuthComplete} onCancel={() => setShowAuthModal(false)} />}
        {showProfileModal && currentUser && (
            <ProfileModal 
                currentUser={currentUser} 
                onUpdate={handleProfileUpdate} 
                onCancel={() => setShowProfileModal(false)}
                // Pass calculated history stats for donors
                pastDonations={
                    currentUser.role === UserRole.DONOR 
                        ? offers.filter(o => o.donorId === currentUser.id && o.status === 'CLAIMED').length 
                        : 0
                }
            />
        )}
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
                recipientVerificationStatus={activeChat.recipientVerificationStatus}
                itemName={activeChat.itemName} 
                currentUser={currentUser} 
                onClose={() => setActiveChat(null)} 
                onFlag={() => handleFlagTransaction(activeChat.itemId, activeChat.itemType)}
                onAcceptMatch={handleAcceptMatch}
                onVerifyPin={(pin) => handleVerifyPin(activeChat.itemId, activeChat.itemType, pin)}
                status={currentItem.status as any}
                completionPin={(currentItem as any).completionPin}
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
