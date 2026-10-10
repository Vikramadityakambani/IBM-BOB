import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentItem, Platform, Tone } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { StatusBadge, PlatformBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  Search, 
  Send, 
  CheckCircle2, 
  Calendar as CalendarIcon, 
  Trash2, 
  Eye, 
  Filter, 
  Clock, 
  Layers, 
  MessageSquare,
  Copy,
  Edit3,
  LayoutGrid,
  List,
  RefreshCw,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { 
    contentItems, 
    campaigns,
    currentUser, 
    submitForReview, 
    approveContent, 
    deleteContent,
    duplicateContent,
    updateContent,
    scheduleContent,
    syncWithBackend,
    addToast
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'version'>('newest');
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-10-20 15:00');

  // Edit draft modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editPlatform, setEditPlatform] = useState<Platform>('linkedin');
  const [editTone, setEditTone] = useState<Tone>('Thought-Leadership');
  const [editCampaignId, setEditCampaignId] = useState<string>('');

  // Handle Sync
  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithBackend();
    setTimeout(() => {
      setIsSyncing(false);
      addToast({
        type: 'info',
        title: 'Content Library Refreshed',
        message: 'Synchronized items directly from the backend database.',
      });
    }, 400);
  };

  // Filter content items
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
    const matchesCampaign = campaignFilter === 'all' || item.campaignId === campaignFilter;

    return matchesSearch && matchesStatus && matchesPlatform && matchesCampaign;
  });

  // Sort content items
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'newest') {
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    } else if (sortBy === 'oldest') {
      return (a.updatedAt || '').localeCompare(b.updatedAt || '');
    } else if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    } else if (sortBy === 'version') {
      return b.version - a.version;
    }
    return 0;
  });

  const handleOpenSchedule = (item: ContentItem) => {
    setSelectedItem(item);
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (selectedItem) {
      scheduleContent(selectedItem.id, scheduleDate);
      setIsScheduleModalOpen(false);
    }
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditItem(item);
    setEditTitle(item.title);
    setEditBody(item.body);
    setEditPlatform(item.platform);
    setEditTone(item.tone);
    setEditCampaignId(item.campaignId || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editItem) {
      updateContent(editItem.id, {
        title: editTitle,
        body: editBody,
        platform: editPlatform,
        tone: editTone,
        campaignId: editCampaignId || undefined,
        campaignName: campaigns.find((c) => c.id === editCampaignId)?.name,
      });
      setIsEditModalOpen(false);
      setEditItem(null);
    }
  };

  const handleDuplicate = (item: ContentItem) => {
    duplicateContent(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header / Stats Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <span>Enterprise Content Library</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 font-medium">
              {contentItems.length} items total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Full lifecycle asset repository with immutable version history, multi-platform tags, and separation-of-duties review gates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                viewMode === 'table' ? 'bg-slate-800 text-brand-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-all ${
                viewMode === 'grid' ? 'bg-slate-800 text-brand-300 font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid / Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {/* Sync Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSync}
            disabled={isSyncing}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand-400' : ''}`} />}
          >
            {isSyncing ? 'Syncing...' : 'Sync DB'}
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, keywords, excerpt, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Campaign Filter dropdown */}
            <div className="w-full md:w-56">
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-500"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full md:w-44 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-brand-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="title">Sort: Title A-Z</option>
                <option value="version">Sort: Highest Version</option>
              </select>
            </div>
          </div>

          {/* Platform filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1">
            <span className="text-xs text-slate-400 mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Platform:
            </span>
            {(['all', 'linkedin', 'x', 'instagram', 'youtube', 'blog'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium capitalize transition-all shrink-0 ${
                  platformFilter === p
                    ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1 shrink-0">Status:</span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'draft', label: 'Draft' },
              { id: 'in_review', label: 'In Review' },
              { id: 'approved', label: 'Approved' },
              { id: 'scheduled', label: 'Scheduled' },
              { id: 'rejected', label: 'Changes Req.' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-slate-800 text-brand-300 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="text-xs text-slate-500 ml-auto font-mono shrink-0 pl-2">
              Showing {sortedItems.length} of {contentItems.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Presentation: Table or Grid */}
      {viewMode === 'table' ? (
        /* Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800 font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Content Title & Format</th>
                  <th className="px-4 py-3.5">Platform</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Campaign</th>
                  <th className="px-4 py-3.5">Author & Role</th>
                  <th className="px-4 py-3.5">Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      No content items match your active filters.
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-100 text-sm group-hover:text-brand-300 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{item.format}</span>
                          <span>•</span>
                          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono text-[10px]">v{item.version}</span>
                          <span>•</span>
                          <span>{item.language}</span>
                          {item.comments && item.comments.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-amber-400">
                                <MessageSquare className="w-3 h-3" /> {item.comments.length}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <PlatformBadge platform={item.platform} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {item.campaignName ? (
                          <span className="text-xs text-brand-300 font-medium truncate block max-w-[150px]">
                            {item.campaignName}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-slate-200">{item.authorName}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{item.authorRole}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                        {item.updatedAt}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                        {/* View Action */}
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="text-xs p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="View Details & Audit Trail"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>

                        {/* Edit Action (allowed on draft or rejected) */}
                        {(item.status === 'draft' || item.status === 'rejected') && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-xs p-1.5 text-brand-300 hover:text-brand-100 rounded hover:bg-slate-800 transition-colors"
                            title="Edit Draft & Bump Version"
                          >
                            <Edit3 className="w-4 h-4 inline" />
                          </button>
                        )}

                        {/* Duplicate Action */}
                        <button
                          onClick={() => handleDuplicate(item)}
                          className="text-xs p-1.5 text-cyan-400 hover:text-cyan-200 rounded hover:bg-slate-800 transition-colors"
                          title="Duplicate as new Draft (v1 Copy)"
                        >
                          <Copy className="w-3.5 h-3.5 inline" />
                        </button>

                        {/* Submit to review */}
                        {item.status === 'draft' && (
                          <button
                            onClick={() => submitForReview(item.id)}
                            className="text-xs px-2 py-1 bg-brand-600/30 text-brand-200 border border-brand-500/50 hover:bg-brand-600 hover:text-white rounded transition-colors"
                            title="Submit to Review Queue"
                          >
                            <Send className="w-3 h-3 inline mr-1" /> Submit
                          </button>
                        )}

                        {/* Reviewer Approve */}
                        {item.status === 'in_review' && currentUser.role !== 'creator' && (
                          <button
                            onClick={() => approveContent(item.id)}
                            className="text-xs px-2 py-1 bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white rounded transition-colors"
                            title="Approve Content"
                          >
                            <CheckCircle2 className="w-3 h-3 inline mr-1" /> Approve
                          </button>
                        )}

                        {/* Schedule */}
                        {item.status === 'approved' && (
                          <button
                            onClick={() => handleOpenSchedule(item)}
                            className="text-xs px-2 py-1 bg-sky-600/30 text-sky-200 border border-sky-500/50 hover:bg-sky-600 hover:text-white rounded transition-colors"
                            title="Schedule Publishing"
                          >
                            <CalendarIcon className="w-3 h-3 inline mr-1" /> Schedule
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => deleteContent(item.id)}
                          className="text-xs p-1.5 text-rose-400 hover:text-rose-200 rounded hover:bg-slate-800 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Grid / Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedItems.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500">
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No content items match your active filters.</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <Card key={item.id} className="flex flex-col hover:border-slate-700 transition-all duration-200">
                <CardContent className="p-4 flex-1 flex flex-col space-y-3">
                  {/* Card Top Row: Badges */}
                  <div className="flex items-center justify-between">
                    <PlatformBadge platform={item.platform} />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        v{item.version}
                      </span>
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>

                  {/* Title & Excerpt */}
                  <div>
                    <h3 
                      onClick={() => setSelectedItem(item)}
                      className="font-semibold text-slate-100 text-sm hover:text-brand-300 cursor-pointer transition-colors line-clamp-2"
                    >
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed font-sans">
                      {item.body}
                    </p>
                  </div>

                  {/* Campaign & Metadata footer */}
                  <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="truncate max-w-[140px]">
                      {item.campaignName ? (
                        <span className="text-brand-300 font-medium">📁 {item.campaignName}</span>
                      ) : (
                        <span className="text-slate-500 italic">No campaign</span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500">{item.updatedAt}</span>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {(item.status === 'draft' || item.status === 'rejected') && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-brand-300 hover:text-brand-100 rounded hover:bg-slate-800 transition-colors"
                          title="Edit Draft"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicate(item)}
                        className="p-1.5 text-cyan-400 hover:text-cyan-200 rounded hover:bg-slate-800 transition-colors"
                        title="Duplicate Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteContent(item.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-200 rounded hover:bg-slate-800 transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.status === 'draft' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => submitForReview(item.id)}
                          leftIcon={<Send className="w-3 h-3" />}
                        >
                          Submit
                        </Button>
                      )}
                      {item.status === 'in_review' && currentUser.role !== 'creator' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => approveContent(item.id)}
                          leftIcon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Approve
                        </Button>
                      )}
                      {item.status === 'approved' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenSchedule(item)}
                          leftIcon={<CalendarIcon className="w-3 h-3" />}
                        >
                          Schedule
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Item Detail & Audit Trail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem && !isScheduleModalOpen && !isEditModalOpen}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          description={`Format: ${selectedItem.format} • Language: ${selectedItem.language} • Tone: ${selectedItem.tone} • Version: v${selectedItem.version}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedItem.status} />
                <PlatformBadge platform={selectedItem.platform} />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    handleDuplicate(selectedItem);
                    setSelectedItem(null);
                  }}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  Duplicate
                </Button>
                {(selectedItem.status === 'draft' || selectedItem.status === 'rejected') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const itemToEdit = selectedItem;
                      setSelectedItem(null);
                      handleOpenEdit(itemToEdit);
                    }}
                    leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                  >
                    Edit
                  </Button>
                )}
                {selectedItem.status === 'draft' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      submitForReview(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Submit for Review
                  </Button>
                )}
                {selectedItem.status === 'in_review' && currentUser.role !== 'creator' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      approveContent(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedItem(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans text-sm text-slate-200 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
              {selectedItem.body}
            </div>

            {/* Workflow History Timeline */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-400" />
                Workflow Audit Trail & State Transitions
              </h4>
              <div className="space-y-2 border-l-2 border-slate-800 pl-3">
                {selectedItem.history && selectedItem.history.length > 0 ? (
                  selectedItem.history.map((h) => (
                    <div key={h.id} className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{h.actorName}</span>
                        <span className="text-[10px] text-slate-500">({h.actorRole})</span>
                        <span className="text-slate-500">→</span>
                        <StatusBadge status={h.toStatus} size="sm" />
                        <span className="text-[10px] text-slate-500 ml-auto font-mono">{h.createdAt}</span>
                      </div>
                      {h.feedback && (
                        <p className="text-xs text-slate-400 mt-1 italic bg-slate-950/60 p-2 rounded border border-slate-800/80">
                          "{h.feedback}"
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No transition records logged yet.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Quick Edit Modal */}
      {isEditModalOpen && editItem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Draft: ${editItem.title}`}
          description={`Saving changes will bump content version from v${editItem.version} to v${editItem.version + 1} and record an audit event.`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit} leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Save & Bump Version (v{editItem.version + 1})
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Platform</label>
                <select
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value as Platform)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 capitalize"
                >
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X (Twitter)</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="blog">Blog</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tone</label>
                <select
                  value={editTone}
                  onChange={(e) => setEditTone(e.target.value as Tone)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="Thought-Leadership">Thought-Leadership</option>
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Persuasive">Persuasive</option>
                  <option value="Bold">Bold</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Campaign</label>
                <select
                  value={editCampaignId}
                  onChange={(e) => setEditCampaignId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="">None</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Content Body</label>
              <textarea
                rows={8}
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Publishing Modal */}
      {selectedItem && isScheduleModalOpen && (
        <Modal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          title="Schedule Publication"
          description={`Assign planned publishing date for "${selectedItem.title}"`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setIsScheduleModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleConfirmSchedule}>
                Confirm Schedule
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Planned Publishing Timestamp (UTC)
            </label>
            <input
              type="text"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-mono"
              placeholder="YYYY-MM-DD HH:MM"
            />
            <p className="text-xs text-slate-400">
              Note: This assigns internal schedule metadata for your marketing calendar.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
