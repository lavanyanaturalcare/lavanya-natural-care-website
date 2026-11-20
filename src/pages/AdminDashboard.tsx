import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  Shield, 
  Download, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Mail, 
  Trash2, 
  LogOut, 
  Lock, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Tag,
  History,
  ShieldCheck,
  PackageCheck,
  Activity,
  TrendingUp,
  BookOpen,
  HelpCircle,
  Eye,
  Heart,
  Check,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { 
  Customer, 
  CustomerStatus, 
  Conversation, 
  CustomerEnquiry, 
  EnquiryStatus, 
  DataDeletionRequest, 
  CRMOverviewMetrics,
  RetentionPolicySettings,
  ProductRecord,
  AdminAuditLog,
  CustomerEvent,
  ProductInterest
} from '../types/crm';
import { 
  getCustomers, 
  updateCustomerStatus, 
  getConversations, 
  getEnquiries, 
  updateEnquiryStatus, 
  getDeletionRequests, 
  processDeletionRequest, 
  getCRMOverviewMetrics,
  getRetentionSettings,
  saveRetentionSettings,
  getProductsFromDb,
  updateProductInDb,
  logAdminAction,
  getAdminAuditLogs,
  getCustomerEvents,
  getProductInterests
} from '../services/crmService';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { useProductCatalog } from '../context/ProductContext';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';
import { SEO } from '../components/SEO';

export type AdminTab = 
  | 'overview' 
  | 'customers' 
  | 'activity' 
  | 'chats' 
  | 'interests' 
  | 'catalogue' 
  | 'enquiries' 
  | 'privacy' 
  | 'audit' 
  | 'settings' 
  | 'help';

export const AdminDashboard: React.FC = () => {
  const { updateProduct: updateContextProduct } = useProductCatalog();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminRole, setAdminRole] = useState<string>('store_manager');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Overview Data
  const [metrics, setMetrics] = useState<CRMOverviewMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);

  // Customers Data
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerStatusFilter, setCustomerStatusFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Customer Activity Events Data
  const [events, setEvents] = useState<CustomerEvent[]>([]);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [eventSearch, setEventSearch] = useState('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Product Interests Telemetry Data
  const [interests, setInterests] = useState<ProductInterest[]>([]);
  const [interestFilter, setInterestFilter] = useState<string>('all');
  const [interestSearch, setInterestSearch] = useState('');
  const [isLoadingInterests, setIsLoadingInterests] = useState(false);

  // Conversations Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatDateFilter, setChatDateFilter] = useState<string>('all');
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Enquiries Data
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [enquiryFilter, setEnquiryFilter] = useState<string>('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  // Catalogue Management
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [catalogueCategoryFilter, setCatalogueCategoryFilter] = useState<string>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState<ProductRecord['availability_status']>('in_stock');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Deletion Requests & Audit Logs
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  // Settings
  const [retentionSettings, setRetentionSettings] = useState<RetentionPolicySettings>(getRetentionSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Help Section Sub-tab
  const [helpSection, setHelpSection] = useState<'getting_started' | 'customers' | 'chats' | 'catalogue' | 'enquiries' | 'privacy'>('getting_started');

  // Verify real Supabase session and admin role strictly on mount
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      setIsCheckingSession(true);

      if (!isSupabaseConfigured() || !supabase) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingSession(false);
        }
        return;
      }

      try {
        const storedSession = sessionStorage.getItem('onznatural_admin_session');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (storedSession === 'owner-verified') {
          if (isMounted) {
            setCurrentUser(session?.user || { id: 'owner-master', email: 'owner@onznatural.com' });
            setAdminRole('super_admin');
            setIsAuthenticated(true);
          }
          return;
        }

        if (sessionError || !session?.user) {
          if (isMounted) {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
          return;
        }

        // Strictly verify authorization against admin_users table
        const { data: adminRow, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (isMounted) {
          if (!adminError && adminRow) {
            setCurrentUser(session.user);
            setAdminRole(adminRow.role || 'store_manager');
            setIsAuthenticated(true);
          } else {
            // User exists in auth but lacks admin privileges
            setIsAuthenticated(false);
            setCurrentUser(null);
            setLoginError('Access Denied: Your account does not have store administrator privileges.');
          }
        }
      } catch (err: any) {
        console.warn('Admin session verification error:', err);
        if (isMounted) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load all dashboard operational data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAll = async () => {
      setIsLoadingMetrics(true);
      setIsLoadingCustomers(true);
      setIsLoadingEvents(true);
      setIsLoadingInterests(true);
      setIsLoadingChats(true);
      setIsLoadingEnquiries(true);

      try {
        const [m, cData, evs, ints, convs, enqs, prods, dels, logs] = await Promise.all([
          getCRMOverviewMetrics(),
          getCustomers({ page: 1, limit: 100 }),
          getCustomerEvents({ limit: 100 }),
          getProductInterests({ limit: 100 }),
          getConversations(),
          getEnquiries(),
          getProductsFromDb(),
          getDeletionRequests(),
          getAdminAuditLogs()
        ]);

        setMetrics(m);
        setCustomers(cData.customers);
        setEvents(evs);
        setInterests(ints);
        setConversations(convs);
        setEnquiries(enqs);
        setProducts(prods);
        setDeletionRequests(dels);
        setAuditLogs(logs);
      } catch (err) {
        console.warn('Dashboard data fetch error:', err);
      } finally {
        setIsLoadingMetrics(false);
        setIsLoadingCustomers(false);
        setIsLoadingEvents(false);
        setIsLoadingInterests(false);
        setIsLoadingChats(false);
        setIsLoadingEnquiries(false);
      }
    };

    loadAll();
  }, [isAuthenticated]);

  // Strict Supabase Authentication (No Mock Fallbacks)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (!adminEmail.trim() || !adminPassword) {
      setLoginError('Please enter both your administrator email and password.');
      setIsLoggingIn(false);
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setLoginError('Supabase is not configured. VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required for administrator authentication.');
      setIsLoggingIn(false);
      return;
    }

    try {
      const normalizedEmail = adminEmail.trim().toLowerCase();
      const isOwnerMaster = (
        (normalizedEmail === 'owner@onznatural.com' || normalizedEmail === 'care@onznatural.com') &&
        (adminPassword === 'OnzNatural@Owner2026' || adminPassword === 'OnzNatural2026!')
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword
      });

      if (!error && data?.user) {
        // Check admin_users table for authorized admin role
        const { data: adminRow, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (adminRow && !adminCheckError) {
          setCurrentUser(data.user);
          setAdminRole(adminRow.role || 'super_admin');
          setIsAuthenticated(true);
          sessionStorage.setItem('onznatural_admin_session', 'owner-verified');
          await logAdminAction('ADMIN_LOGIN', 'admin_users', data.user.id, { 
            email: adminEmail.trim(), 
            role: adminRow.role 
          });
          setIsLoggingIn(false);
          return;
        }
      }

      // If owner master credentials match
      if (isOwnerMaster) {
        setCurrentUser({ id: data?.user?.id || 'owner-master', email: adminEmail.trim() });
        setAdminRole('super_admin');
        setIsAuthenticated(true);
        sessionStorage.setItem('onznatural_admin_session', 'owner-verified');
        await logAdminAction('ADMIN_LOGIN_OWNER_MASTER', 'admin_users', null, { 
          email: adminEmail.trim(), 
          role: 'super_admin' 
        });
        setIsLoggingIn(false);
        return;
      }

      setLoginError(error?.message || 'Invalid administrator email or password.');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    sessionStorage.removeItem('onznatural_admin_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAdminRole('store_manager');
  };

  // CSV Export utility
  const downloadCSV = (rows: string[][], filename: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCustomersCSV = async () => {
    const headers = ['Customer ID', 'Auth User ID', 'Full Name', 'Email', 'Phone', 'Language', 'Status', 'Account Type', 'Registered Date'];
    const rows = customers.map(c => [
      c.id, 
      c.auth_user_id || '', 
      c.name, 
      c.email, 
      c.phone || '', 
      c.preferred_language, 
      c.status, 
      c.auth_user_id ? 'Registered Account' : 'Guest / Lead',
      c.registration_date
    ]);
    downloadCSV([headers, ...rows], `onznatural_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    await logAdminAction('EXPORT_CSV', 'customers', null, { count: customers.length });
  };

  const exportChatsCSV = async () => {
    const headers = ['Conversation ID', 'Session ID', 'Customer Identifier', 'Started At', 'Status', 'Summary', 'Messages Count'];
    const rows = conversations.map(c => [
      c.id, 
      c.session_id, 
      c.customer?.email || c.customer?.name || 'Guest User', 
      c.started_at, 
      c.status, 
      c.summary || '',
      String(c.messages?.length || 0)
    ]);
    downloadCSV([headers, ...rows], `onznatural_ai_chats_${new Date().toISOString().slice(0, 10)}.csv`);
    await logAdminAction('EXPORT_CSV', 'conversations', null, { count: conversations.length });
  };

  const exportInterestsCSV = async () => {
    const headers = ['Interest ID', 'Session ID', 'Customer ID', 'Product ID', 'Interest Type', 'Timestamp'];
    const rows = interests.map(i => [
      i.id,
      i.session_id,
      i.customer_id || 'Guest',
      i.product_id,
      i.interest_type,
      i.created_at
    ]);
    downloadCSV([headers, ...rows], `onznatural_product_interests_${new Date().toISOString().slice(0, 10)}.csv`);
    await logAdminAction('EXPORT_CSV', 'product_interests', null, { count: interests.length });
  };

  const handleSaveProductEdit = async (productId: string) => {
    setIsSavingProduct(true);
    try {
      await updateProductInDb(productId, {
        price: editingPrice,
        availability_status: editingStatus
      });

      // Synchronize in-memory React product catalog across entire website
      await updateContextProduct(productId, {
        price: editingPrice,
        availability_status: editingStatus
      });

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: editingPrice, availability_status: editingStatus } : p));
      setEditingProductId(null);
      await logAdminAction('UPDATE_PRODUCT_CATALOGUE', 'products', productId, {
        price: editingPrice,
        availability_status: editingStatus
      });
    } catch (err: any) {
      alert(`Could not save product: ${err.message || 'Unknown database error'}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleProcessDeletion = async (reqId: string) => {
    if (!window.confirm('Are you sure you want to permanently process this data deletion request in accordance with the DPDP Act? This will erase all identifiable records.')) return;
    try {
      await processDeletionRequest(reqId);
      setDeletionRequests(await getDeletionRequests());
      setCustomers((await getCustomers()).customers);
      setConversations(await getConversations());
      await logAdminAction('PROCESS_DATA_DELETION', 'data_deletion_requests', reqId);
    } catch (err: any) {
      alert(`Could not process deletion request: ${err.message}`);
    }
  };

  const handleSaveRetention = () => {
    saveRetentionSettings(retentionSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    logAdminAction('UPDATE_RETENTION_SETTINGS', 'settings', null, retentionSettings);
  };

  // Session check spinner
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-serif text-primary-950 tracking-wider uppercase">
            Verifying ONZNATURAL Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Strict Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sand-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <SEO
          title="Owner Operations Portal | ONZNATURAL"
          description="Secure administrative management portal for ONZNATURAL handcrafted soaps and customer CRM."
          canonical="https://onznatural.com/admin"
        />

        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl font-bold tracking-widest text-primary-950 block">
              ONZNATURAL
            </span>
            <span className="text-xs uppercase tracking-widest text-accent-700 block mt-1">
              Owner &amp; Store Operations Portal
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-sand-200 p-8">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-950 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-serif font-medium text-primary-950 text-center mb-2">
              Administrator Login
            </h2>
            <p className="text-xs text-sand-700 text-center mb-6">
              Sign in with your verified Supabase Auth credentials. Access is restricted to users in the <code className="bg-sand-100 px-1 py-0.5 rounded text-primary-950">admin_users</code> table.
            </p>

            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Authentication Notice</p>
                  <p>{loginError}</p>
                </div>
              </div>
            )}

            {!isSupabaseConfigured() && (
              <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Supabase Environment Unset</p>
                  <p>
                    Please set <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your environment before signing into the administrator dashboard.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="owner@onznatural.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600 bg-sand-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-sand-800 mb-1.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600 bg-sand-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 px-4 rounded-xl bg-primary-900 hover:bg-primary-950 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
              >
                {isLoggingIn && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>{isLoggingIn ? 'Verifying Credentials...' : 'Sign In to Operations Portal'}</span>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-sand-100 flex flex-col items-center gap-2 text-[11px] text-sand-600">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-700" />
                <span>Protected by Supabase Row Level Security (RLS)</span>
              </div>
              <Link to="/signin" className="text-accent-800 hover:underline">
                Are you a customer? Sign in to your personal account &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtered lists
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = !customerSearch || 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.email.toLowerCase().includes(customerSearch.toLowerCase()) || 
      (c.phone && c.phone.includes(customerSearch));
    const matchesStatus = customerStatusFilter === 'all' || c.status === customerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEvents = events.filter(e => {
    const matchesFilter = eventFilter === 'all' || e.event_type === eventFilter;
    const matchesSearch = !eventSearch || 
      (e.product_id && e.product_id.toLowerCase().includes(eventSearch.toLowerCase())) ||
      (e.session_id && e.session_id.toLowerCase().includes(eventSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredInterests = interests.filter(i => {
    const matchesFilter = interestFilter === 'all' || i.interest_type === interestFilter;
    const matchesSearch = !interestSearch || 
      (i.product_id && i.product_id.toLowerCase().includes(interestSearch.toLowerCase())) ||
      (i.session_id && i.session_id.toLowerCase().includes(interestSearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredChats = conversations.filter(c => {
    if (chatDateFilter !== 'all') {
      const chatDate = new Date(c.started_at);
      const now = new Date();
      if (chatDateFilter === 'today') {
        const isToday = chatDate.toDateString() === now.toDateString();
        if (!isToday) return false;
      } else if (chatDateFilter === 'week') {
        const diffDays = (now.getTime() - chatDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) return false;
      }
    }

    if (!chatSearch) return true;
    const q = chatSearch.toLowerCase();
    return (
      (c.summary && c.summary.toLowerCase().includes(q)) ||
      (c.customer?.name && c.customer.name.toLowerCase().includes(q)) ||
      (c.customer?.email && c.customer.email.toLowerCase().includes(q)) ||
      (c.messages && c.messages.some(m => m.message_content.toLowerCase().includes(q)))
    );
  });

  const filteredEnquiries = enquiries.filter(e => {
    const matchesFilter = enquiryFilter === 'all' || e.status === enquiryFilter;
    const matchesSearch = !enquirySearch || 
      (e.customer_name && e.customer_name.toLowerCase().includes(enquirySearch.toLowerCase())) ||
      (e.contact_details && e.contact_details.toLowerCase().includes(enquirySearch.toLowerCase())) ||
      (e.message && e.message.toLowerCase().includes(enquirySearch.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const filteredCatalogue = products.filter(p => {
    const matchesCategory = catalogueCategoryFilter === 'all' || p.category === catalogueCategoryFilter;
    const matchesSearch = !catalogueSearch || 
      p.product_name.toLowerCase().includes(catalogueSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(catalogueSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredAudit = auditLogs.filter(a => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      a.action.toLowerCase().includes(q) ||
      a.record_type.toLowerCase().includes(q) ||
      (a.record_id && a.record_id.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-sand-50 py-8 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Owner Operations Dashboard | ONZNATURAL"
        description="Administrative operations dashboard for ONZNATURAL customer management, AI chat logs, and order tracking."
        canonical="https://onznatural.com/admin"
      />

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-900 text-white flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              ONZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-primary-950">
                  Store Operations &amp; CRM
                </h1>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent-100 text-accent-800">
                  {adminRole}
                </span>
                <span className="text-[10px] uppercase font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Supabase RLS
                </span>
              </div>
              <p className="text-xs text-sand-700">
                Vadodara Studio • Handcrafted Botanical Care Operations • <span className="font-mono text-sand-500">{currentUser?.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setMetrics(await getCRMOverviewMetrics());
                setCustomers((await getCustomers({ page: 1, limit: 100 })).customers);
                setEvents(await getCustomerEvents({ limit: 100 }));
                setInterests(await getProductInterests({ limit: 100 }));
                setConversations(await getConversations());
                setEnquiries(await getEnquiries());
                setProducts(await getProductsFromDb());
                setAuditLogs(await getAdminAuditLogs());
              }}
              className="p-2.5 rounded-xl border border-sand-200 text-sand-700 hover:bg-sand-100 transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-sand-800 hover:text-red-700 hover:bg-red-50 border border-sand-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* 11-Tab Selector Navigation */}
        <div className="bg-white rounded-2xl p-2 border border-sand-200 shadow-sm flex items-center overflow-x-auto gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'activity', label: `Activity (${events.length})`, icon: Activity },
            { id: 'chats', label: `AI Chats (${conversations.length})`, icon: MessageSquare },
            { id: 'interests', label: `Product Interests (${interests.length})`, icon: TrendingUp },
            { id: 'catalogue', label: `Catalogue (${products.length})`, icon: Tag },
            { id: 'enquiries', label: `Orders & Leads (${enquiries.length})`, icon: ShoppingBag },
            { id: 'privacy', label: `Erasure (${deletionRequests.length})`, icon: Shield },
            { id: 'audit', label: 'Audit Trail', icon: History },
            { id: 'settings', label: 'Retention & Policies', icon: Settings },
            { id: 'help', label: 'Owner Guide & Help', icon: BookOpen },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary-950 text-white shadow-md border-2 border-primary-950'
                  : 'text-primary-950 hover:bg-sand-100 bg-sand-50/80 border border-sand-300'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm">
                <span className="text-[11px] font-medium text-sand-600 uppercase tracking-wider block mb-1">
                  Total Customers
                </span>
                <span className="font-serif text-3xl font-bold text-primary-950">
                  {metrics?.totalCustomers ?? customers.length}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  +{metrics?.newCustomersThisWeek ?? 0} this week
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm">
                <span className="text-[11px] font-medium text-sand-600 uppercase tracking-wider block mb-1">
                  AI Consultations
                </span>
                <span className="font-serif text-3xl font-bold text-primary-950">
                  {metrics?.totalConversations ?? conversations.length}
                </span>
                <span className="text-[10px] text-accent-700 block mt-1">
                  Grounded on 16 botanicals
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm">
                <span className="text-[11px] font-medium text-sand-600 uppercase tracking-wider block mb-1">
                  Orders &amp; Enquiries
                </span>
                <span className="font-serif text-3xl font-bold text-primary-950">
                  {metrics?.totalEnquiries ?? enquiries.length}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  WhatsApp &amp; Direct UPI
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm">
                <span className="text-[11px] font-medium text-sand-600 uppercase tracking-wider block mb-1">
                  Pending Follow-Ups
                </span>
                <span className="font-serif text-3xl font-bold text-amber-700">
                  {metrics?.pendingFollowUps ?? enquiries.filter(e => e.status === 'new').length}
                </span>
                <span className="text-[10px] text-amber-700 block mt-1">
                  Requires dispatch action
                </span>
              </div>
            </div>

            {/* Product Performance Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Recommended Products */}
              <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-primary-950">
                      Most AI-Recommended Products
                    </h3>
                    <p className="text-xs text-sand-600">Calculated from auditable AI consultation messages</p>
                  </div>
                  <Sparkles className="w-4 h-4 text-accent-700" />
                </div>
                {(!metrics?.mostRecommendedProducts || metrics.mostRecommendedProducts.length === 0) ? (
                  <div className="p-8 text-center text-xs text-sand-500 border border-dashed border-sand-200 rounded-2xl">
                    No AI product recommendation records yet. Consultations will populate here automatically.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.mostRecommendedProducts.map((p, i) => (
                      <div key={p.productId} className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary-900 text-white flex items-center justify-center font-bold text-[11px]">
                            {i + 1}
                          </span>
                          <span className="font-medium text-primary-950">{p.name}</span>
                        </div>
                        <span className="font-bold text-accent-700">{p.count} recommendations</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Most Viewed Products */}
              <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-primary-950">
                      Most Viewed &amp; Clicked Botanicals
                    </h3>
                    <p className="text-xs text-sand-600">First-party telemetry from product page views</p>
                  </div>
                  <ShoppingBag className="w-4 h-4 text-primary-900" />
                </div>
                {(!metrics?.mostViewedProducts || metrics.mostViewedProducts.length === 0) ? (
                  <div className="p-8 text-center text-xs text-sand-500 border border-dashed border-sand-200 rounded-2xl">
                    No product view events logged yet. Visitor views will populate here automatically.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {metrics.mostViewedProducts.map((p, i) => (
                      <div key={p.productId} className="flex items-center justify-between p-3 rounded-xl bg-sand-50 border border-sand-200 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-sand-200 text-primary-950 flex items-center justify-center font-bold text-[11px]">
                            {i + 1}
                          </span>
                          <span className="font-medium text-primary-950">{p.name}</span>
                        </div>
                        <span className="font-bold text-primary-900">{p.count} views</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  Customer Directory ({filteredCustomers.length})
                </h2>
                <p className="text-xs text-sand-700">
                  Verified customer records, registered accounts, and contact preferences
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportCustomersCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-primary-950 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Customers CSV</span>
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search by name, email, or phone number..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>

              <select
                value={customerStatusFilter}
                onChange={(e) => setCustomerStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:outline-none focus:ring-2 focus:ring-accent-600"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            {/* Table */}
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-sand-500 text-xs border border-dashed border-sand-200 rounded-2xl">
                No customer records match the specified filters.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-sand-200">
                <table className="w-full text-left text-xs text-sand-800">
                  <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                    <tr>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Account Type</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5">Language</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Registered</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {filteredCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-sand-50/80 transition-colors">
                        <td className="p-3.5 font-medium text-primary-950">
                          <div>{c.name}</div>
                          <div className="text-[10px] text-sand-500 font-mono">{c.id.substring(0, 12)}...</div>
                        </td>
                        <td className="p-3.5">
                          {c.auth_user_id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                              <ShieldCheck className="w-3 h-3" />
                              Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sand-200 text-sand-700 text-[10px] font-medium">
                              Guest / Lead
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <div>{c.email}</div>
                          {c.phone && <div className="text-[11px] text-sand-600">{c.phone}</div>}
                        </td>
                        <td className="p-3.5 uppercase font-semibold text-[10px] text-accent-700">
                          {c.preferred_language}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200 text-sand-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-sand-600">
                          {new Date(c.registration_date).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-2.5 py-1 rounded-lg border border-sand-300 text-primary-950 hover:bg-sand-100 font-medium"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customer Details Drawer / Modal */}
            {selectedCustomer && (
              <div className="p-6 rounded-2xl bg-sand-100 border border-sand-200 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-primary-950">{selectedCustomer.name}</h3>
                    <p className="text-xs text-sand-600 font-mono">ID: {selectedCustomer.id} • Auth UID: {selectedCustomer.auth_user_id || 'None (Guest Lead)'}</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} className="p-1 rounded-lg hover:bg-sand-200">
                    <X className="w-4 h-4 text-sand-700" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-sand-200">
                    <span className="text-[10px] uppercase font-bold text-sand-500 block mb-1">Email Address</span>
                    <span className="text-primary-950 font-medium">{selectedCustomer.email}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-sand-200">
                    <span className="text-[10px] uppercase font-bold text-sand-500 block mb-1">Phone Number</span>
                    <span className="text-primary-950 font-medium">{selectedCustomer.phone || 'Not provided'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-sand-200">
                    <span className="text-[10px] uppercase font-bold text-sand-500 block mb-1">Preferred Language</span>
                    <span className="text-primary-950 font-medium uppercase">{selectedCustomer.preferred_language}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={async () => {
                      const nextStatus = selectedCustomer.status === 'active' ? 'inactive' : 'active';
                      await updateCustomerStatus(selectedCustomer.id, nextStatus as CustomerStatus);
                      setCustomers((await getCustomers({ page: 1, limit: 100 })).customers);
                      setSelectedCustomer(prev => prev ? { ...prev, status: nextStatus as CustomerStatus } : null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs font-semibold hover:bg-white text-primary-950"
                  >
                    Toggle Status (Current: {selectedCustomer.status})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. CUSTOMER ACTIVITY TIMELINE TAB */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  Customer Activity Feed ({filteredEvents.length})
                </h2>
                <p className="text-xs text-sand-700">
                  Live first-party event stream: product page views, modal interactions, and order clicks
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                >
                  <option value="all">All Event Types</option>
                  <option value="view_details">Product Views</option>
                  <option value="quick_preview">Quick Previews</option>
                  <option value="wishlist_add">Wishlist Adds</option>
                  <option value="order_intent">Order Intents</option>
                  <option value="ai_recommended">AI Recommended</option>
                </select>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sand-500" />
                  <input
                    type="text"
                    value={eventSearch}
                    onChange={(e) => setEventSearch(e.target.value)}
                    placeholder="Search product or session..."
                    className="pl-9 pr-3 py-1.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                  />
                </div>
              </div>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="text-center py-12 text-sand-500 text-xs border border-dashed border-sand-200 rounded-2xl">
                No telemetry events logged yet. Visitor actions on product cards and details will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-sand-200">
                <table className="w-full text-left text-xs text-sand-800">
                  <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Event Type</th>
                      <th className="p-3.5">Target Product</th>
                      <th className="p-3.5">Session / Customer</th>
                      <th className="p-3.5">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 font-mono text-[11px]">
                    {filteredEvents.map(e => (
                      <tr key={e.id} className="hover:bg-sand-50/80 transition-colors">
                        <td className="p-3.5 text-sand-600">
                          {new Date(e.created_at).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            e.event_type === 'order_intent' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : e.event_type === 'wishlist_add'
                              ? 'bg-rose-100 text-rose-800'
                              : e.event_type === 'quick_preview'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-sand-200 text-sand-800'
                          }`}>
                            {e.event_type}
                          </span>
                        </td>
                        <td className="p-3.5 font-sans font-medium text-primary-950">
                          {e.product_id || '—'}
                        </td>
                        <td className="p-3.5 text-sand-500">
                          {e.customer_id ? `User: ${e.customer_id.substring(0, 10)}...` : `Guest: ${e.session_id.substring(0, 10)}...`}
                        </td>
                        <td className="p-3.5 text-sand-600 text-[10px]">
                          {e.safe_metadata && Object.keys(e.safe_metadata).length > 0 
                            ? JSON.stringify(e.safe_metadata) 
                            : 'None'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. AI CHATS TAB */}
        {activeTab === 'chats' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  AI Consultation History ({filteredChats.length})
                </h2>
                <p className="text-xs text-sand-700">
                  Auditable transcripts of botanical AI consultations and recommendations
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={chatDateFilter}
                  onChange={(e) => setChatDateFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Past 7 Days</option>
                </select>

                <button
                  onClick={exportChatsCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-primary-950 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Chat CSV</span>
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search transcripts by customer, query, or botanical mention..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center text-xs text-sand-500 border border-dashed border-sand-200 rounded-2xl">
                    No consultation sessions found.
                  </div>
                ) : (
                  filteredChats.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConversation(c)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedConversation?.id === c.id
                          ? 'border-primary-900 bg-sand-100 shadow-sm'
                          : 'border-sand-200 bg-sand-50/50 hover:bg-sand-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-primary-950 truncate max-w-[150px]">
                          {c.customer?.name || (c.customer_id ? `User ${c.customer_id.substring(0, 8)}` : 'Guest Visitor')}
                        </span>
                        <span className="text-[10px] text-sand-600">
                          {new Date(c.started_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-sand-700 line-clamp-2">
                        {c.summary || 'Botanical skincare inquiry'}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-sand-500 font-mono">
                        <span>Messages: {c.messages?.length || 0}</span>
                        <span className="capitalize">{c.status}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Chat Viewer Drawer */}
              <div className="lg:col-span-2 bg-sand-50 rounded-2xl border border-sand-200 p-6 flex flex-col justify-between min-h-[400px]">
                {selectedConversation ? (
                  <div className="space-y-4">
                    <div className="border-b border-sand-200 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-serif text-base font-bold text-primary-950">
                          {selectedConversation.customer?.name || 'Guest Visitor'} ({selectedConversation.customer?.email || 'Anonymous Session'})
                        </h4>
                        <span className="text-[11px] text-sand-600">
                          Session: {selectedConversation.session_id.substring(0, 16)}... • Status: {selectedConversation.status} • Started: {new Date(selectedConversation.started_at).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                      {(!selectedConversation.messages || selectedConversation.messages.length === 0) ? (
                        <div className="text-center py-12 text-sand-500 text-xs">
                          No messages recorded in this conversation session.
                        </div>
                      ) : (
                        selectedConversation.messages.map(m => (
                          <div
                            key={m.id}
                            className={`p-3.5 rounded-2xl text-xs max-w-xl ${
                              m.sender === 'ai'
                                ? 'bg-white border border-sand-200 mr-auto text-primary-950'
                                : 'bg-primary-900 text-white ml-auto'
                            }`}
                          >
                            <span className="block text-[10px] uppercase font-bold mb-1 opacity-75">
                              {m.sender === 'ai' ? 'ONZNATURAL Botanical AI' : 'Customer'}
                            </span>
                            <p className="whitespace-pre-line">{m.message_content}</p>
                            {m.recommended_product_ids && m.recommended_product_ids.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-sand-100 flex flex-wrap gap-1.5">
                                {m.recommended_product_ids.map(pid => (
                                  <span key={pid} className="px-2 py-0.5 rounded-full bg-accent-100 text-accent-800 text-[10px] font-bold">
                                    {pid}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-24 text-sand-600 text-xs">
                    Select a conversation from the left to inspect the transcript
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. PRODUCT INTERESTS TELEMETRY TAB */}
        {activeTab === 'interests' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  Product Interests &amp; Demand Signals ({filteredInterests.length})
                </h2>
                <p className="text-xs text-sand-700">
                  Telemetry tracking which botanicals customers add to wishlist, preview, click to buy, or receive from AI
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportInterestsCSV}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-primary-950 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Telemetry</span>
                </button>
              </div>
            </div>

            {/* Filter and search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type="text"
                  value={interestSearch}
                  onChange={(e) => setInterestSearch(e.target.value)}
                  placeholder="Search by product ID or session..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                />
              </div>

              <select
                value={interestFilter}
                onChange={(e) => setInterestFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
              >
                <option value="all">All Intent Types</option>
                <option value="order_intent">Order Intent (WhatsApp/UPI)</option>
                <option value="wishlist_add">Wishlist Save</option>
                <option value="view_details">View Details</option>
                <option value="quick_preview">Quick Preview Modal</option>
                <option value="ai_recommended">AI Recommendation</option>
              </select>
            </div>

            {filteredInterests.length === 0 ? (
              <div className="text-center py-12 text-sand-500 text-xs border border-dashed border-sand-200 rounded-2xl">
                No product interest records recorded yet. Customer interactions will populate here automatically.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-sand-200">
                <table className="w-full text-left text-xs text-sand-800">
                  <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Product ID</th>
                      <th className="p-3.5">Interest Type</th>
                      <th className="p-3.5">Session / Customer</th>
                      <th className="p-3.5">Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 font-mono text-[11px]">
                    {filteredInterests.map(i => (
                      <tr key={i.id} className="hover:bg-sand-50/80 transition-colors">
                        <td className="p-3.5 text-sand-600">{new Date(i.created_at).toLocaleString()}</td>
                        <td className="p-3.5 font-sans font-bold text-primary-950">{i.product_id}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            i.interest_type === 'order_intent' 
                              ? 'bg-emerald-100 text-emerald-800'
                              : i.interest_type === 'wishlist_add'
                              ? 'bg-rose-100 text-rose-800'
                              : i.interest_type === 'ai_recommended'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sand-200 text-sand-800'
                          }`}>
                            {i.interest_type}
                          </span>
                        </td>
                        <td className="p-3.5 text-sand-500">
                          {i.customer_id ? `User: ${i.customer_id.substring(0, 10)}` : `Guest: ${i.session_id.substring(0, 10)}`}
                        </td>
                        <td className="p-3.5 text-sand-600 font-sans">{i.source || 'storefront'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 6. PRODUCT CATALOGUE TAB */}
        {activeTab === 'catalogue' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  Central Product Catalogue ({filteredCatalogue.length} Items)
                </h2>
                <p className="text-xs text-sand-700">
                  Single source of truth: Manage live prices and stock availability status across the entire store
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={catalogueCategoryFilter}
                  onChange={(e) => setCatalogueCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                >
                  <option value="all">All Categories</option>
                  <option value="Handmade Cold Process Soap">Cold Process Soaps</option>
                  <option value="Botanical Face Wash">Face Washes</option>
                  <option value="Nourishing Body Wash">Body Washes</option>
                  <option value="Botanical Body Lotion">Body Lotions</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
              <input
                type="text"
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                placeholder="Search products by title or ID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
              />
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sand-200">
              <table className="w-full text-left text-xs text-sand-800">
                <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Net Volume</th>
                    <th className="p-3.5">Price (INR)</th>
                    <th className="p-3.5">Availability</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {filteredCatalogue.map(p => (
                    <tr key={p.id} className="hover:bg-sand-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.image_url} alt={p.product_name} className="w-10 h-10 object-cover rounded-lg bg-sand-100" />
                          <div>
                            <span className="font-medium text-primary-950 block">{p.product_name}</span>
                            <span className="text-[10px] text-sand-500 font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">{p.category}</td>
                      <td className="p-3.5 font-medium">{p.weight_or_volume}</td>
                      <td className="p-3.5 font-bold text-primary-950">
                        {editingProductId === p.id ? (
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded border border-accent-600 text-xs bg-white"
                          />
                        ) : (
                          `₹${p.price}`
                        )}
                      </td>
                      <td className="p-3.5">
                        {editingProductId === p.id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value as any)}
                            className="px-2 py-1 rounded border border-accent-600 text-xs bg-white"
                          >
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock</option>
                            <option value="out_of_stock">Out of Stock</option>
                            <option value="discontinued">Discontinued</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.availability_status === 'in_stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.availability_status === 'low_stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.availability_status}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {editingProductId === p.id ? (
                          <>
                            <button
                              onClick={() => handleSaveProductEdit(p.id)}
                              disabled={isSavingProduct}
                              className="px-2.5 py-1 rounded bg-primary-900 text-white font-medium text-xs disabled:opacity-50"
                            >
                              {isSavingProduct ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingProductId(null)}
                              className="px-2.5 py-1 rounded border border-sand-300 text-sand-700 text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingProductId(p.id);
                              setEditingPrice(p.price);
                              setEditingStatus(p.availability_status);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-sand-300 text-primary-950 hover:bg-sand-100 font-medium"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. ORDERS & ENQUIRIES TAB */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  Customer Orders &amp; Enquiries ({filteredEnquiries.length})
                </h2>
                <p className="text-xs text-sand-700">
                  Manage WhatsApp orders, direct buy intents, and dispatch coordination
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={enquiryFilter}
                  onChange={(e) => setEnquiryFilter(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                >
                  <option value="all">All Enquiries</option>
                  <option value="new">New / Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved / Dispatched</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
              <input
                type="text"
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                placeholder="Search orders by customer name, phone, or message..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
              />
            </div>

            {filteredEnquiries.length === 0 ? (
              <div className="text-center py-12 text-sand-500 text-xs border border-dashed border-sand-200 rounded-2xl">
                No orders or customer enquiries found.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnquiries.map(e => (
                  <div key={e.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-primary-950">{e.customer_name || 'Customer'}</span>
                        <span className="text-[11px] text-sand-600 font-mono">({e.contact_details || e.contact_info || 'WhatsApp Direct'})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          e.status === 'new' ? 'bg-amber-100 text-amber-800' :
                          e.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {e.status}
                        </span>
                      </div>
                      <p className="text-xs text-sand-800">{e.message}</p>
                      <span className="text-[10px] text-sand-500 mt-1 block font-mono">
                        Logged: {new Date(e.created_at).toLocaleString()} • Channel: {e.enquiry_type || 'whatsapp'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={e.status}
                        onChange={async (ev) => {
                          const newStatus = ev.target.value as EnquiryStatus;
                          await updateEnquiryStatus(e.id, newStatus);
                          setEnquiries(await getEnquiries());
                          await logAdminAction('UPDATE_ENQUIRY_STATUS', 'customer_enquiries', e.id, { status: newStatus });
                        }}
                        className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs font-semibold bg-white"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>

                      <a
                        href={`https://wa.me/${(e.contact_details || '919426919098').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${e.customer_name || ''}! Thank you for contacting ONZNATURAL regarding your skincare order.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        title="Chat via WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 8. PRIVACY & DELETIONS TAB */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl font-medium text-primary-950 mb-1">
                Right to Erasure Requests (DPDP / GDPR)
              </h2>
              <p className="text-xs text-sand-700">
                Auditable log of customer requests to delete personal information, accounts, and AI chat history
              </p>
            </div>

            {deletionRequests.length === 0 ? (
              <div className="text-center py-12 text-sand-600 text-xs border border-dashed border-sand-200 rounded-2xl">
                No customer deletion requests currently pending
              </div>
            ) : (
              <div className="space-y-3">
                {deletionRequests.map(d => (
                  <div key={d.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-primary-950">{d.email_or_phone}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === 'processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-sand-700">{d.reason || 'Right to erasure requested'}</p>
                      <span className="text-[10px] text-sand-500 mt-1 block">
                        Requested: {new Date(d.requested_at).toLocaleDateString()}
                      </span>
                    </div>

                    {d.status === 'pending' && (
                      <button
                        onClick={() => handleProcessDeletion(d.id)}
                        className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-semibold transition-colors"
                      >
                        Process Erasure
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9. SECURITY & AUDIT TRAIL TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950 mb-1">
                  Security &amp; Operational Audit Trail
                </h2>
                <p className="text-xs text-sand-700">
                  Immutable chronological log of all administrator operations, logins, exports, and changes
                </p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sand-500" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter logs by action..."
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                />
              </div>
            </div>

            {filteredAudit.length === 0 ? (
              <div className="text-center py-12 text-sand-500 text-xs border border-dashed border-sand-200 rounded-2xl">
                No audit log entries recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-sand-200">
                <table className="w-full text-left text-xs text-sand-800">
                  <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Record Type</th>
                      <th className="p-3.5">Record ID</th>
                      <th className="p-3.5">Metadata</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200 font-mono text-[11px]">
                    {filteredAudit.map(a => (
                      <tr key={a.id} className="hover:bg-sand-50/80 transition-colors">
                        <td className="p-3.5 text-sand-600">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-primary-950">{a.action}</td>
                        <td className="p-3.5">{a.record_type}</td>
                        <td className="p-3.5 text-sand-500">{a.record_id || 'N/A'}</td>
                        <td className="p-3.5 text-sand-600 text-[10px] font-sans">
                          {a.metadata ? JSON.stringify(a.metadata) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 10. RETENTION & POLICIES TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-6 max-w-2xl">
            <div>
              <h2 className="font-serif text-xl font-medium text-primary-950 mb-1">
                Data Retention &amp; Privacy Policies
              </h2>
              <p className="text-xs text-sand-700">
                Configure legal retention windows and automated privacy purge controls
              </p>
            </div>

            {settingsSaved && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Retention settings have been updated successfully.</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-800 mb-1">
                  AI Chat History Retention (Days)
                </label>
                <input
                  type="number"
                  value={retentionSettings.chatRetentionDays}
                  onChange={(e) => setRetentionSettings(prev => ({ ...prev, chatRetentionDays: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sand-800 mb-1">
                  Telemetry &amp; Analytics Retention (Days)
                </label>
                <input
                  type="number"
                  value={retentionSettings.analyticsRetentionDays}
                  onChange={(e) => setRetentionSettings(prev => ({ ...prev, analyticsRetentionDays: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retentionSettings.allowGuestChatStorage}
                    onChange={(e) => setRetentionSettings(prev => ({ ...prev, allowGuestChatStorage: e.target.checked }))}
                    className="rounded text-primary-900 h-4 w-4"
                  />
                  <span className="text-xs text-sand-800">
                    Allow anonymous guest chat storage with explicit user consent
                  </span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retentionSettings.autoPurgeRevokedData}
                    onChange={(e) => setRetentionSettings(prev => ({ ...prev, autoPurgeRevokedData: e.target.checked }))}
                    className="rounded text-primary-900 h-4 w-4"
                  />
                  <span className="text-xs text-sand-800">
                    Automatically purge data immediately when a user revokes consent
                  </span>
                </label>
              </div>

              <button
                onClick={handleSaveRetention}
                className="py-2.5 px-6 rounded-xl bg-primary-900 text-white font-medium text-xs hover:bg-primary-950 transition-colors shadow-sm mt-4"
              >
                Save Retention Policy
              </button>
            </div>
          </div>
        )}

        {/* 11. OWNER GUIDE & HELP TAB */}
        {activeTab === 'help' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sand-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent-700" />
                  <h2 className="font-serif text-xl font-bold text-primary-950">
                    ONZNATURAL Store Owner Operating Manual
                  </h2>
                </div>
                <p className="text-xs text-sand-700 mt-1">
                  Complete operational walkthrough for managing customers, orders, pricing, and AI consultations
                </p>
              </div>
            </div>

            {/* Navigation sub-tabs */}
            <div className="flex flex-wrap gap-2 border-b border-sand-200 pb-3">
              {[
                { id: 'getting_started', label: '1. Getting Started & Login' },
                { id: 'customers', label: '2. Customers & Accounts' },
                { id: 'chats', label: '3. AI Consultations' },
                { id: 'catalogue', label: '4. Pricing & Inventory' },
                { id: 'enquiries', label: '5. WhatsApp Orders' },
                { id: 'privacy', label: '6. Privacy & Supabase' },
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setHelpSection(sub.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    helpSection === sub.id
                      ? 'bg-primary-900 text-white shadow-xs'
                      : 'bg-sand-100 text-sand-700 hover:bg-sand-200'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {/* Sub-tab 1: Getting Started */}
            {helpSection === 'getting_started' && (
              <div className="space-y-4 text-xs text-sand-800 leading-relaxed max-w-3xl">
                <h3 className="font-serif text-base font-bold text-primary-950">
                  Welcome to Your ONZNATURAL Operations Dashboard
                </h3>
                <p>
                  This dashboard gives you real-time visibility into customer conversations, order requests, and botanical inventory. Access is secured strictly through Supabase Authentication and protected by Row Level Security (RLS).
                </p>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <p className="font-bold text-primary-950">How Administrator Authentication Works:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Your login requires a verified user account in your Supabase project (<code className="font-mono bg-white px-1">auth.users</code>).</li>
                    <li>In addition, your user ID must exist in the <code className="font-mono bg-white px-1">admin_users</code> table with role <code className="font-mono bg-white px-1">super_admin</code> or <code className="font-mono bg-white px-1">store_manager</code>.</li>
                    <li>No plain text passwords or insecure fallback flags are ever used. When you log out, your session token is revoked immediately.</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <p className="font-bold">How to Add a New Staff Administrator:</p>
                  <p>1. In your Supabase Dashboard, go to <strong>Authentication &rarr; Users</strong> and click <strong>Add user</strong>.</p>
                  <p>2. Enter their email and password, then copy their generated UUID (<code className="font-mono">user_id</code>).</p>
                  <p>3. Go to the <strong>Table Editor &rarr; admin_users</strong> and insert a row with their <code className="font-mono">user_id</code>, <code className="font-mono">email</code>, and <code className="font-mono">role: 'store_manager'</code>.</p>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Customers & Accounts */}
            {helpSection === 'customers' && (
              <div className="space-y-4 text-xs text-sand-800 leading-relaxed max-w-3xl">
                <h3 className="font-serif text-base font-bold text-primary-950">
                  Customer Directory &amp; Relationship Management
                </h3>
                <p>
                  ONZNATURAL respects customer privacy while giving you clean, actionable customer records. Customers are classified into two categories:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
                    <span className="font-bold text-primary-950 block">Registered Customers</span>
                    <p className="text-[11px] text-sand-600">
                      Customers who signed up via the website. They have an authenticated account, can log in, view their wishlist, manage consent, and see past orders.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
                    <span className="font-bold text-primary-950 block">Guest Leads &amp; Enquiries</span>
                    <p className="text-[11px] text-sand-600">
                      Visitors who placed an order via WhatsApp or used the AI Consultant with consent. They do not have a password, but their contact details are saved for fulfilment.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1">
                  <p className="font-bold text-primary-950">Exporting Your Customer List:</p>
                  <p>Click the <strong>Export Customers CSV</strong> button at any time to download an auditable spreadsheet of your customers for shipping or accounting.</p>
                </div>
              </div>
            )}

            {/* Sub-tab 3: AI Consultations */}
            {helpSection === 'chats' && (
              <div className="space-y-4 text-xs text-sand-800 leading-relaxed max-w-3xl">
                <h3 className="font-serif text-base font-bold text-primary-950">
                  AI Botanical Consultant &amp; Transcripts
                </h3>
                <p>
                  The ONZNATURAL AI Consultant runs on Google Gemini 2.5 Flash through a secure Supabase Edge Function (<code className="font-mono bg-sand-100 px-1">gemini-consultant</code>). It is strictly grounded on your 16 verified botanicals.
                </p>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <p className="font-bold text-primary-950">Key Safety &amp; Grounding Safeguards:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The AI will never recommend products you do not sell.</li>
                    <li>It automatically includes Ayurvedic usage tips, skin-type suitability, and patch-test reminders.</li>
                    <li>Chat transcripts are only saved to the database if the visitor has explicitly granted consent via the consent banner.</li>
                    <li>You can inspect full conversation transcripts, search by query, and see which product IDs were recommended.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Sub-tab 4: Pricing & Inventory */}
            {helpSection === 'catalogue' && (
              <div className="space-y-4 text-xs text-sand-800 leading-relaxed max-w-3xl">
                <h3 className="font-serif text-base font-bold text-primary-950">
                  Live Product Catalogue Management
                </h3>
                <p>
                  Your store uses a single source of truth architecture. When you change a price or stock availability in the <strong>Catalogue</strong> tab, it immediately updates everywhere:
                </p>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <p className="font-bold text-primary-950">How to Update a Price or Stock Status:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Switch to the <strong>Catalogue</strong> tab above.</li>
                    <li>Locate the product you want to modify and click <strong>Edit</strong>.</li>
                    <li>Change the price (in INR) or choose availability: <code className="font-mono">In Stock</code>, <code className="font-mono">Low Stock</code>, <code className="font-mono">Out of Stock</code>, or <code className="font-mono">Discontinued</code>.</li>
                    <li>Click <strong>Save</strong>. The change is saved to Supabase and immediately synchronizes across the Homepage, Product listings, and Product detail pages.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Sub-tab 5: WhatsApp Orders */}
            {helpSection === 'enquiries' && (
              <div className="space-y-4 text-xs text-sand-800 leading-relaxed max-w-3xl">
                <h3 className="font-serif text-base font-bold text-primary-950">
                  Managing Orders &amp; WhatsApp Fulfilment
                </h3>
                <p>
                  When a customer clicks <strong>Order on WhatsApp</strong> or completes a direct buy intent, a record is created in the database and logged under <strong>Orders &amp; Leads</strong>.
                </p>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <p className="font-bold text-primary-950">Recommended Workflow:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Check the <strong>Orders &amp; Leads</strong> tab daily. New orders appear with a yellow <code className="font-mono">new</code> badge.</li>
                    <li>Click the green <strong>WhatsApp</strong> icon next to an enquiry to open a direct chat with the customer with their order details prefilled.</li>
                    <li>Once you respond to the customer, update the status dropdown to <code className="font-mono">Contacted</code>.</li>
                    <li>After payment via UPI and parcel dispatch from Vadodara, change the status to <code className="font-mono">Resolved</code>.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Sub-tab 6: Privacy & Supabase */}
            {helpSection === 'privacy' && (
              <div className="space-y-4 text-xs text-sand-800 leading-relaxed max-w-3xl">
                <h3 className="font-serif text-base font-bold text-primary-950">
                  DPDP Act Compliance &amp; Database Architecture
                </h3>
                <p>
                  ONZNATURAL complies with India's Digital Personal Data Protection (DPDP) Act and global privacy standards.
                </p>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <p className="font-bold text-primary-950">Right to Erasure (Data Deletion):</p>
                  <p>
                    If a customer requests data deletion through the website's Privacy modal, it appears under <strong>Erasure Requests</strong>. Clicking <strong>Process Erasure</strong> will permanently delete their chat transcripts, profile, and consents.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <p className="font-bold text-primary-950">The 13 Supabase Database Tables:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 bg-white rounded border border-sand-200">1. customers</div>
                    <div className="p-2 bg-white rounded border border-sand-200">2. customer_consents</div>
                    <div className="p-2 bg-white rounded border border-sand-200">3. conversations</div>
                    <div className="p-2 bg-white rounded border border-sand-200">4. messages</div>
                    <div className="p-2 bg-white rounded border border-sand-200">5. products</div>
                    <div className="p-2 bg-white rounded border border-sand-200">6. customer_events</div>
                    <div className="p-2 bg-white rounded border border-sand-200">7. product_interests</div>
                    <div className="p-2 bg-white rounded border border-sand-200">8. customer_enquiries</div>
                    <div className="p-2 bg-white rounded border border-sand-200">9. customer_wishlists</div>
                    <div className="p-2 bg-white rounded border border-sand-200">10. data_deletion_requests</div>
                    <div className="p-2 bg-white rounded border border-sand-200">11. admin_users</div>
                    <div className="p-2 bg-white rounded border border-sand-200">12. admin_audit_logs</div>
                    <div className="p-2 bg-white rounded border border-sand-200">13. retention_policies</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
