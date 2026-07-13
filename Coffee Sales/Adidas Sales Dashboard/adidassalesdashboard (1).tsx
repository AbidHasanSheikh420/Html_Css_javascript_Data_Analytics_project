import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, ScatterChart, Scatter, ZAxis
} from 'recharts';
import {
  LayoutDashboard, TrendingUp, Package, Map, Users, Settings,
  Sun, Moon, Filter, Download, Search, Menu, X, Bell, UserCircle,
  ArrowUpRight, ArrowDownRight, DollarSign, ShoppingBag, BarChart3, Activity
} from 'lucide-react';

const THEME = {
  primary: '#4E30F7',
  secondary: '#6D5DFD',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#1E293B',
  bg: '#F8FAFC',
};

const CHART_COLORS = ['#4E30F7', '#6D5DFD', '#3B82F6', '#0EA5E9', '#06B6D4', '#14B8A6', '#22C55E'];

const RETAILERS = ['Foot Locker', 'Sports Direct', 'Amazon', 'Walmart', 'Kohl\'s', 'Dick\'s Sporting Goods'];
const REGIONS = ['Northeast', 'South', 'Midwest', 'West', 'Southeast'];
const STATES = ['New York', 'Texas', 'Illinois', 'California', 'Florida', 'Ohio', 'Pennsylvania', 'Washington'];
const CITIES = ['New York City', 'Houston', 'Chicago', 'Los Angeles', 'Miami', 'Columbus', 'Philadelphia', 'Seattle'];
const PRODUCTS = ['Men\'s Street Footwear', 'Women\'s Apparel', 'Men\'s Athletic Footwear', 'Women\'s Street Footwear', 'Men\'s Apparel', 'Women\'s Athletic Footwear'];
const SALES_METHODS = ['In-store', 'Online', 'Outlet'];

// Generates realistic mock data based on the provided schema
const generateMockData = (count = 1500) => {
  const data = [];
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2024-12-31');

  for (let i = 0; i < count; i++) {
    const retailer = RETAILERS[Math.floor(Math.random() * RETAILERS.length)];
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    // Simplify state/city logic for mock data
    const state = STATES[Math.floor(Math.random() * STATES.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const method = SALES_METHODS[Math.floor(Math.random() * SALES_METHODS.length)];
    
    const pricePerUnit = Math.floor(Math.random() * (120 - 30 + 1)) + 30; // $30 to $120
    const unitsSold = Math.floor(Math.random() * (1500 - 50 + 1)) + 50; // 50 to 1500 units
    const totalSales = pricePerUnit * unitsSold;
    
    // Margin between 25% and 55%
    const marginPercent = (Math.floor(Math.random() * (55 - 25 + 1)) + 25) / 100;
    const operatingProfit = totalSales * marginPercent;

    const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
    const invoiceDate = new Date(randomTime);

    data.push({
      id: `INV-${10000 + i}`,
      retailer,
      region,
      state,
      city,
      product,
      pricePerUnit,
      unitsSold,
      totalSales,
      operatingProfit,
      operatingMargin: marginPercent,
      salesMethod: method,
      invoiceDate: invoiceDate.toISOString().split('T')[0], // YYYY-MM-DD
      month: invoiceDate.toLocaleString('default', { month: 'short' }),
      year: invoiceDate.getFullYear().toString(),
    });
  }
  // Sort by date
  return data.sort((a, b) => new Date(a.invoiceDate) - new Date(b.invoiceDate));
};

// Formatters
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const formatNumber = (value) => new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(value);
const formatPercent = (value) => new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(value);

// Reusable UI Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200 ${className}`}>
    {children}
  </div>
);

const MetricCard = ({ title, value, trend, icon: Icon, trendUp }) => (
  <Card className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-[#4E30F7] dark:text-[#6D5DFD]">
        <Icon size={24} />
      </div>
      {trend && (
        <span className={`flex items-center text-sm font-medium ${trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trendUp ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
          {trend}
        </span>
      )}
    </div>
    <div>
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</h2>
    </div>
  </Card>
);

const ChartCard = ({ title, children, className = '' }) => (
  <Card className={`p-6 flex flex-col ${className}`}>
    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">{title}</h3>
    <div className="flex-1 w-full min-h-[300px]">
      {children}
    </div>
  </Card>
);

const Select = ({ label, options, value, onChange }) => (
  <div className="flex flex-col">
    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg focus:ring-[#4E30F7] focus:border-[#4E30F7] block w-full p-2.5 transition-colors"
    >
      <option value="All">All {label}s</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// --- DASHBOARD VIEWS ---

const ExecutiveOverview = ({ data, isDark }) => {
  // Aggregate data for KPIs
  const totalSales = data.reduce((sum, item) => sum + item.totalSales, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.operatingProfit, 0);
  const totalUnits = data.reduce((sum, item) => sum + item.unitsSold, 0);
  const avgMargin = data.length ? data.reduce((sum, item) => sum + item.operatingMargin, 0) / data.length : 0;

  // Aggregate for Charts
  const monthlyData = useMemo(() => {
    const acc = {};
    data.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!acc[key]) acc[key] = { name: item.month, sortKey: new Date(item.invoiceDate).getTime(), Sales: 0, Profit: 0 };
      acc[key].Sales += item.totalSales;
      acc[key].Profit += item.operatingProfit;
    });
    return Object.values(acc).sort((a, b) => a.sortKey - b.sortKey);
  }, [data]);

  const categoryData = useMemo(() => {
    const acc = {};
    data.forEach(item => {
      if (!acc[item.product]) acc[item.product] = { name: item.product, value: 0 };
      acc[item.product].value += item.totalSales;
    });
    return Object.values(acc).sort((a, b) => b.value - a.value);
  }, [data]);

  const regionData = useMemo(() => {
    const acc = {};
    data.forEach(item => {
      if (!acc[item.region]) acc[item.region] = { name: item.region, Sales: 0, Profit: 0 };
      acc[item.region].Sales += item.totalSales;
      acc[item.region].Profit += item.operatingProfit;
    });
    return Object.values(acc).sort((a, b) => b.Sales - a.Sales);
  }, [data]);

  const chartTheme = {
    grid: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Revenue" value={formatCurrency(totalSales)} trend="12.5%" trendUp={true} icon={DollarSign} />
        <MetricCard title="Operating Profit" value={formatCurrency(totalProfit)} trend="8.2%" trendUp={true} icon={Activity} />
        <MetricCard title="Units Sold" value={formatNumber(totalUnits)} trend="3.1%" trendUp={false} icon={ShoppingBag} />
        <MetricCard title="Avg Operating Margin" value={formatPercent(avgMargin)} trend="1.2%" trendUp={true} icon={BarChart3} />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Revenue & Profit Trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={THEME.success} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={THEME.success} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="name" stroke={chartTheme.text} tick={{fill: chartTheme.text}} />
              <YAxis stroke={chartTheme.text} tick={{fill: chartTheme.text}} tickFormatter={(value) => `$${value/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.grid, color: isDark ? '#fff' : '#000', borderRadius: '8px' }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Area type="monotone" dataKey="Sales" stroke={THEME.primary} fillOpacity={1} fill="url(#colorSales)" />
              <Area type="monotone" dataKey="Profit" stroke={THEME.success} fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Sales by Category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderRadius: '8px', border: 'none' }} />
              <Legend layout="vertical" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px', color: chartTheme.text }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Regional Performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
              <XAxis type="number" stroke={chartTheme.text} tickFormatter={(value) => `$${value/1000}k`} />
              <YAxis dataKey="name" type="category" stroke={chartTheme.text} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="Sales" fill={THEME.secondary} radius={[0, 4, 4, 0]} />
              <Bar dataKey="Profit" fill={THEME.warning} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recent Transactions (Preview)">
           <div className="overflow-x-auto h-full">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Retailer</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(-6).reverse().map((row, i) => (
                  <tr key={i} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.id}</td>
                    <td className="px-4 py-3">{row.retailer}</td>
                    <td className="px-4 py-3 truncate max-w-[150px]">{row.product}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#4E30F7] dark:text-[#6D5DFD]">{formatCurrency(row.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};


const RetailerPerformance = ({ data, isDark }) => {
  const retailerData = useMemo(() => {
    const acc = {};
    data.forEach(item => {
      if (!acc[item.retailer]) acc[item.retailer] = { name: item.retailer, Sales: 0, Profit: 0, Units: 0 };
      acc[item.retailer].Sales += item.totalSales;
      acc[item.retailer].Profit += item.operatingProfit;
      acc[item.retailer].Units += item.unitsSold;
    });
    return Object.values(acc).sort((a, b) => b.Sales - a.Sales);
  }, [data]);

  const chartTheme = {
    grid: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#94a3b8' : '#64748b',
    tooltipBg: isDark ? '#1e293b' : '#ffffff',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Sales by Retailer">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retailerData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
              <XAxis dataKey="name" stroke={chartTheme.text} />
              <YAxis stroke={chartTheme.text} tickFormatter={(value) => `$${value/1000000}M`} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderRadius: '8px' }} />
              <Bar dataKey="Sales" fill={THEME.primary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Retailer Profit Margin Matrix">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis type="number" dataKey="Sales" name="Total Sales" stroke={chartTheme.text} tickFormatter={(value) => `$${value/1000000}M`} />
              <YAxis type="number" dataKey="Profit" name="Profit" stroke={chartTheme.text} tickFormatter={(value) => `$${value/1000}k`} />
              <ZAxis type="number" dataKey="Units" range={[60, 400]} name="Units Sold" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderRadius: '8px' }} formatter={(value, name) => name === 'Units Sold' ? formatNumber(value) : formatCurrency(value)} />
              <Scatter name="Retailers" data={retailerData} fill={THEME.warning}>
                 {retailerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} opacity={0.8} />
                  ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};


export default function AdidasDashboard() {
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('executive');
  
  // Data State
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Filters State
  const [filters, setFilters] = useState({
    region: 'All',
    retailer: 'All',
    product: 'All',
    year: 'All'
  });

  // Initialize Data
  useEffect(() => {
    const data = generateMockData(2000); // Generate 2000 records
    setAllData(data);
    setFilteredData(data);
  }, []);

  // Apply Filters
  useEffect(() => {
    let result = allData;
    if (filters.region !== 'All') result = result.filter(d => d.region === filters.region);
    if (filters.retailer !== 'All') result = result.filter(d => d.retailer === filters.retailer);
    if (filters.product !== 'All') result = result.filter(d => d.product === filters.product);
    if (filters.year !== 'All') result = result.filter(d => d.year === filters.year);
    setFilteredData(result);
  }, [filters, allData]);

  // Handle Theme Toggle manually applying class to body for simplicity in this sandbox
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const navItems = [
    { id: 'executive', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'retailer', label: 'Retailer Analytics', icon: Users },
    { id: 'product', label: 'Product Analytics', icon: Package },
    { id: 'geo', label: 'Geographic Data', icon: Map },
  ];

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'dark bg-slate-900' : 'bg-slate-50'} transition-colors duration-300 flex text-slate-900 dark:text-slate-100`}>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4E30F7] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
               <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4E30F7] to-[#0EA5E9]">
                DataVision
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Adidas Sales BI</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#4E30F7]/10 text-[#4E30F7] dark:bg-[#4E30F7]/20 dark:text-[#6D5DFD] font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <Settings size={20} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8 z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 dark:text-slate-300">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 focus-within:ring-2 ring-[#4E30F7] transition-shadow">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search dashboard..." 
                className="bg-transparent border-none outline-none text-sm w-64 text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors hidden sm:block">
              <Download size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4E30F7] to-[#0EA5E9] flex items-center justify-center text-white font-bold shadow-sm">
                AD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Admin User</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Data Analyst</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          
          {/* Global Filters Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-8 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-end justify-between">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold mb-2 md:mb-0 w-full md:w-auto">
              <Filter size={20} className="text-[#4E30F7] dark:text-[#6D5DFD]" />
              Global Filters
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto flex-1">
              <Select 
                label="Region" 
                options={REGIONS} 
                value={filters.region} 
                onChange={(val) => setFilters({...filters, region: val})} 
              />
              <Select 
                label="Retailer" 
                options={RETAILERS} 
                value={filters.retailer} 
                onChange={(val) => setFilters({...filters, retailer: val})} 
              />
              <Select 
                label="Product" 
                options={PRODUCTS} 
                value={filters.product} 
                onChange={(val) => setFilters({...filters, product: val})} 
              />
              <Select 
                label="Year" 
                options={['2023', '2024']} 
                value={filters.year} 
                onChange={(val) => setFilters({...filters, year: val})} 
              />
            </div>
          </div>

          {/* Dynamic Page Rendering */}
          <div className="pb-10">
            {activeTab === 'executive' && <ExecutiveOverview data={filteredData} isDark={isDark} />}
            {activeTab === 'retailer' && <RetailerPerformance data={filteredData} isDark={isDark} />}
            {(activeTab === 'product' || activeTab === 'geo') && (
               <div className="flex flex-col items-center justify-center h-64 text-center animate-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Activity size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">Module Under Construction</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">
                    The {navItems.find(i => i.id === activeTab)?.label} views are currently being built. Please check the Executive or Retailer tabs for interactive examples.
                  </p>
               </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}