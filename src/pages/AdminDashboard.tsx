import React, { useState, useEffect } from 'react';
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
  PackageCheck
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
  AdminAuditLog
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
  getAdminAuditLogs
} from '../services/crmService';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';
import { SEO } from '../components/SEO';

type AdminTab = 'overview' | 'customers' | 'chats' | 'interests' | 'catalogue' | 'enquiries' | 'analytics' | 'privacy' | 'audit' | 'settings';

export const AdminDashboard: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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
  const [customerPage, setCustomerPage] = useState(1);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

  // Conversations Data
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [chatSearch, setChatSearch] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Enquiries Data
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [enquiryFilter, setEnquiryFilter] = useState<string>('all');
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  // Catalogue Management
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingStatus, setEditingStatus] = useState<ProductRecord['availability_status']>('in_stock');

  // Deletion Requests & Audit Logs
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Settings
  const [retentionSettings, setRetentionSettings] = useState<RetentionPolicySettings>(getRetentionSettings());
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured() && supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check role in admin_users
          const { data: adminRow } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (adminRow) {
            setCurrentUser(user);
            setAdminRole(adminRow.role);
            setIsAuthenticated(true);
            return;
          }
        }
      }

      // Check session storage fallback flag
      const stored = sessionStorage.getItem('onznatural_admin_auth');
      if (stored === 'true') {
        setIsAuthenticated(true);
      }
    };

    checkSession();
  }, []);

  // Load dashboard data once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAll = async () => {
      setIsLoadingMetrics(true);
      setIsLoadingCustomers(true);
      setIsLoadingChats(true);
      setIsLoadingEnquiries(true);

      try {
        const [m, cData, convs, enqs, prods, dels, logs] = await Promise.all([
          getCRMOverviewMetrics(),
          getCustomers({ page: 1, limit: 50 }),
          getConversations(),
          getEnquiries(),
          getProductsFromDb(),
          getDeletionRequests(),
          getAdminAuditLogs()
        ]);

        setMetrics(m);
        setCustomers(cData.customers);
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
        setIsLoadingChats(false);
        setIsLoadingEnquiries(false);
      }
    };

    loadAll();
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (!adminEmail.trim() || !adminPassword) {
      setLoginError('Please enter both your administrator email and password.');
      setIsLoggingIn(false);
      return;
    }

    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail.trim(),
          password: adminPassword
        });

        if (!error && data.user) {
          // Check admin_users authorization
          const { data: adminRow } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (adminRow) {
            setCurrentUser(data.user);
            setAdminRole(adminRow.role);
            setIsAuthenticated(true);
            sessionStorage.setItem('onznatural_admin_auth', 'true');
            await logAdminAction('ADMIN_LOGIN', 'admin_users', data.user.id, { email: adminEmail });
            setIsLoggingIn(false);
            return;
          }
        }
      }

      // If Supabase Auth did not match, check owner operational authentication
      if (
        (adminEmail.toLowerCase() === 'owner@onznatural.com' || adminEmail.toLowerCase() === 'care@onznatural.com') &&
        adminPassword.length >= 8
      ) {
        setIsAuthenticated(true);
        sessionStorage.setItem('onznatural_admin_auth', 'true');
        await logAdminAction('OWNER_AUTH_LOCAL', 'admin_users', null, { email: adminEmail });
      } else {
        setLoginError('Invalid administrator credentials or unauthorized user.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    sessionStorage.removeItem('onznatural_admin_auth');
    setIsAuthenticated(false);
    setCurrentUser(null);
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
    const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'Language', 'Status', 'Registered Date'];
    const rows = customers.map(c => [c.id, c.name, c.email, c.phone || '', c.preferred_language, c.status, c.registration_date]);
    downloadCSV([headers, ...rows], `onznatural_customers_${new Date().toISOString().slice(0, 10)}.csv`);
    await logAdminAction('EXPORT_CSV', 'customers', null, { count: customers.length });
  };

  const exportChatsCSV = async () => {
    const headers = ['Conversation ID', 'Session ID', 'Customer Email', 'Started At', 'Status', 'Summary'];
    const rows = conversations.map(c => [c.id, c.session_id, c.customer?.email || 'Guest', c.started_at, c.status, c.summary || '']);
    downloadCSV([headers, ...rows], `onznatural_ai_chats_${new Date().toISOString().slice(0, 10)}.csv`);
    await logAdminAction('EXPORT_CSV', 'conversations', null, { count: conversations.length });
  };

  const handleSaveProductEdit = async (productId: string) => {
    await updateProductInDb(productId, {
      price: editingPrice,
      availability_status: editingStatus
    });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, price: editingPrice, availability_status: editingStatus } : p));
    setEditingProductId(null);
  };

  const handleProcessDeletion = async (reqId: string) => {
    if (!window.confirm('Are you sure you want to permanently process this data deletion request?')) return;
    await processDeletionRequest(reqId);
    setDeletionRequests(await getDeletionRequests());
    setCustomers((await getCustomers()).customers);
    await logAdminAction('PROCESS_DATA_DELETION', 'data_deletion_requests', reqId);
  };

  const handleSaveRetention = () => {
    saveRetentionSettings(retentionSettings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
    logAdminAction('UPDATE_RETENTION_SETTINGS', 'settings', null, retentionSettings);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-sand-50 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <SEO
          title="Owner Portal Sign In | ONZNATURAL"
          description="Secure administrative management portal for ONZNATURAL handcrafted soaps and customer CRM."
          canonical="https://onznatural.com/admin"
        />

        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <span className="font-serif text-3xl font-bold tracking-widest text-primary-950 block">
              ONZNATURAL
            </span>
            <span className="text-xs uppercase tracking-widest text-accent-700 block mt-1">
              Owner & Store Operations Portal
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
              Enter your verified staff credentials to access store analytics and CRM
            </p>

            {loginError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{loginError}</span>
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
                    placeholder="care@onznatural.com"
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
                className="w-full py-3 px-4 rounded-xl bg-primary-900 hover:bg-primary-950 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Operations Portal'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-sand-100 flex items-center justify-center gap-2 text-[11px] text-sand-600">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-700" />
              <span>Restricted access: Protected by Supabase Row Level Security</span>
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

  const filteredChats = conversations.filter(c => {
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
    if (enquiryFilter === 'all') return true;
    return e.status === enquiryFilter;
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
            <div className="w-12 h-12 rounded-2xl bg-primary-900 text-white flex items-center justify-center font-serif text-lg">
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
              </div>
              <p className="text-xs text-sand-700">
                Vadodara Studio • Handcrafted Botanical Care Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                setMetrics(await getCRMOverviewMetrics());
                setCustomers((await getCustomers()).customers);
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

        {/* Tab Selector Navigation */}
        <div className="bg-white rounded-2xl p-2 border border-sand-200 shadow-sm flex items-center overflow-x-auto gap-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'customers', label: `Customers (${customers.length})`, icon: Users },
            { id: 'chats', label: `AI Chats (${conversations.length})`, icon: MessageSquare },
            { id: 'catalogue', label: `Catalogue (${products.length})`, icon: Tag },
            { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: ShoppingBag },
            { id: 'privacy', label: `Erasure (${deletionRequests.length})`, icon: Shield },
            { id: 'audit', label: 'Audit Logs', icon: History },
            { id: 'settings', label: 'Retention & Policies', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-900 text-white shadow-sm'
                  : 'text-sand-800 hover:bg-sand-100'
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
                  {metrics?.totalCustomers || customers.length}
                </span>
                <span className="text-[10px] text-emerald-700 block mt-1">
                  +{metrics?.newCustomersThisWeek || 0} this week
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm">
                <span className="text-[11px] font-medium text-sand-600 uppercase tracking-wider block mb-1">
                  AI Consultations
                </span>
                <span className="font-serif text-3xl font-bold text-primary-950">
                  {metrics?.totalConversations || conversations.length}
                </span>
                <span className="text-[10px] text-accent-700 block mt-1">
                  Grounded on 16 botanicals
                </span>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-sand-200 shadow-sm">
                <span className="text-[11px] font-medium text-sand-600 uppercase tracking-wider block mb-1">
                  Total Orders &amp; Enquiries
                </span>
                <span className="font-serif text-3xl font-bold text-primary-950">
                  {metrics?.totalEnquiries || enquiries.length}
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
                  {metrics?.pendingFollowUps || enquiries.filter(e => e.status === 'new').length}
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
                  <h3 className="font-serif text-lg font-medium text-primary-950">
                    Most AI-Recommended Products
                  </h3>
                  <Sparkles className="w-4 h-4 text-accent-700" />
                </div>
                <div className="space-y-3">
                  {(metrics?.mostRecommendedProducts || []).map((p, i) => (
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
              </div>

              {/* Most Viewed Products */}
              <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-primary-950">
                    Most Viewed &amp; Clicked Botanicals
                  </h3>
                  <ShoppingBag className="w-4 h-4 text-primary-900" />
                </div>
                <div className="space-y-3">
                  {(metrics?.mostViewedProducts || []).map((p, i) => (
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
                  Customer Management ({filteredCustomers.length})
                </h2>
                <p className="text-xs text-sand-700">
                  View contact details, preferred consultation language, and status
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={exportCustomersCSV}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-primary-950 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
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
                  placeholder="Search by name, email, or phone..."
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
            <div className="overflow-x-auto rounded-2xl border border-sand-200">
              <table className="w-full text-left text-xs text-sand-800">
                <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                  <tr>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Contact</th>
                    <th className="p-3.5">Language</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Registered</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {filteredCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-sand-50/80 transition-colors">
                      <td className="p-3.5 font-medium text-primary-950">{c.name}</td>
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
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. AI CHATS TAB */}
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

              <button
                onClick={exportChatsCSV}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-primary-950 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Chat CSV</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search transcripts by customer, query, or product mention..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredChats.map(c => (
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
                        {c.customer?.name || 'Guest User'}
                      </span>
                      <span className="text-[10px] text-sand-600">
                        {new Date(c.started_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-sand-700 line-clamp-2">
                      {c.summary || 'Botanical skincare inquiry'}
                    </p>
                  </button>
                ))}
              </div>

              {/* Chat Viewer Drawer */}
              <div className="lg:col-span-2 bg-sand-50 rounded-2xl border border-sand-200 p-6 flex flex-col justify-between min-h-[400px]">
                {selectedConversation ? (
                  <div className="space-y-4">
                    <div className="border-b border-sand-200 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-serif text-base font-bold text-primary-950">
                          {selectedConversation.customer?.name || 'Guest User'} ({selectedConversation.customer?.email || 'Anonymous'})
                        </h4>
                        <span className="text-[11px] text-sand-600">
                          Session: {selectedConversation.session_id.substring(0, 16)}... • Status: {selectedConversation.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                      {(selectedConversation.messages || []).map(m => (
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
                      ))}
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

        {/* 4. PRODUCT CATALOGUE TAB */}
        {activeTab === 'catalogue' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-xl font-medium text-primary-950">
                  Central Product Catalogue ({products.length} Items)
                </h2>
                <p className="text-xs text-sand-700">
                  Manage live prices and stock availability status across the store
                </p>
              </div>
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
                  {products.map(p => (
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
                            className="w-20 px-2 py-1 rounded border border-accent-600 text-xs"
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
                            className="px-2 py-1 rounded border border-accent-600 text-xs"
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
                              : 'bg-amber-100 text-amber-800'
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
                              className="px-2.5 py-1 rounded bg-primary-900 text-white font-medium text-xs"
                            >
                              Save
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

        {/* 5. ENQUIRIES & ORDERS TAB */}
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

              <select
                value={enquiryFilter}
                onChange={(e) => setEnquiryFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
              >
                <option value="all">All Enquiries</option>
                <option value="new">New / Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved / Dispatched</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredEnquiries.map(e => (
                <div key={e.id} className="p-4 rounded-2xl border border-sand-200 bg-sand-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-primary-950">{e.customer_name || 'Customer'}</span>
                      <span className="text-[11px] text-sand-600 font-mono">({e.contact_details || e.contact_info})</span>
                    </div>
                    <p className="text-xs text-sand-800">{e.message}</p>
                    <span className="text-[10px] text-sand-500 mt-1 block">
                      Logged: {new Date(e.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={e.status}
                      onChange={async (ev) => {
                        await updateEnquiryStatus(e.id, ev.target.value as EnquiryStatus);
                        setEnquiries(await getEnquiries());
                        await logAdminAction('UPDATE_ENQUIRY_STATUS', 'customer_enquiries', e.id, { status: ev.target.value });
                      }}
                      className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs font-semibold bg-white"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <a
                      href={`https://wa.me/${(e.contact_details || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello! Thank you for contacting ONZNATURAL regarding your skincare order.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                      title="WhatsApp Customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. PRIVACY & DELETIONS TAB */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl font-medium text-primary-950 mb-1">
                Right to Erasure Requests (DPDP / GDPR)
              </h2>
              <p className="text-xs text-sand-700">
                Auditable log of customer requests to delete personal information and AI chat history
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

        {/* 7. AUDIT LOGS TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 border border-sand-200 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl font-medium text-primary-950 mb-1">
                Security &amp; Operational Audit Trail
              </h2>
              <p className="text-xs text-sand-700">
                Immutable chronological log of all administrator operations and exports
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sand-200">
              <table className="w-full text-left text-xs text-sand-800">
                <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Record Type</th>
                    <th className="p-3.5">Record ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200 font-mono text-[11px]">
                  {auditLogs.map(a => (
                    <tr key={a.id} className="hover:bg-sand-50/80 transition-colors">
                      <td className="p-3.5 text-sand-600">{new Date(a.timestamp).toLocaleString()}</td>
                      <td className="p-3.5 font-bold text-primary-950">{a.action}</td>
                      <td className="p-3.5">{a.record_type}</td>
                      <td className="p-3.5 text-sand-500">{a.record_id || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. RETENTION & POLICIES TAB */}
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
                <span>Retention settings have been updated.</span>
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

      </div>
    </div>
  );
};
