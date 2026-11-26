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
  EyeOff,
  Heart,
  Check,
  X,
  Calendar,
  Layers,
  ArrowUpRight,
  Database,
  Plus,
  SlidersHorizontal,
  Edit2
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
  createProductInDb,
  deleteProductFromDb,
  logAdminAction,
  getAdminAuditLogs,
  getCustomerEvents,
  getProductInterests
} from '../services/crmService';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { useProductCatalog } from '../context/ProductContext';
import { VERIFIED_PRODUCTS } from '../data/productKnowledge';
import { SEO } from '../components/SEO';
import { checkRateLimit, recordFailedAttempt, resetRateLimit, sanitizeInput } from '../utils/security';

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
  const { 
    updateProduct: updateContextProduct, 
    createProduct: createContextProduct, 
    deleteProduct: deleteContextProduct, 
    refreshProducts: refreshContextProducts 
  } = useProductCatalog();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingSession, setIsCheckingSession] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminRole, setAdminRole] = useState<string>('store_manager');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
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
  const [chatStatusFilter, setChatStatusFilter] = useState<string>('all');
  const [chatPage, setChatPage] = useState<number>(1);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Live Sync & Error State
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);

  // Enquiries Data
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [enquiryFilter, setEnquiryFilter] = useState<string>('all');
  const [enquirySearch, setEnquirySearch] = useState('');
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);

  // Catalogue Management
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [catalogueCategoryFilter, setCatalogueCategoryFilter] = useState<string>('all');
  const [catalogueStatusFilter, setCatalogueStatusFilter] = useState<string>('all');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState<number>(0);
  const [editingDiscountPrice, setEditingDiscountPrice] = useState<number | undefined>(undefined);
  const [editingStock, setEditingStock] = useState<number>(50);
  const [editingStatus, setEditingStatus] = useState<ProductRecord['availability_status']>('in_stock');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [catalogueSuccessMsg, setCatalogueSuccessMsg] = useState<string | null>(null);

  // Full Edit Modal State
  const [fullEditProduct, setFullEditProduct] = useState<ProductRecord | null>(null);
  const [isSavingFullProduct, setIsSavingFullProduct] = useState(false);

  // Add New Product Modal State
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    id: '',
    name: '',
    category: 'Handmade Cold Process Soap',
    net_weight_or_vol: '100 gm / 3.52 oz',
    mrp: 99,
    discount_price: 89,
    stock_quantity: 50,
    availability_status: 'in_stock' as ProductRecord['availability_status'],
    short_description: '',
    full_description: '',
    ingredients: '',
    image: '/images/products/kesuda-palash-soap.webp',
    benefits: ['Handcrafted with cold-process botanical oils', 'Preserves 100% natural vegetable glycerin']
  });

  // Deletion Requests & Audit Logs
  const [deletionRequests, setDeletionRequests] = useState<DataDeletionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditPage, setAuditPage] = useState<number>(1);

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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

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

  const fetchDashboardData = async (silent = false) => {
    if (!silent) {
      setIsLoadingMetrics(true);
      setIsLoadingCustomers(true);
      setIsLoadingEvents(true);
      setIsLoadingInterests(true);
      setIsLoadingChats(true);
      setIsLoadingEnquiries(true);
    } else {
      setIsRefreshing(true);
    }
    setDataLoadError(null);

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
      // Keep selectedConversation synced with latest messages
      setSelectedConversation(prev => {
        if (!prev) return null;
        return convs.find(c => c.id === prev.id) || prev;
      });
      setEnquiries(enqs);
      setProducts(prods);
      setDeletionRequests(dels);
      setAuditLogs(logs);
      setLastSyncedAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn('Dashboard data fetch error:', err);
      setDataLoadError(err?.message || 'Unable to sync latest data from Supabase.');
    } finally {
      setIsLoadingMetrics(false);
      setIsLoadingCustomers(false);
      setIsLoadingEvents(false);
      setIsLoadingInterests(false);
      setIsLoadingChats(false);
      setIsLoadingEnquiries(false);
      setIsRefreshing(false);
    }
  };

  // Load all dashboard operational data once authenticated + subscribe to live changes
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchDashboardData(false);

    // Live polling fallback every 25s
    const intervalId = setInterval(() => {
      fetchDashboardData(true);
    }, 25000);

    // Supabase Realtime listener for live AI chats, enquiries, and audit logs
    let channel: any = null;
    if (supabase) {
      channel = supabase
        .channel('admin-live-history')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchDashboardData(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => fetchDashboardData(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_enquiries' }, () => fetchDashboardData(true))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_audit_logs' }, () => fetchDashboardData(true))
        .subscribe();
    }

    return () => {
      clearInterval(intervalId);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAuthenticated]);

  // Strict Supabase Authentication with Rate Limiting & Zero Plaintext Secrets
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // 1. Rate Limiting Check (Anti Brute-Force)
    const rl = checkRateLimit('admin_login', 5, 120000, 180000);
    if (!rl.allowed) {
      setLoginError(`Security lockout: Too many failed administrator login attempts. Please wait ${rl.remainingSeconds} seconds.`);
      return;
    }

    const cleanEmail = sanitizeInput(adminEmail).toLowerCase();

    if (!cleanEmail || !adminPassword) {
      setLoginError('Please enter both your administrator email and password.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setLoginError('Authentication service is currently offline. Please check your Supabase connection.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: adminPassword
      });

      if (!error && data?.user) {
        // Verify administrator role in admin_users table
        const { data: adminRow, error: adminCheckError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle();

        if (adminRow && !adminCheckError) {
          resetRateLimit('admin_login');
          setCurrentUser(data.user);
          setAdminRole(adminRow.role || 'super_admin');
          setIsAuthenticated(true);
          await logAdminAction('ADMIN_LOGIN', 'admin_users', data.user.id, { 
            email: cleanEmail, 
            role: adminRow.role 
          });
          setIsLoggingIn(false);
          return;
        } else {
          await supabase.auth.signOut();
          recordFailedAttempt('admin_login', 5, 120000, 180000);
          setLoginError('Access Denied: Your account is not authorized as an ONZNATURAL administrator.');
          setIsLoggingIn(false);
          return;
        }
      }

      recordFailedAttempt('admin_login', 5, 120000, 180000);
      setLoginError(error?.message || 'Invalid administrator email or password.');
    } catch (err: any) {
      recordFailedAttempt('admin_login', 5, 120000, 180000);
      setLoginError('Authentication encountered an unexpected issue.');
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
      const existing = products.find(p => p.id === productId);
      const oldValue = existing
        ? {
            mrp: existing.mrp,
            discount_price: existing.discount_price,
            stock_quantity: existing.stock_quantity,
            availability_status: existing.availability_status
          }
        : null;

      const updates = {
        mrp: editingPrice,
        price: editingDiscountPrice && editingDiscountPrice < editingPrice ? editingDiscountPrice : editingPrice,
        discount_price: editingDiscountPrice,
        stock_quantity: editingStock,
        availability_status: editingStatus
      };

      await updateProductInDb(productId, updates);

      // Synchronize in-memory React product catalog across entire website
      await updateContextProduct(productId, updates);

      await logAdminAction('UPDATE_PRODUCT_INLINE', 'products', productId, {
        old_value: oldValue,
        new_value: {
          mrp: updates.mrp,
          discount_price: updates.discount_price,
          stock_quantity: updates.stock_quantity,
          availability_status: updates.availability_status
        }
      });

      setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
      setEditingProductId(null);
      setCatalogueSuccessMsg(`✓ Saved changes for ${productId} to Supabase & live website!`);
      setTimeout(() => setCatalogueSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Could not save product: ${err.message || 'Unknown database error'}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleSaveFullProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullEditProduct) return;
    setIsSavingFullProduct(true);
    try {
      const updates = {
        name: fullEditProduct.name || fullEditProduct.product_name,
        product_name: fullEditProduct.name || fullEditProduct.product_name,
        category: fullEditProduct.category,
        net_weight_or_vol: fullEditProduct.net_weight_or_vol || fullEditProduct.weight_or_volume,
        weight_or_volume: fullEditProduct.net_weight_or_vol || fullEditProduct.weight_or_volume,
        mrp: Number(fullEditProduct.mrp || fullEditProduct.price || 99),
        price: fullEditProduct.discount_price && fullEditProduct.discount_price < (fullEditProduct.mrp || fullEditProduct.price) ? Number(fullEditProduct.discount_price) : Number(fullEditProduct.mrp || fullEditProduct.price || 99),
        discount_price: fullEditProduct.discount_price ? Number(fullEditProduct.discount_price) : undefined,
        stock_quantity: Number(fullEditProduct.stock_quantity !== undefined ? fullEditProduct.stock_quantity : 50),
        availability_status: fullEditProduct.availability_status,
        short_description: fullEditProduct.short_description,
        full_description: fullEditProduct.full_description || fullEditProduct.description,
        description: fullEditProduct.full_description || fullEditProduct.description,
        ingredients: fullEditProduct.ingredients,
        image: fullEditProduct.image || fullEditProduct.image_url,
        image_url: fullEditProduct.image || fullEditProduct.image_url,
        is_featured: fullEditProduct.is_featured
      };

      await updateProductInDb(fullEditProduct.id, updates);
      await updateContextProduct(fullEditProduct.id, updates);

      setProducts(prev => prev.map(p => p.id === fullEditProduct.id ? { ...p, ...updates } : p));
      setFullEditProduct(null);
      setCatalogueSuccessMsg(`✓ Successfully updated "${updates.name}" in Supabase & live website!`);
      setTimeout(() => setCatalogueSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Failed to save product: ${err.message}`);
    } finally {
      setIsSavingFullProduct(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductForm.name.trim()) {
      alert('Please enter a product name');
      return;
    }
    const cleanId = newProductForm.id.trim() || newProductForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (products.some(p => p.id === cleanId)) {
      alert(`A product with ID "${cleanId}" already exists. Please choose a distinct ID or title.`);
      return;
    }

    setIsCreatingProduct(true);
    try {
      const payload = {
        ...newProductForm,
        id: cleanId,
        name: newProductForm.name,
        product_name: newProductForm.name,
        slug: cleanId,
        weight_or_volume: newProductForm.net_weight_or_vol,
        net_weight_or_vol: newProductForm.net_weight_or_vol,
        description: newProductForm.full_description,
        full_description: newProductForm.full_description,
        image_url: newProductForm.image,
        three_main_benefits: newProductForm.benefits.slice(0, 3),
        price: newProductForm.discount_price && newProductForm.discount_price < newProductForm.mrp ? newProductForm.discount_price : newProductForm.mrp
      };

      await createProductInDb(payload);
      await createContextProduct(payload);

      const refreshed = await getProductsFromDb();
      setProducts(refreshed);
      setIsAddProductModalOpen(false);
      setNewProductForm({
        id: '',
        name: '',
        category: 'Handmade Cold Process Soap',
        net_weight_or_vol: '100 gm / 3.52 oz',
        mrp: 99,
        discount_price: 89,
        stock_quantity: 50,
        availability_status: 'in_stock',
        short_description: '',
        full_description: '',
        ingredients: '',
        image: '/images/products/kesuda-palash-soap.webp',
        benefits: ['Handcrafted with cold-process botanical oils', 'Preserves 100% natural vegetable glycerin']
      });
      setCatalogueSuccessMsg(`✓ Created new product "${newProductForm.name}" in database!`);
      setTimeout(() => setCatalogueSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Failed to create product: ${err.message}`);
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}" (${productId}) from the catalogue and database?`)) {
      return;
    }
    try {
      await deleteProductFromDb(productId);
      await deleteContextProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCatalogueSuccessMsg(`✓ Removed "${productName}" from database.`);
      setTimeout(() => setCatalogueSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  const handleRefreshCatalogue = async () => {
    setIsSavingProduct(true);
    try {
      const refreshed = await getProductsFromDb();
      setProducts(refreshed);
      await refreshContextProducts();
      setCatalogueSuccessMsg(`✓ Synchronized ${refreshed.length} products with live Supabase database!`);
      setTimeout(() => setCatalogueSuccessMsg(null), 3000);
    } catch (e: any) {
      alert(`Could not sync catalogue: ${e.message}`);
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
                    type={showAdminPassword ? 'text' : 'password'}
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600 bg-sand-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-500 hover:text-primary-950 p-1"
                    aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-primary w-full py-3 px-4 rounded-xl text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
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
    if (chatStatusFilter !== 'all' && c.status !== chatStatusFilter) {
      return false;
    }
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

  const CHATS_PER_PAGE = 10;
  const totalChatPages = Math.max(1, Math.ceil(filteredChats.length / CHATS_PER_PAGE));
  const safeChatPage = Math.min(chatPage, totalChatPages);
  const paginatedChats = filteredChats.slice((safeChatPage - 1) * CHATS_PER_PAGE, safeChatPage * CHATS_PER_PAGE);

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
    const matchesStatus = catalogueStatusFilter === 'all' || p.availability_status === catalogueStatusFilter;
    const q = catalogueSearch.toLowerCase().trim();
    const nameMatch = (p.name && p.name.toLowerCase().includes(q)) || (p.product_name && p.product_name.toLowerCase().includes(q));
    const idMatch = p.id.toLowerCase().includes(q);
    const ingMatch = p.ingredients && p.ingredients.toLowerCase().includes(q);
    const matchesSearch = !q || nameMatch || idMatch || ingMatch;
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const filteredAudit = auditLogs.filter(a => {
    if (!auditSearch) return true;
    const q = auditSearch.toLowerCase();
    return (
      a.action.toLowerCase().includes(q) ||
      (a.target_entity || a.record_type || '').toLowerCase().includes(q) ||
      ((a.target_id || a.record_id) && (a.target_id || a.record_id || '').toLowerCase().includes(q)) ||
      (a.admin_email && a.admin_email.toLowerCase().includes(q))
    );
  });

  const AUDIT_PER_PAGE = 15;
  const totalAuditPages = Math.max(1, Math.ceil(filteredAudit.length / AUDIT_PER_PAGE));
  const safeAuditPage = Math.min(auditPage, totalAuditPages);
  const paginatedAudit = filteredAudit.slice((safeAuditPage - 1) * AUDIT_PER_PAGE, safeAuditPage * AUDIT_PER_PAGE);

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
            {lastSyncedAt && (
              <span className="hidden sm:inline-block text-[11px] text-sand-500 font-mono">
                Synced {lastSyncedAt}
              </span>
            )}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-sand-200 text-sand-700 hover:bg-sand-100 transition-colors disabled:opacity-50"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary-900' : ''}`} />
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

        {dataLoadError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{dataLoadError}</span>
            </div>
            <button
              type="button"
              onClick={() => fetchDashboardData(false)}
              className="px-3 py-1.5 rounded-lg bg-red-700 text-white font-semibold hover:bg-red-800 shrink-0"
            >
              Retry Sync
            </button>
          </div>
        )}

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

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={chatStatusFilter}
                  onChange={(e) => { setChatStatusFilter(e.target.value); setChatPage(1); }}
                  className="px-3 py-1.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>

                <select
                  value={chatDateFilter}
                  onChange={(e) => { setChatDateFilter(e.target.value); setChatPage(1); }}
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
                onChange={(e) => { setChatSearch(e.target.value); setChatPage(1); }}
                placeholder="Search transcripts by customer, query, or botanical mention..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:outline-none focus:ring-2 focus:ring-accent-600"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-3">
                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                  {paginatedChats.length === 0 ? (
                    <div className="p-8 text-center text-xs text-sand-500 border border-dashed border-sand-200 rounded-2xl">
                      No consultation sessions found.
                    </div>
                  ) : (
                    paginatedChats.map(c => (
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

                {totalChatPages > 1 && (
                  <div className="flex items-center justify-between pt-2 border-t border-sand-200 text-xs">
                    <button
                      type="button"
                      disabled={safeChatPage <= 1}
                      onClick={() => setChatPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-sand-200 disabled:opacity-40 hover:bg-sand-100"
                    >
                      Prev
                    </button>
                    <span className="text-sand-600 font-mono text-[11px]">
                      Page {safeChatPage} / {totalChatPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeChatPage >= totalChatPages}
                      onClick={() => setChatPage(p => Math.min(totalChatPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-sand-200 disabled:opacity-40 hover:bg-sand-100"
                    >
                      Next
                    </button>
                  </div>
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
                        [...selectedConversation.messages]
                          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                          .map(m => (
                            <div
                              key={m.id}
                              className={`p-3.5 rounded-2xl text-xs max-w-xl ${
                                m.sender === 'ai'
                                  ? 'bg-white border border-sand-200 mr-auto text-primary-950'
                                  : 'bg-primary-900 text-white ml-auto'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4 mb-1">
                                <span className="text-[10px] uppercase font-bold opacity-80">
                                  {m.sender === 'ai' ? 'ONZNATURAL Botanical AI' : 'Customer'}
                                </span>
                                <span className="text-[10px] font-mono opacity-65">
                                  {new Date(m.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="whitespace-pre-line">{m.message_content}</p>
                              {m.metadata && Object.keys(m.metadata).length > 0 && (
                                <div className="mt-1.5 text-[10px] font-mono opacity-65">
                                  {m.metadata.model && <span className="mr-2">model: {m.metadata.model}</span>}
                                  {m.metadata.source && <span className="mr-2">source: {m.metadata.source}</span>}
                                  {m.metadata.error && <span className="text-rose-400">err: {m.metadata.error}</span>}
                                </div>
                              )}
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

        {/* 6. PRODUCT CATALOGUE TAB & LIVE DATABASE INVENTORY MANAGER */}
        {activeTab === 'catalogue' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sand-200 shadow-sm space-y-6">
            {/* Header & Main Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-sand-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary-950">
                    Catalogue &amp; Live Inventory ({filteredCatalogue.length} Products)
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    <Database className="w-3 h-3 text-emerald-600" />
                    <span>Supabase Connected</span>
                  </span>
                </div>
                <p className="text-xs text-sand-700 mt-1">
                  Edit stock quantities, MRP, discount prices, and botanical details. Changes synchronize immediately across the live store.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRefreshCatalogue}
                  disabled={isSavingProduct}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-sand-300 text-primary-950 hover:bg-sand-100 text-xs font-semibold shadow-2xs transition-colors"
                  title="Synchronize all products directly from Supabase PostgreSQL"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSavingProduct ? 'animate-spin text-accent-600' : 'text-sand-600'}`} />
                  <span>Sync from DB</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddProductModalOpen(true)}
                  className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 text-accent-400" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Success Feedback Alert */}
            {catalogueSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{catalogueSuccessMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCatalogueSuccessMsg(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-[10px] text-sand-600 font-semibold uppercase tracking-wider block">Total Items</span>
                <span className="text-xl font-serif font-bold text-primary-950">{products.length}</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider block">In Stock</span>
                <span className="text-xl font-serif font-bold text-emerald-900">
                  {products.filter(p => p.availability_status === 'in_stock').length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="text-[10px] text-amber-800 font-semibold uppercase tracking-wider block">Low Stock</span>
                <span className="text-xl font-serif font-bold text-amber-900">
                  {products.filter(p => p.availability_status === 'low_stock').length}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200">
                <span className="text-[10px] text-rose-800 font-semibold uppercase tracking-wider block">Out of Stock</span>
                <span className="text-xl font-serif font-bold text-rose-900">
                  {products.filter(p => p.availability_status === 'out_of_stock' || p.availability_status === 'discontinued').length}
                </span>
              </div>
            </div>

            {/* Search and Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sand-500" />
                <input
                  type="text"
                  value={catalogueSearch}
                  onChange={(e) => setCatalogueSearch(e.target.value)}
                  placeholder="Search products by title, ID, or key ingredient..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white focus:outline-none focus:border-primary-800 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={catalogueCategoryFilter}
                  onChange={(e) => setCatalogueCategoryFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50 font-medium text-sand-800 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Handmade Cold Process Soap">Cold Process Soaps</option>
                  <option value="Body Care">Body Care &amp; Lotions</option>
                  <option value="Face &amp; Body Wash">Face &amp; Body Washes</option>
                  <option value="Face Care">Face Creams</option>
                  <option value="Hand Wash">Hand Washes</option>
                  <option value="Lip Care">Lip Balms</option>
                </select>

                <select
                  value={catalogueStatusFilter}
                  onChange={(e) => setCatalogueStatusFilter(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-sand-300 text-xs bg-sand-50/50 font-medium text-sand-800 focus:bg-white focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto rounded-2xl border border-sand-200">
              <table className="w-full text-left text-xs text-sand-800">
                <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                  <tr>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Net Wt</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5">Price &amp; MRP</th>
                    <th className="p-3.5">Availability</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200">
                  {filteredCatalogue.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-sand-500 text-xs">
                        No products match your search or filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCatalogue.map(p => (
                      <tr key={p.id} className="hover:bg-sand-50/80 transition-colors">
                        {/* Product Info */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || p.image_url}
                              alt={p.name || p.product_name}
                              className="w-11 h-11 object-cover rounded-xl bg-sand-100 border border-sand-200 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-primary-950 block">
                                  {p.name || p.product_name}
                                </span>
                                {p.is_featured && (
                                  <span className="px-1.5 py-0.2 rounded bg-gold-100 text-gold-800 text-[9px] font-bold">
                                    Featured
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-sand-500 font-mono block">
                                ID: {p.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-sand-100 text-sand-800 text-[10px] font-medium border border-sand-200 whitespace-nowrap">
                            {p.category}
                          </span>
                        </td>

                        {/* Net Weight */}
                        <td className="p-3.5 font-medium text-sand-700 whitespace-nowrap">
                          {p.net_weight_or_vol || p.weight_or_volume}
                        </td>

                        {/* Stock Units */}
                        <td className="p-3.5">
                          {editingProductId === p.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={editingStock}
                                onChange={(e) => setEditingStock(Number(e.target.value))}
                                className="w-16 px-2 py-1 rounded border border-accent-600 text-xs bg-white font-mono font-bold"
                              />
                              <span className="text-[10px] text-sand-500">units</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 font-mono">
                              <span className={`font-bold ${
                                (p.stock_quantity ?? 50) <= 5
                                  ? 'text-rose-700'
                                  : (p.stock_quantity ?? 50) <= 15
                                  ? 'text-amber-700'
                                  : 'text-primary-950'
                              }`}>
                                {p.stock_quantity ?? 50}
                              </span>
                              <span className="text-[10px] text-sand-500">units</span>
                            </div>
                          )}
                        </td>

                        {/* Price (MRP & Sale) */}
                        <td className="p-3.5">
                          {editingProductId === p.id ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-sand-500 w-8">MRP:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(Number(e.target.value))}
                                  className="w-16 px-2 py-0.5 rounded border border-accent-600 text-xs bg-white font-bold"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] text-sand-500 w-8">Sale:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={editingDiscountPrice !== undefined ? editingDiscountPrice : ''}
                                  onChange={(e) => setEditingDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                                  placeholder="None"
                                  className="w-16 px-2 py-0.5 rounded border border-sand-300 text-xs bg-white text-emerald-800 font-bold"
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              {p.discount_price && p.discount_price < (p.mrp || p.price) ? (
                                <div className="space-y-0.5">
                                  <div className="font-bold text-emerald-800 text-sm">₹{p.discount_price}</div>
                                  <div className="text-[10px] line-through text-sand-500">MRP: ₹{p.mrp || p.price}</div>
                                </div>
                              ) : (
                                <div className="font-bold text-primary-950 text-sm">
                                  ₹{p.mrp || p.price}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Availability Status */}
                        <td className="p-3.5">
                          {editingProductId === p.id ? (
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value as any)}
                              className="px-2 py-1 rounded border border-accent-600 text-xs bg-white font-medium"
                            >
                              <option value="in_stock">In Stock</option>
                              <option value="low_stock">Low Stock</option>
                              <option value="out_of_stock">Out of Stock</option>
                              <option value="discontinued">Discontinued</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${
                              p.availability_status === 'in_stock'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : p.availability_status === 'low_stock'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : p.availability_status === 'out_of_stock'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-sand-200 text-sand-800 border border-sand-300'
                            }`}>
                              {p.availability_status?.replace('_', ' ') || 'in stock'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right whitespace-nowrap">
                          {editingProductId === p.id ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSaveProductEdit(p.id)}
                                disabled={isSavingProduct}
                                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 disabled:opacity-50 shadow-xs"
                              >
                                {isSavingProduct ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingProductId(null)}
                                className="px-2.5 py-1.5 rounded-lg border border-sand-300 text-sand-700 text-xs hover:bg-sand-100"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProductId(p.id);
                                  setEditingPrice(p.mrp || p.price);
                                  setEditingDiscountPrice(p.discount_price);
                                  setEditingStock(p.stock_quantity !== undefined ? p.stock_quantity : 50);
                                  setEditingStatus(p.availability_status || 'in_stock');
                                }}
                                className="p-1.5 rounded-lg border border-sand-300 text-primary-950 hover:bg-sand-100 transition-colors"
                                title="Quick edit price & stock"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setFullEditProduct(p)}
                                className="p-1.5 rounded-lg border border-sand-300 text-primary-950 hover:bg-sand-100 transition-colors"
                                title="Edit all details (Descriptions, Ingredients, Weight, Images)"
                              >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name || p.product_name)}
                                className="p-1.5 rounded-lg border border-sand-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-colors"
                                title="Delete product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MODAL 1: FULL PRODUCT DETAILS EDITOR */}
            {/* ------------------------------------------------------------- */}
            {fullEditProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
                <div 
                  className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 my-8 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-sand-200 mb-6">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary-950">
                        Edit Product: {fullEditProduct.name || fullEditProduct.product_name}
                      </h3>
                      <p className="text-xs text-sand-500 font-mono mt-0.5">
                        Product ID: {fullEditProduct.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFullEditProduct(null)}
                      className="p-1.5 rounded-full hover:bg-sand-100 text-sand-500 hover:text-sand-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveFullProduct} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Product Name / Title
                        </label>
                        <input
                          type="text"
                          required
                          value={fullEditProduct.name || fullEditProduct.product_name}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, name: e.target.value, product_name: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Category
                        </label>
                        <select
                          value={fullEditProduct.category}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        >
                          <option value="Handmade Cold Process Soap">Handmade Cold Process Soap</option>
                          <option value="Body Care">Body Care</option>
                          <option value="Face &amp; Body Wash">Face &amp; Body Wash</option>
                          <option value="Face Care">Face Care</option>
                          <option value="Hand Wash">Hand Wash</option>
                          <option value="Lip Care">Lip Care</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={fullEditProduct.mrp || fullEditProduct.price}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, mrp: Number(e.target.value), price: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Discount / Sale Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={fullEditProduct.discount_price !== undefined ? fullEditProduct.discount_price : ''}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, discount_price: e.target.value ? Number(e.target.value) : undefined })}
                          placeholder="Optional"
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-bold text-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Stock Quantity (Units)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={fullEditProduct.stock_quantity !== undefined ? fullEditProduct.stock_quantity : 50}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, stock_quantity: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Net Weight / Volume
                        </label>
                        <input
                          type="text"
                          value={fullEditProduct.net_weight_or_vol || fullEditProduct.weight_or_volume}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, net_weight_or_vol: e.target.value, weight_or_volume: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Stock Availability Status
                        </label>
                        <select
                          value={fullEditProduct.availability_status}
                          onChange={(e) => setFullEditProduct({ ...fullEditProduct, availability_status: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                          <option value="discontinued">Discontinued</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={fullEditProduct.image || fullEditProduct.image_url}
                        onChange={(e) => setFullEditProduct({ ...fullEditProduct, image: e.target.value, image_url: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Short Tagline Description
                      </label>
                      <input
                        type="text"
                        value={fullEditProduct.short_description || ''}
                        onChange={(e) => setFullEditProduct({ ...fullEditProduct, short_description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Full Product Description
                      </label>
                      <textarea
                        rows={3}
                        value={fullEditProduct.full_description || fullEditProduct.description || ''}
                        onChange={(e) => setFullEditProduct({ ...fullEditProduct, full_description: e.target.value, description: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Key Ingredients List
                      </label>
                      <textarea
                        rows={2}
                        value={fullEditProduct.ingredients || ''}
                        onChange={(e) => setFullEditProduct({ ...fullEditProduct, ingredients: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="modal-featured-checkbox"
                        checked={Boolean(fullEditProduct.is_featured)}
                        onChange={(e) => setFullEditProduct({ ...fullEditProduct, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-primary-900 border-sand-300"
                      />
                      <label htmlFor="modal-featured-checkbox" className="text-xs font-semibold text-sand-800 cursor-pointer">
                        Feature this product prominently on homepage
                      </label>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200">
                      <button
                        type="button"
                        onClick={() => setFullEditProduct(null)}
                        className="px-4 py-2.5 rounded-xl border border-sand-300 text-sand-700 text-xs font-semibold hover:bg-sand-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingFullProduct}
                        className="btn-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md disabled:opacity-50"
                      >
                        {isSavingFullProduct ? 'Saving to Database...' : 'Save All Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* MODAL 2: ADD NEW PRODUCT TO STORE & DATABASE */}
            {/* ------------------------------------------------------------- */}
            {isAddProductModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-botanical-950/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
                <div 
                  className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-sand-200 my-8 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-sand-200 mb-6">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-primary-950">
                        Add New Botanical Product
                      </h3>
                      <p className="text-xs text-sand-500 mt-0.5">
                        Add a new handcrafted skincare item to your database catalogue
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddProductModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-sand-100 text-sand-500 hover:text-sand-800"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProductForm.name}
                          onChange={(e) => setNewProductForm({ 
                            ...newProductForm, 
                            name: e.target.value,
                            id: newProductForm.id || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                          })}
                          placeholder="e.g. Saffron &amp; Sandalwood Soap"
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Product ID / Slug *
                        </label>
                        <input
                          type="text"
                          required
                          value={newProductForm.id}
                          onChange={(e) => setNewProductForm({ ...newProductForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') })}
                          placeholder="e.g. saffron-sandalwood-soap"
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Category
                        </label>
                        <select
                          value={newProductForm.category}
                          onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        >
                          <option value="Handmade Cold Process Soap">Handmade Cold Process Soap</option>
                          <option value="Body Care">Body Care</option>
                          <option value="Face &amp; Body Wash">Face &amp; Body Wash</option>
                          <option value="Face Care">Face Care</option>
                          <option value="Hand Wash">Hand Wash</option>
                          <option value="Lip Care">Lip Care</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Net Weight / Volume
                        </label>
                        <input
                          type="text"
                          required
                          value={newProductForm.net_weight_or_vol}
                          onChange={(e) => setNewProductForm({ ...newProductForm, net_weight_or_vol: e.target.value })}
                          placeholder="e.g. 100 gm / 3.52 oz"
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          MRP (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={newProductForm.mrp}
                          onChange={(e) => setNewProductForm({ ...newProductForm, mrp: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Discount / Sale Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProductForm.discount_price}
                          onChange={(e) => setNewProductForm({ ...newProductForm, discount_price: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-bold text-emerald-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                          Initial Stock Quantity
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={newProductForm.stock_quantity}
                          onChange={(e) => setNewProductForm({ ...newProductForm, stock_quantity: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Image Path or URL
                      </label>
                      <input
                        type="text"
                        required
                        value={newProductForm.image}
                        onChange={(e) => setNewProductForm({ ...newProductForm, image: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={newProductForm.short_description}
                        onChange={(e) => setNewProductForm({ ...newProductForm, short_description: e.target.value })}
                        placeholder="Brief summary for product card"
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Full Description
                      </label>
                      <textarea
                        rows={2}
                        value={newProductForm.full_description}
                        onChange={(e) => setNewProductForm({ ...newProductForm, full_description: e.target.value })}
                        placeholder="Detailed botanical benefits and formulation story"
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-sand-700 uppercase tracking-wider mb-1">
                        Ingredients
                      </label>
                      <textarea
                        rows={2}
                        value={newProductForm.ingredients}
                        onChange={(e) => setNewProductForm({ ...newProductForm, ingredients: e.target.value })}
                        placeholder="Coconut Oil, Kokum Butter, Essential Oils, etc."
                        className="w-full px-3 py-2 rounded-xl border border-sand-300 text-xs bg-sand-50/50 focus:bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-sand-200">
                      <button
                        type="button"
                        onClick={() => setIsAddProductModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl border border-sand-300 text-sand-700 text-xs font-semibold hover:bg-sand-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingProduct}
                        className="btn-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md disabled:opacity-50"
                      >
                        {isCreatingProduct ? 'Creating in Database...' : 'Create &amp; Publish Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

            {paginatedAudit.length === 0 ? (
              <div className="text-center py-12 text-sand-500 text-xs border border-dashed border-sand-200 rounded-2xl">
                No audit log entries recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-sand-200">
                  <table className="w-full text-left text-xs text-sand-800">
                    <thead className="bg-sand-100 text-primary-950 uppercase text-[10px] tracking-wider border-b border-sand-200">
                      <tr>
                        <th className="p-3.5">Timestamp</th>
                        <th className="p-3.5">Admin</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Target Entity</th>
                        <th className="p-3.5">Target ID</th>
                        <th className="p-3.5">Details / Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-200 font-mono text-[11px]">
                      {paginatedAudit.map(a => (
                        <tr key={a.id} className="hover:bg-sand-50/80 transition-colors">
                          <td className="p-3.5 text-sand-600 whitespace-nowrap">{new Date(a.created_at || a.timestamp).toLocaleString()}</td>
                          <td className="p-3.5 text-sand-700">{a.admin_email || 'admin'}</td>
                          <td className="p-3.5 font-bold text-primary-950">{a.action}</td>
                          <td className="p-3.5">{a.target_entity || a.record_type}</td>
                          <td className="p-3.5 text-sand-500">{a.target_id || a.record_id || 'N/A'}</td>
                          <td className="p-3.5 text-sand-600 text-[10px] font-sans max-w-xs break-words">
                            {(a.details || a.metadata) ? JSON.stringify(a.details || a.metadata) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalAuditPages > 1 && (
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      disabled={safeAuditPage <= 1}
                      onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-sand-200 disabled:opacity-40 hover:bg-sand-100"
                    >
                      Prev
                    </button>
                    <span className="text-sand-600 font-mono text-[11px]">
                      Page {safeAuditPage} / {totalAuditPages}
                    </span>
                    <button
                      type="button"
                      disabled={safeAuditPage >= totalAuditPages}
                      onClick={() => setAuditPage(p => Math.min(totalAuditPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-sand-200 disabled:opacity-40 hover:bg-sand-100"
                    >
                      Next
                    </button>
                  </div>
                )}
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
                  The ONZNATURAL AI Consultant runs on Google Gemini 3 Flash with strict grounding on your 17 verified botanical products, supporting real-time streaming, multilingual consultations, and an intelligent Ayurvedic offline engine.
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
