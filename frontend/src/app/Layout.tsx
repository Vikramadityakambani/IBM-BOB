import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { NavTab, UserRole } from '../types';
import { RoleBadge } from '../components/ui/Badge';
import { 
  Sparkles, 
  FolderKanban, 
  CheckCheck, 
  Target, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X, 
  ChevronDown, 
  Plus, 
  Building2, 
  UserCircle2, 
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { 
    activeTab, 
    setActiveTab, 
    currentUser, 
    setCurrentRole, 
    currentWorkspace, 
    workspaces, 
    setWorkspace, 
    contentItems,
    toasts,
    removeToast
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  // Count items awaiting review
  const pendingReviewCount = contentItems.filter((c) => c.status === 'in_review').length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
    { id: 'library', label: 'Content Library', icon: FolderKanban },
    { id: 'approvals', label: 'Review Queue', icon: CheckCheck, badge: pendingReviewCount },
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'calendar', label: 'Planner & Calendar', icon: CalendarIcon },
    { id: 'brand-voice', label: 'Brand Voice', icon: ShieldCheck },
    { id: 'settings', label: 'Settings & Team', icon: Settings },
  ];

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'ai-studio': return 'AI Creation Studio';
      case 'library': return 'Content Repository';
      case 'approvals': return 'Review & Approval Queue';
      case 'campaigns': return 'Active Campaigns';
      case 'calendar': return 'Content Calendar & Schedule';
      case 'brand-voice': return 'Brand Voice Guidelines';
      case 'settings': return 'Workspace Administration';
      default: return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md
              animate-in slide-in-from-top-5 duration-200 transition-all
              ${toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200' : ''}
              ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-700/60 text-rose-200' : ''}
              ${toast.type === 'warning' ? 'bg-amber-950/90 border-amber-700/60 text-amber-200' : ''}
              ${toast.type === 'info' ? 'bg-slate-900/95 border-brand-500/50 text-slate-200 shadow-glow' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <div className="text-sm font-semibold">{toast.title}</div>
              {toast.message && <div className="text-xs opacity-90 mt-0.5">{toast.message}</div>}
            </div>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="text-slate-400 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Enterprise Sidebar */}
      <aside 
        className={`
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          bg-slate-900/95 border-r border-slate-800 transition-all duration-300 flex flex-col shrink-0 z-40
          max-md:fixed max-md:inset-y-0 max-md:left-0 ${!isSidebarOpen && 'max-md:-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-800/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActiveTab('ai-studio')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-400 flex items-center justify-center shadow-md shadow-brand-900/40 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  ContentPilot <span className="text-xs text-brand-400 font-semibold px-1 py-0.2 bg-brand-950/80 rounded border border-brand-800/50">AI</span>
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Agiloft SaaS</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors hidden md:block"
          >
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Workspace Switcher */}
        {isSidebarOpen && (
          <div className="p-3 border-b border-slate-800/60 relative">
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block px-2 mb-1">
              Active Workspace
            </label>
            <button
              onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="truncate font-medium">{currentWorkspace.name}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {isWorkspaceDropdownOpen && (
              <div className="absolute left-3 right-3 top-16 bg-slate-900 border border-slate-750 rounded-lg shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWorkspace(ws);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center justify-between transition-colors ${
                      ws.id === currentWorkspace.id 
                        ? 'bg-brand-600/20 text-brand-300 font-semibold' 
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] text-slate-500">{ws.membersCount} users</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group
                  ${isActive 
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-900/50' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'}
                  ${!isSidebarOpen && 'justify-center'}
                `}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {isSidebarOpen && (
                  <div className="flex-1 flex items-center justify-between text-left truncate">
                    <span className="truncate">{item.label}</span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-brand-700' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Role Persona Switcher (For Demo & Evaluation) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {isSidebarOpen ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Demo Persona Role</span>
                <RoleBadge role={currentUser.role} size="sm" />
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {(['creator', 'reviewer', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setCurrentRole(r)}
                    className={`text-[10px] py-1 rounded font-medium capitalize transition-all ${
                      currentUser.role === r 
                        ? 'bg-brand-600 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="mt-2.5 flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-xs font-semibold">
                  {currentUser.name[0]}
                </div>
                <div className="truncate">
                  <div className="text-xs font-medium text-slate-200 truncate">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{currentUser.email}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <UserCircle2 className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg md:hidden hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{currentWorkspace.name}</span>
                <span>/</span>
                <span className="text-slate-200 font-medium">{getBreadcrumbTitle()}</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none mt-0.5">
                {getBreadcrumbTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Role Switcher on Header */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-slate-400">Active Role:</span>
              <RoleBadge role={currentUser.role} />
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium ml-1 flex items-center gap-0.5"
                >
                  Switch <ChevronDown className="w-3 h-3" />
                </button>
                {isRoleDropdownOpen && (
                  <div className="absolute right-0 top-7 w-44 bg-slate-900 border border-slate-750 rounded-lg shadow-xl p-1 z-50">
                    <button
                      onClick={() => { setCurrentRole('creator'); setIsRoleDropdownOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded flex items-center gap-2"
                    >
                      <span>Creator (Sarah Lin)</span>
                    </button>
                    <button
                      onClick={() => { setCurrentRole('reviewer'); setIsRoleDropdownOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded flex items-center gap-2"
                    >
                      <span>Reviewer (David Miller)</span>
                    </button>
                    <button
                      onClick={() => { setCurrentRole('admin'); setIsRoleDropdownOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-800 rounded flex items-center gap-2"
                    >
                      <span>Admin (Elena Vance)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* "+ New Content" quick action */}
            <button
              onClick={() => setActiveTab('ai-studio')}
              className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm shadow-brand-900/40"
            >
              <Plus className="w-4 h-4" />
              <span>Create Brief</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
