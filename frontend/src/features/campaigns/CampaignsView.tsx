import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badge';
import { Target, Calendar, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CampaignsView: React.FC = () => {
  const { campaigns, contentItems, addToast } = useApp();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Marketing & Editorial Campaigns</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Group related multi-channel content assets into strategic business initiatives.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => addToast({ type: 'info', title: 'New Campaign', message: 'Campaign wizard will be available in Phase 6.' })}
        >
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((cmp) => {
          const linkedItems = contentItems.filter((c) => c.campaignId === cmp.id);
          const approvedCount = linkedItems.filter((c) => c.status === 'approved' || c.status === 'scheduled').length;

          return (
            <Card key={cmp.id} variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle>{cmp.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{cmp.startDate} to {cmp.endDate}</span>
                    </CardDescription>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-950 text-brand-300 border border-brand-800">
                  {cmp.status}
                </span>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-0.5">Objective:</span>
                  {cmp.objective}
                </div>

                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-0.5">Target Audience:</span>
                  {cmp.targetAudience}
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Governance Completion</span>
                    <span className="font-semibold text-brand-300 font-mono">
                      {approvedCount} / {linkedItems.length} Assets Ready
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${linkedItems.length ? (approvedCount / linkedItems.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                {/* Linked Content Items */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 block mb-2">
                    Linked Assets ({linkedItems.length}):
                  </span>
                  <div className="space-y-2">
                    {linkedItems.map((item) => (
                      <div key={item.id} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate mr-2">
                          <PlatformBadge platform={item.platform} size="sm" />
                          <span className="font-medium text-slate-200 truncate">{item.title}</span>
                        </div>
                        <StatusBadge status={item.status} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
