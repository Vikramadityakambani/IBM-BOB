import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ContentItem } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';
import { StatusBadge, PlatformBadge, RoleBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  CheckCheck, 
  CheckCircle2, 
  RotateCcw, 
  MessageSquare, 
  ShieldAlert, 
  Clock, 
  UserCheck
} from 'lucide-react';

export const ReviewQueueView: React.FC = () => {
  const { 
    contentItems, 
    currentUser, 
    approveContent, 
    requestChanges, 
    brandProfile,
    setCurrentRole 
  } = useApp();

  const [selectedItemForFeedback, setSelectedItemForFeedback] = useState<ContentItem | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  // Pending review items
  const pendingItems = contentItems.filter((c) => c.status === 'in_review');

  const handleOpenRequestChanges = (item: ContentItem) => {
    setSelectedItemForFeedback(item);
    setFeedbackNote('Please refine the conclusion and add an explicit enterprise call-to-action.');
  };

  const handleConfirmRequestChanges = () => {
    if (selectedItemForFeedback && feedbackNote.trim()) {
      requestChanges(selectedItemForFeedback.id, feedbackNote);
      setSelectedItemForFeedback(null);
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
                Separation of Duties Policy (Agiloft Governance)
              </div>
              <p className="text-xs text-amber-400/90 mt-0.5">
                You are currently viewing as a <span className="font-bold underline">Creator</span>. Creators cannot self-approve submitted assets.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentRole('reviewer')}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            Switch to Reviewer (David Miller)
          </button>
        </div>
      )}

      {/* Review Queue Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Pending Review</span>
              <span className="text-2xl font-bold text-amber-400">{pendingItems.length}</span>
            </div>
            <Clock className="w-8 h-8 text-amber-500/30" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Active Reviewer</span>
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
              <span className="text-xs font-semibold text-emerald-400">Active & Enforced</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">{brandProfile.prohibitedPhrases.length} prohibited words blocked</span>
            </div>
            <CheckCheck className="w-8 h-8 text-emerald-500/30" />
          </CardContent>
        </Card>
      </div>

      {/* Queue Items */}
      {pendingItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/40 mx-auto" />
            <h3 className="text-base font-semibold text-slate-300">Review Queue is Clear!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are no content drafts waiting for editorial review. When creators submit briefs from AI Studio, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <Card key={item.id} variant="elevated">
              <CardHeader className="flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <PlatformBadge platform={item.platform} />
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-300 font-semibold">{item.format}</span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs text-slate-400">Language: {item.language}</span>
                </div>
                <StatusBadge status={item.status} />
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Submitted by <span className="text-slate-200 font-medium">{item.authorName}</span></span>
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

                {/* Comments Thread */}
                {item.comments.length > 0 && (
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-brand-400" />
                      Review Notes & Creator Comments ({item.comments.length})
                    </span>
                    {item.comments.map((cm) => (
                      <div key={cm.id} className="text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="flex items-center justify-between font-semibold text-slate-300">
                          <span>{cm.authorName} ({cm.authorRole})</span>
                          <span className="text-[10px] text-slate-500 font-mono">{cm.createdAt}</span>
                        </div>
                        <p className="text-slate-300 mt-1">{cm.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex-wrap gap-2 justify-between">
                <div className="text-xs text-slate-500 italic">
                  Action will be permanently recorded in the immutable audit event log.
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenRequestChanges(item)}
                    disabled={currentUser.role === 'creator'}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5 text-amber-400" />}
                  >
                    Request Changes
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => approveContent(item.id)}
                    disabled={currentUser.role === 'creator'}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Approve Content
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Request Changes Modal */}
      {selectedItemForFeedback && (
        <Modal
          isOpen={!!selectedItemForFeedback}
          onClose={() => setSelectedItemForFeedback(null)}
          title="Request Changes & Provide Feedback"
          description={`Return "${selectedItemForFeedback.title}" to Draft with mandatory reviewer notes.`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="secondary" size="sm" onClick={() => setSelectedItemForFeedback(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmRequestChanges}>
                Return to Draft
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Revision Notes & Specific Changes Required:
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
    </div>
  );
};
