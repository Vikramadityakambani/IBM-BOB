import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentItem } from '../../types';
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
  MessageSquare
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const { 
    contentItems, 
    currentUser, 
    submitForReview, 
    approveContent, 
    deleteContent,
    scheduleContent 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('2026-10-20 15:00');

  // Filter content items
  const filteredItems = contentItems.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;

    return matchesSearch && matchesStatus && matchesPlatform;
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search and Filters Bar */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by title, keywords, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Platform filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Platform:
              </span>
              {(['all', 'linkedin', 'x', 'instagram', 'youtube', 'blog'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium capitalize transition-all ${
                    platformFilter === p
                      ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1">Status:</span>
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
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-slate-800 text-brand-300 font-semibold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="text-xs text-slate-500 ml-auto font-mono">
              Showing {filteredItems.length} items
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Content List Table */}
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
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    No content items match your active filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-850/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-100 text-sm group-hover:text-brand-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{item.format}</span>
                        <span>•</span>
                        <span>v{item.version}</span>
                        {item.comments.length > 0 && (
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
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="text-xs p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>

                      {item.status === 'draft' && (
                        <button
                          onClick={() => submitForReview(item.id)}
                          className="text-xs px-2 py-1 bg-brand-600/30 text-brand-200 border border-brand-500/50 hover:bg-brand-600 hover:text-white rounded transition-colors"
                          title="Submit to Review Queue"
                        >
                          <Send className="w-3 h-3 inline mr-1" /> Submit
                        </button>
                      )}

                      {item.status === 'in_review' && currentUser.role !== 'creator' && (
                        <button
                          onClick={() => approveContent(item.id)}
                          className="text-xs px-2 py-1 bg-emerald-600/30 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-600 hover:text-white rounded transition-colors"
                          title="Approve Content"
                        >
                          <CheckCircle2 className="w-3 h-3 inline mr-1" /> Approve
                        </button>
                      )}

                      {item.status === 'approved' && (
                        <button
                          onClick={() => handleOpenSchedule(item)}
                          className="text-xs px-2 py-1 bg-sky-600/30 text-sky-200 border border-sky-500/50 hover:bg-sky-600 hover:text-white rounded transition-colors"
                          title="Schedule Publishing"
                        >
                          <CalendarIcon className="w-3 h-3 inline mr-1" /> Schedule
                        </button>
                      )}

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

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem && !isScheduleModalOpen}
          onClose={() => setSelectedItem(null)}
          title={selectedItem.title}
          description={`Format: ${selectedItem.format} • Language: ${selectedItem.language} • Tone: ${selectedItem.tone}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedItem.status} />
                <PlatformBadge platform={selectedItem.platform} />
              </div>
              <div className="flex items-center gap-2">
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
                Workflow Audit Trail
              </h4>
              <div className="space-y-2 border-l-2 border-slate-800 pl-3">
                {selectedItem.history.map((h) => (
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
                ))}
              </div>
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
