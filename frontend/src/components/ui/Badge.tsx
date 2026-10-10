import React from 'react';
import type { ContentStatus, Platform, UserRole } from '../../types';
import { 
  FileEdit, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  XCircle, 
  FileText,
  Shield,
  CheckCheck,
  PenTool,
  Share2,
  Video,
  Globe,
  Camera
} from 'lucide-react';

export interface StatusBadgeProps {
  status: ContentStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs = {
    draft: {
      label: 'Draft',
      className: 'status-badge-draft',
      icon: FileEdit,
    },
    in_review: {
      label: 'In Review',
      className: 'status-badge-review',
      icon: Clock,
    },
    approved: {
      label: 'Approved',
      className: 'status-badge-approved',
      icon: CheckCircle2,
    },
    scheduled: {
      label: 'Scheduled',
      className: 'status-badge-scheduled',
      icon: Calendar,
    },
    rejected: {
      label: 'Changes Req / Rejected',
      className: 'status-badge-rejected',
      icon: XCircle,
    },
  };

  const config = configs[status] || configs.draft;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-full transition-colors ${sizeClasses} ${config.className}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export interface PlatformBadgeProps {
  platform: Platform;
  size?: 'sm' | 'md';
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, size = 'sm' }) => {
  const configs = {
    linkedin: {
      label: 'LinkedIn',
      className: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
      icon: Share2,
    },
    instagram: {
      label: 'Instagram',
      className: 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60',
      icon: Camera,
    },
    x: {
      label: 'X (Twitter)',
      className: 'bg-slate-900 text-slate-300 border-slate-700',
      icon: Globe,
    },
    youtube: {
      label: 'YouTube',
      className: 'bg-red-950/60 text-red-300 border-red-800/60',
      icon: Video,
    },
    blog: {
      label: 'Blog / Web',
      className: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
      icon: FileText,
    },
  };

  const config = configs[platform] || configs.blog;
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${config.className}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};

export interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  const configs = {
    creator: {
      label: 'Creator',
      className: 'bg-cyan-950/70 text-cyan-300 border-cyan-800',
      icon: PenTool,
    },
    reviewer: {
      label: 'Reviewer',
      className: 'bg-purple-950/70 text-purple-300 border-purple-800',
      icon: CheckCheck,
    },
    admin: {
      label: 'Workspace Admin',
      className: 'bg-amber-950/70 text-amber-300 border-amber-800',
      icon: Shield,
    },
  };

  const config = configs[role];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span className={`inline-flex items-center rounded-md border ${sizeClasses} ${config.className}`}>
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
    </span>
  );
};
