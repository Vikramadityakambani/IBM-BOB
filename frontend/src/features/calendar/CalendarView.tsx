import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badge';
import { Calendar as CalendarIcon, Clock, Info } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const { contentItems } = useApp();

  const scheduledItems = contentItems.filter((c) => c.status === 'scheduled');

  // Days simulation for October 2026
  const calendarDays = [
    { day: 12, weekday: 'Mon', items: [] },
    { day: 13, weekday: 'Tue', items: [] },
    { day: 14, weekday: 'Wed', items: [] },
    { 
      day: 15, 
      weekday: 'Thu', 
      items: contentItems.filter((c) => c.status === 'approved' || c.id === 'cnt-2') 
    },
    { day: 16, weekday: 'Fri', items: [] },
    { day: 17, weekday: 'Sat', items: [] },
    { 
      day: 18, 
      weekday: 'Sun', 
      items: contentItems.filter((c) => c.id === 'cnt-4') 
    },
    { day: 19, weekday: 'Mon', items: [] },
    { day: 20, weekday: 'Tue', items: [] },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Notice Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-brand-400 shrink-0" />
        <span>
          <strong className="text-slate-200">Editorial Scheduling Notice:</strong> This calendar manages timezone-aware internal publishing targets for approved assets. Direct API auto-publishing is enabled as official platform credentials are configured.
        </span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-400" />
            <div>
              <CardTitle>Content Publishing Schedule — October 2026</CardTitle>
              <CardDescription>Timezone: UTC • Planned distribution matrix</CardDescription>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
            {scheduledItems.length} Posts Scheduled
          </span>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {calendarDays.map((d, index) => (
              <div 
                key={index} 
                className={`min-h-[160px] p-3 rounded-xl border flex flex-col justify-between transition-colors ${
                  d.items.length > 0 
                    ? 'bg-slate-850/80 border-slate-700 shadow-enterprise' 
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-750'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase">{d.weekday}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${d.items.length > 0 ? 'bg-brand-600 text-white' : 'text-slate-500'}`}>
                      Oct {d.day}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-2">
                    {d.items.map((item) => (
                      <div key={item.id} className="p-2 rounded-lg bg-slate-900 border border-slate-750 text-xs space-y-1.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <PlatformBadge platform={item.platform} size="sm" />
                          <StatusBadge status={item.status} size="sm" />
                        </div>
                        <p className="font-semibold text-slate-100 line-clamp-2 leading-tight">
                          {item.title}
                        </p>
                        {item.scheduledAt && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-2.5 h-2.5 text-brand-400" />
                            {item.scheduledAt}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {d.items.length === 0 && (
                  <span className="text-[11px] text-slate-600 italic block mt-auto">No releases planned</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
