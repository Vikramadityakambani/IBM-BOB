import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentItem } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';
import { StatusBadge, PlatformBadge, RoleBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { api } from '../../services/api';
import { 
  CheckCheck, 
  CheckCircle2, 
  RotateCcw, 
  XCircle,
  MessageSquare, 
  ShieldAlert, 
  Clock, 
  UserCheck,
  Send,
  History,
  FileCheck2,
  Filter,
  ShieldCheck
} from 'lucide-react';

export const ReviewQueueView: React.FC = () => {
  const { 
    contentItems, 
    currentUser, 
    approveContent, 
    requestChanges, 
    rejectContent,
    addCommentToItem,
    brandProfile,
    setCurrentRole 
  } = useApp();

  // Active filter tab
  const [filterTab, setFilterTab] = useState<'all' | 'linkedin' | 'x' | 'rejected'>('all');

  // Modals state
  const [selectedItemForFeedback, setSelectedItemForFeedback] = useState<ContentItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  const [selectedItemForReject, setSelectedItemForReject] = useState<ContentItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [selectedItemForTimeline, setSelectedItemForTimeline] = useState<ContentItem | null>(null);

  // Audit trail drawer
  const [auditItem, setAuditItem] = useState<ContentItem | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Inline comment draft map by item ID
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  // Filter items
  const inReviewItems = contentItems.filter((c) => c.status === 'in_review');
  const rejectedItems = contentItems.filter((c) => c.status === 'rejected');

  const displayedItems = inReviewItems.filter((item) => {
    if (filterTab === 'linkedin') return item.platform === 'linkedin';
    if (filterTab === 'x') return item.platform === 'x';
    return true;
  });

  const handleOpenRequestChanges = (item: ContentItem) => {
    setSelectedItemForFeedback(item);
    setFeedbackNote('Please refine the conclusion and add an explicit enterprise call-to-action.');
  };

  const handleConfirmRequestChanges = async () => {
    if (selectedItemForFeedback && feedbackNote.trim()) {
      await requestChanges(selectedItemForFeedback.id, feedbackNote);
      setSelectedItemForFeedback(null);
    }
  };

  const handleOpenReject = (item: ContentItem) => {
    setSelectedItemForReject(item);
    setRejectReason('Content does not align with current brand strategy or policy.');
  };

  const handleConfirmReject = async () => {
    if (selectedItemForReject && rejectReason.trim()) {
      await rejectContent(selectedItemForReject.id, rejectReason);
      setSelectedItemForReject(null);
    }
  };

  const handleAddComment = async (itemId: string) => {
    const text = commentDrafts[itemId]?.trim();
    if (text) {
      await addCommentToItem(itemId, text);
      setCommentDrafts((prev) => ({ ...prev, [itemId]: '' }));
    }
  };

  const handleOpenAudit = async (item: ContentItem) => {
    setAuditItem(item);
    setIsLoadingAudit(true);
    try {
      const logs = await api.getAuditTrail(item.id);
      setAuditLogs(logs);
    } catch {
      setAuditLogs([]);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Notice Banner if logged in as Creator */}
      {currentUser.role === 'creator' && (
        <div className="bg-amber-950/60 border border-amber-800/60 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-amber-200">
                Separation of Duties Policy (Agiloft Enterprise Governance)
              </div>
              <p className="text-xs text-amber-400/90 mt-0.5">
                You are currently viewing as a <span className="font-bold underline">Creator</span>. Under enterprise compliance rules, Creators cannot self-approve content assets.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentRole('reviewer')}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
          >
            Switch to Reviewer Persona (David Miller)
          </button>
        </div>
      )}

      {/* Review Queue Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Pending Review</span>
              <span className="text-2xl font-bold text-amber-400">{inReviewItems.length}</span>
            </div>
            <Clock className="w-8 h-8 text-amber-500/30" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Changes Requested</span>
              <span className="text-2xl font-bold text-rose-400">{rejectedItems.length}</span>
            </div>
            <RotateCcw className="w-8 h-8 text-rose-500/30" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Active Persona</span>
              <span className="text-sm font-semibold text-slate-200">{currentUser.name}</span>
              <div className="mt-1"><RoleBadge role={currentUser.role} size="sm" /></div>
            </div>
            <UserCheck className="w-8 h-8 text-brand-500/30" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Brand Guardrails</span>
              <span className="text-xs font-semibold text-emerald-400">Strictly Enforced</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{brandProfile.prohibitedPhrases.length} prohibited words blocked</span>
            </div>
            <CheckCheck className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <span className="text-xs text-slate-400 flex items-center gap-1 mr-2">
          <Filter className="w-3.5 h-3.5" /> Queue Filter:
        </span>
        {[
          { id: 'all', label: `All Pending (${inReviewItems.length})` },
          { id: 'linkedin', label: `LinkedIn (${inReviewItems.filter(i => i.platform === 'linkedin').length})` },
          { id: 'x', label: `X / Twitter (${inReviewItems.filter(i => i.platform === 'x').length})` },
          { id: 'rejected', label: `Changes Req. Archive (${rejectedItems.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterTab === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue Content Items */}
      {filterTab === 'rejected' ? (
        /* Changes Requested / Rejected List */
        rejectedItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm">No items currently marked with Changes Requested.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {rejectedItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={item.platform} />
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-slate-400">v{item.version}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedItemForTimeline(item)} leftIcon={<History className="w-3.5 h-3.5" />}>
                    View Timeline
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap">
                    {item.body}
                  </div>
                  {item.comments.length > 0 && (
                    <div className="bg-amber-950/30 border border-amber-800/40 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-amber-300">Latest Review Feedback:</div>
                      <p className="text-slate-300 italic">"{item.comments[0].body}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* In Review Queue Items */
        displayedItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-slate-500 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto" />
              <h3 className="text-base font-semibold text-slate-300">Review Queue is Clear!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                There are no content drafts waiting for editorial review matching this filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {displayedItems.map((item) => (
              <Card key={item.id} variant="elevated" className="border-slate-800 hover:border-slate-750 transition-all">
                <CardHeader className="flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={item.platform} />
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-300 font-semibold">{item.format}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">v{item.version}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400">{item.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedItemForTimeline(item)}
                      leftIcon={<History className="w-3.5 h-3.5 text-brand-400" />}
                    >
                      Audit Timeline
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenAudit(item)}
                      leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                    >
                      Audit Trail
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Submitted by <span className="text-slate-200 font-medium">{item.authorName}</span> ({item.authorRole})</span>
                      <span>•</span>
                      <span className="font-mono text-[11px]">{item.updatedAt}</span>
                      {item.campaignName && (
                        <>
                          <span>•</span>
                          <span className="text-brand-300 font-medium">Campaign: {item.campaignName}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Draft Content Body */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {item.body}
                  </div>

                  {/* Comments Thread & Contextual Note Input */}
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                        Editorial Revision Notes & Creator Comments ({item.comments?.length || 0})
                      </span>
                    </div>

                    {/* Existing Comments list */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {item.comments.map((cm) => (
                          <div key={cm.id} className="text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                            <div className="flex items-center justify-between font-semibold text-slate-300">
                              <span className="flex items-center gap-1.5">
                                {cm.authorName}
                                <span className="text-[10px] text-slate-500 uppercase px-1 py-0.2 rounded bg-slate-800">
                                  {cm.authorRole}
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{cm.createdAt}</span>
                            </div>
                            <p className="text-slate-300 mt-1 leading-relaxed">{cm.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add editorial review note or creator clarification..."
                        value={commentDrafts[item.id] || ''}
                        onChange={(e) =>
                          setCommentDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(item.id);
                        }}
                        className="flex-1 bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddComment(item.id)}
                        disabled={!commentDrafts[item.id]?.trim()}
                        leftIcon={<Send className="w-3 h-3" />}
                      >
                        Send Note
                      </Button>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex-wrap gap-2 justify-between bg-slate-950/40 border-t border-slate-800/80">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <FileCheck2 className="w-3.5 h-3.5 text-brand-400" />
                    <span>Agiloft Separation of Duties enforced. All transitions logged to immutable audit ledger.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReject(item)}
                      disabled={currentUser.role === 'creator'}
                      title={currentUser.role === 'creator' ? 'Creators cannot review or reject content' : 'Reject Draft'}
                      leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRequestChanges(item)}
                      disabled={currentUser.role === 'creator'}
                      title={currentUser.role === 'creator' ? 'Creators cannot review content' : 'Request Revisions'}
                      leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => approveContent(item.id)}
                      disabled={currentUser.role === 'creator'}
                      title={currentUser.role === 'creator' ? 'Creators cannot self-approve content' : 'Approve Draft'}
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Approve Content
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Request Changes Modal */}
      {selectedItemForFeedback && (
        <Modal
          isOpen={!!selectedItemForFeedback}
          onClose={() => setSelectedItemForFeedback(null)}
          title="Request Changes & Return to Draft"
          description={`Provide mandatory revision notes for "${selectedItemForFeedback.title}".`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItemForFeedback(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmRequestChanges} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Confirm Return to Draft
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Revision Notes & Specific Changes Required (Mandatory):
            </label>
            <textarea
              rows={4}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-3 focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
              placeholder="Explain the required revisions, brand deviations, or citations..."
            />
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {selectedItemForReject && (
        <Modal
          isOpen={!!selectedItemForReject}
          onClose={() => setSelectedItemForReject(null)}
          title="Reject Content Draft"
          description={`Mark "${selectedItemForReject.title}" as Rejected. It will be removed from the active queue.`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItemForReject(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject} leftIcon={<XCircle className="w-3.5 h-3.5" />}>
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Rejection Reason:
            </label>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-3 focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
              placeholder="State the reason for rejecting this asset..."
            />
          </div>
        </Modal>
      )}

      {/* Visual Activity & State Transition Timeline Modal */}
      {selectedItemForTimeline && (
        <Modal
          isOpen={!!selectedItemForTimeline}
          onClose={() => setSelectedItemForTimeline(null)}
          title={`Governance Audit Timeline: ${selectedItemForTimeline.title}`}
          description={`Complete state transition history and reviewer feedback trail.`}
          maxWidth="2xl"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItemForTimeline(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="space-y-3 border-l-2 border-brand-500/40 pl-4 py-1">
              {selectedItemForTimeline.history && selectedItemForTimeline.history.length > 0 ? (
                selectedItemForTimeline.history.map((h, idx) => (
                  <div key={h.id || idx} className="text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{h.actorName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">({h.actorRole})</span>
                      <span className="text-slate-500">transitioned:</span>
                      <StatusBadge status={h.fromStatus} size="sm" />
                      <span className="text-slate-500">→</span>
                      <StatusBadge status={h.toStatus} size="sm" />
                      <span className="text-[10px] text-slate-500 ml-auto font-mono">{h.createdAt}</span>
                    </div>
                    {h.feedback && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                        "{h.feedback}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No transition events recorded.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Immutable Audit Trail Modal */}
      {auditItem && (
        <Modal
          isOpen={!!auditItem}
          onClose={() => setAuditItem(null)}
          title={`Immutable Audit Trail: ${auditItem.title}`}
          description={`Verifiable audit events recorded in database table: audit_events`}
          maxWidth="2xl"
          footer={
            <div className="flex justify-end w-full">
              <Button variant="secondary" size="sm" onClick={() => setAuditItem(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {isLoadingAudit ? (
              <p className="text-xs text-slate-400 text-center py-6">Loading audit events from backend...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No audit records found for this resource.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between text-brand-300">
                    <span className="font-bold">{log.action}</span>
                    <span className="text-slate-500 text-[10px]">{log.created_at}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Event ID: <span className="text-slate-200">{log.id}</span>
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/60 p-1.5 rounded truncate">
                      Payload: {log.details}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
