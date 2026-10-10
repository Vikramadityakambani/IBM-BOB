import React from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { RoleBadge } from '../../components/ui/Badge';
import { Shield, KeyRound, Server, Users, Check, X } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentWorkspace } = useApp();

  const teamMembers = [
    { name: 'Sarah Lin', email: 'creator@demo.com', role: 'creator', status: 'Active' },
    { name: 'David Miller', email: 'reviewer@demo.com', role: 'reviewer', status: 'Active' },
    { name: 'Elena Vance', email: 'admin@demo.com', role: 'admin', status: 'Active' },
  ] as const;

  const permissions = [
    { action: 'Generate & Edit AI Drafts', creator: true, reviewer: true, admin: true },
    { action: 'Submit Content for Review', creator: true, reviewer: true, admin: true },
    { action: 'Approve Content Items', creator: false, reviewer: true, admin: true },
    { action: 'Request Revisions & Reject Drafts', creator: false, reviewer: true, admin: true },
    { action: 'Assign Publishing Schedules', creator: false, reviewer: true, admin: true },
    { action: 'Manage Brand Voice & Forbidden Words', creator: false, reviewer: false, admin: true },
    { action: 'Manage Workspace & Team Access', creator: false, reviewer: false, admin: true },
    { action: 'Access Immutable Audit Trail', creator: false, reviewer: true, admin: true },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-base font-bold text-slate-100">Workspace Settings & Administration</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Role-based access permissions, team directory, and backend AI provider orchestration status.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team Members */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <CardTitle>Team Members & Assigned Roles</CardTitle>
              </div>
              <span className="text-xs text-slate-400">{currentWorkspace.name}</span>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-800">
                {teamMembers.map((member) => (
                  <div key={member.email} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{member.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{member.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={member.role} size="sm" />
                      <span className="text-[10px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60">
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Orchestration & Backend Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <CardTitle>AI Orchestration & Trust Boundaries</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current AI Provider Mode:</span>
                  <span className="font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                    Mock Adapter (Zero Token Cost)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Extensible Providers:</span>
                  <span className="text-slate-300">OpenAI, Google Gemini, IBM watsonx</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Database Layer:</span>
                  <span className="text-slate-300 font-mono">PostgreSQL / SQLite fallback</span>
                </div>
              </div>

              <div className="bg-brand-950/40 border border-brand-800/50 p-3 rounded-lg flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-brand-300 leading-relaxed">
                  <strong>Zero Client Secrets:</strong> Model keys and tokens remain exclusively in the backend runtime environment. Frontend clients never transmit or store sensitive LLM API keys.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agiloft-inspired Permission Matrix */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-brand-400" />
                <CardTitle>Role Permission Matrix</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Platform Capability</th>
                    <th className="px-3 py-3 text-center">Creator</th>
                    <th className="px-3 py-3 text-center">Reviewer</th>
                    <th className="px-3 py-3 text-center">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {permissions.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-medium text-slate-200">{p.action}</td>
                      <td className="px-3 py-3 text-center">
                        {p.creator ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.reviewer ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {p.admin ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
