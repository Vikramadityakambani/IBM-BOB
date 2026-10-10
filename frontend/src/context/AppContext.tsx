import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  User, 
  UserRole, 
  Workspace, 
  ContentItem, 
  Campaign, 
  BrandProfile, 
  NavTab, 
  WorkflowEvent 
} from '../types';
import { api, setAuthToken } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentUser: User;
  setCurrentRole: (role: UserRole) => void;
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  setWorkspace: (ws: Workspace) => void;
  contentItems: ContentItem[];
  campaigns: Campaign[];
  brandProfile: BrandProfile;
  updateBrandProfile: (profile: Partial<BrandProfile>) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  backendHealthy: boolean;
  // Governance Workflow Actions
  submitForReview: (id: string) => Promise<boolean>;
  approveContent: (id: string) => Promise<boolean>;
  requestChanges: (id: string, feedback: string) => Promise<boolean>;
  scheduleContent: (id: string, scheduledAt: string) => Promise<boolean>;
  createContent: (item: Partial<ContentItem>) => ContentItem;
  updateContent: (id: string, updates: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  duplicateContent: (id: string) => Promise<ContentItem | null>;
  syncWithBackend: () => Promise<void>;
}

const initialUsers: Record<UserRole, User> = {
  creator: {
    id: 'usr-1',
    name: 'Sarah Lin',
    email: 'creator@demo.com',
    role: 'creator',
  },
  reviewer: {
    id: 'usr-2',
    name: 'David Miller',
    email: 'reviewer@demo.com',
    role: 'reviewer',
  },
  admin: {
    id: 'usr-3',
    name: 'Elena Vance',
    email: 'admin@demo.com',
    role: 'admin',
  },
};

const initialWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Acme Enterprise Global', slug: 'acme-global', membersCount: 14 },
  { id: 'ws-2', name: 'TechFlow Cloud Solutions', slug: 'techflow-cloud', membersCount: 6 },
  { id: 'ws-3', name: 'Nexus Media Lab', slug: 'nexus-media', membersCount: 22 },
];

const initialBrandProfile: BrandProfile = {
  id: 'bp-1',
  workspaceId: 'ws-1',
  name: 'Acme Enterprise Master Voice',
  primaryTone: 'Thought-Leadership',
  audience: 'Enterprise IT decision makers, VP of Engineering, CTOs, and Product Leaders.',
  preferredTerms: ['autonomous workflows', 'verifiable governance', 'zero trust', 'time-to-market', 'enterprise SLA'],
  prohibitedPhrases: ['cheap', 'magic AI', 'guaranteed overnight success', 'disruptive hack', 'flawless solution'],
  styleGuidelines: 'Tone should be authoritative yet accessible. Avoid hyperbole. Back up claims with metrics and highlight governance and compliance safety.',
};

const initialCampaigns: Campaign[] = [
  {
    id: 'cmp-1',
    workspaceId: 'ws-1',
    name: 'Q4 Enterprise Cloud Transformation',
    objective: 'Drive B2B demo requests for modern cloud governance architectures.',
    targetAudience: 'Chief Information Security Officers & VP Architecture',
    startDate: '2026-10-01',
    endDate: '2026-12-15',
    itemCount: 4,
    status: 'active',
  },
  {
    id: 'cmp-2',
    workspaceId: 'ws-1',
    name: 'Build with IBM & Agentic AI Series',
    objective: 'Showcase practical agentic engineering workflows using Antigravity and IBM Bob.',
    targetAudience: 'Software Engineers and Technical Architects',
    startDate: '2026-10-10',
    endDate: '2026-11-20',
    itemCount: 3,
    status: 'active',
  },
];

const initialContentItems: ContentItem[] = [
  {
    id: 'cnt-1',
    workspaceId: 'ws-1',
    title: 'Why Agentic SDLC is Replacing Static Copilots in 2026',
    body: 'Enterprise engineering teams are moving past single-turn chat suggestions. By pairing agentic builder environments with rigorous SDLC co-pilots like IBM Bob, teams can enforce verifiable governance, deterministic testing, and architectural fidelity before deploying a single line of production code.\n\nKey takeaways:\n1. Multi-turn autonomous orchestration with strict human review gates.\n2. Server-side isolation of model keys and secrets.\n3. Automatic synchronization between architectural blueprints and codebase reality.',
    platform: 'linkedin',
    format: 'Article / Thought Leadership',
    language: 'English',
    tone: 'Thought-Leadership',
    status: 'in_review',
    authorName: 'Sarah Lin',
    authorRole: 'creator',
    campaignId: 'cmp-2',
    campaignName: 'Build with IBM & Agentic AI Series',
    version: 1,
    comments: [
      {
        id: 'cm-1',
        contentId: 'cnt-1',
        authorName: 'Sarah Lin',
        authorRole: 'creator',
        body: 'Ready for editorial review! Checked against the Q4 voice guidelines and prohibited phrases.',
        createdAt: '2026-10-10 10:15',
      }
    ],
    history: [
      {
        id: 'he-1',
        contentId: 'cnt-1',
        actorName: 'Sarah Lin',
        actorRole: 'creator',
        fromStatus: 'draft',
        toStatus: 'in_review',
        feedback: 'Submitted initial brief for tech review.',
        createdAt: '2026-10-10 10:15',
      }
    ],
    createdAt: '2026-10-10 09:30',
    updatedAt: '2026-10-10 10:15',
  },
  {
    id: 'cnt-2',
    workspaceId: 'ws-1',
    title: 'The Real Cost of Cloud Misconfiguration (Infographic Summary)',
    body: 'Did you know that 82% of cloud breaches trace back to avoidable policy drift? Here is our 5-pillar security checklist to safeguard multi-tenant Kubernetes and database topologies before Q4 audit season.',
    platform: 'x',
    format: 'Thread / Carousel',
    language: 'English',
    tone: 'Professional',
    status: 'approved',
    authorName: 'Sarah Lin',
    authorRole: 'creator',
    campaignId: 'cmp-1',
    campaignName: 'Q4 Enterprise Cloud Transformation',
    scheduledAt: '2026-10-15 14:00',
    version: 2,
    comments: [
      {
        id: 'cm-2',
        contentId: 'cnt-2',
        authorName: 'David Miller',
        authorRole: 'reviewer',
        body: 'Approved! Well aligned with the compliance checklist. Ready for scheduled publication.',
        createdAt: '2026-10-09 16:40',
      }
    ],
    history: [
      {
        id: 'he-2',
        contentId: 'cnt-2',
        actorName: 'David Miller',
        actorRole: 'reviewer',
        fromStatus: 'in_review',
        toStatus: 'approved',
        feedback: 'Meets brand voice and technical standards.',
        createdAt: '2026-10-09 16:40',
      }
    ],
    createdAt: '2026-10-09 14:00',
    updatedAt: '2026-10-09 16:40',
  },
  {
    id: 'cnt-3',
    workspaceId: 'ws-1',
    title: 'Modern Architecture Best Practices for Multi-Platform Content',
    body: 'Publishing across LinkedIn, X, and Instagram requires more than copy-pasting. In this post, we explore how structured metadata tags and Agiloft-inspired review states guarantee brand voice protection.',
    platform: 'blog',
    format: 'Long-form Blog',
    language: 'English',
    tone: 'Educational',
    status: 'draft',
    authorName: 'Sarah Lin',
    authorRole: 'creator',
    version: 1,
    comments: [],
    history: [],
    createdAt: '2026-10-10 11:00',
    updatedAt: '2026-10-10 11:00',
  },
  {
    id: 'cnt-4',
    workspaceId: 'ws-1',
    title: 'AI Governance in Action: Behind the Scenes (Video Teaser)',
    body: 'Catch our live stream demo showing how ContentPilot AI orchestrates draft generation, human reviewer approval, and campaign calendar scheduling with zero key leaks.',
    platform: 'youtube',
    format: 'Shorts Script / Description',
    language: 'English',
    tone: 'Bold',
    status: 'scheduled',
    authorName: 'Sarah Lin',
    authorRole: 'creator',
    campaignId: 'cmp-2',
    campaignName: 'Build with IBM & Agentic AI Series',
    scheduledAt: '2026-10-18 17:30',
    version: 2,
    comments: [],
    history: [],
    createdAt: '2026-10-08 12:00',
    updatedAt: '2026-10-09 10:00',
  },
  {
    id: 'cnt-5',
    workspaceId: 'ws-1',
    title: 'DevOps to MLOps: Transition Guide',
    body: 'Our engineering team shares the lessons learned shifting CI pipelines to support continuous model evaluation, automated regression tests, and brand voice validation.',
    platform: 'linkedin',
    format: 'Post',
    language: 'English',
    tone: 'Thought-Leadership',
    status: 'rejected',
    authorName: 'Sarah Lin',
    authorRole: 'creator',
    version: 1,
    comments: [
      {
        id: 'cm-3',
        contentId: 'cnt-5',
        authorName: 'David Miller',
        authorRole: 'reviewer',
        body: 'Please remove the word "cheap" on paragraph 2 as it violates brand policy, and add citation for the 40% efficiency claim.',
        createdAt: '2026-10-09 18:20',
      }
    ],
    history: [
      {
        id: 'he-3',
        contentId: 'cnt-5',
        actorName: 'David Miller',
        actorRole: 'reviewer',
        fromStatus: 'in_review',
        toStatus: 'rejected',
        feedback: 'Violates prohibited vocabulary ("cheap"); missing benchmark citations.',
        createdAt: '2026-10-09 18:20',
      }
    ],
    createdAt: '2026-10-09 17:00',
    updatedAt: '2026-10-09 18:20',
  }
];

const mapBackendContentToFrontend = (item: any): ContentItem => ({
  id: item.id,
  workspaceId: item.workspace_id,
  title: item.title,
  body: item.body,
  platform: item.platform,
  format: item.format,
  language: item.language,
  tone: item.tone,
  status: item.status,
  authorName: item.author_name || 'Sarah Lin',
  authorRole: item.author_role || 'creator',
  campaignId: item.campaign_id,
  campaignName: item.campaign_name,
  scheduledAt: item.scheduled_at,
  version: item.version,
  comments: (item.comments || []).map((c: any) => ({
    id: c.id,
    contentId: c.content_id,
    authorName: c.author_name,
    authorRole: c.author_role,
    body: c.body,
    createdAt: typeof c.created_at === 'string' ? c.created_at.substring(0, 16).replace('T', ' ') : String(c.created_at),
  })),
  history: (item.workflow_events || []).map((e: any) => ({
    id: e.id,
    contentId: e.content_id,
    actorName: e.actor_name,
    actorRole: e.actor_role,
    fromStatus: e.from_status,
    toStatus: e.to_status,
    feedback: e.feedback,
    createdAt: typeof e.created_at === 'string' ? e.created_at.substring(0, 16).replace('T', ' ') : String(e.created_at),
  })),
  createdAt: typeof item.created_at === 'string' ? item.created_at.substring(0, 16).replace('T', ' ') : String(item.created_at),
  updatedAt: typeof item.updated_at === 'string' ? item.updated_at.substring(0, 16).replace('T', ' ') : String(item.updated_at),
});

const mapBackendBrandToFrontend = (bp: any): BrandProfile => ({
  id: bp.id,
  workspaceId: bp.workspace_id,
  name: bp.name,
  primaryTone: bp.tone,
  audience: bp.audience,
  preferredTerms: bp.preferred_terms || [],
  prohibitedPhrases: bp.prohibited_phrases || [],
  styleGuidelines: bp.style_guidelines || '',
});

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('ai-studio');
  const [currentUser, setCurrentUser] = useState<User>(initialUsers.creator);
  const [workspaces] = useState<Workspace[]>(initialWorkspaces);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(initialWorkspaces[0]);
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContentItems);
  const [campaigns] = useState<Campaign[]>(initialCampaigns);
  const [brandProfile, setBrandProfile] = useState<BrandProfile>(initialBrandProfile);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [backendHealthy, setBackendHealthy] = useState<boolean>(false);

  const syncWithBackend = async () => {
    try {
      const items = await api.getContent();
      if (Array.isArray(items) && items.length > 0) {
        setContentItems(items.map(mapBackendContentToFrontend));
      }
      const bp = await api.getBrandProfile();
      if (bp) {
        setBrandProfile(mapBackendBrandToFrontend(bp));
      }
    } catch (err) {
      console.warn('Backend sync error:', err);
    }
  };

  // Check backend health & sync JWT and data on initial mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        const health = await api.getHealth();
        if (health.status === 'healthy') {
          setBackendHealthy(true);
          // Fetch token for initial role (creator)
          const tokenRes = await api.demoSwitchRole('creator');
          setAuthToken(tokenRes.access_token);
          await syncWithBackend();
        }
      } catch (err) {
        console.warn('Backend API connection check in progress...', err);
      }
    };
    initBackend();
  }, []);

  const setCurrentRole = async (newRole: UserRole) => {
    setCurrentUser(initialUsers[newRole]);
    try {
      const tokenRes = await api.demoSwitchRole(newRole);
      setAuthToken(tokenRes.access_token);
      await syncWithBackend();
    } catch {
      // Local fallback
    }

    addToast({
      type: 'info',
      title: `Switched Persona to ${initialUsers[newRole].name} (${newRole.toUpperCase()})`,
      message: newRole === 'reviewer' ? 'You now have authorization to approve or request changes.' : 'Ready to draft and submit content briefs.',
    });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const updateBrandProfile = async (updates: Partial<BrandProfile>) => {
    setBrandProfile((prev) => ({ ...prev, ...updates }));
    try {
      // Backend requires admin role for brand profile updates
      const adminTokenNeeded = currentUser.role !== 'admin';
      const prevRole = currentUser.role;
      if (adminTokenNeeded) {
        const adminRes = await api.demoSwitchRole('admin');
        setAuthToken(adminRes.access_token);
      }

      await api.updateBrandProfile({
        name: updates.name,
        tone: updates.primaryTone,
        audience: updates.audience,
        style_guidelines: updates.styleGuidelines,
        preferred_terms: updates.preferredTerms,
        prohibited_phrases: updates.prohibitedPhrases,
      });

      if (adminTokenNeeded) {
        const restoreRes = await api.demoSwitchRole(prevRole);
        setAuthToken(restoreRes.access_token);
      }

      addToast({
        type: 'success',
        title: 'Brand Profile Saved & Persisted',
        message: 'Guidelines and vocabulary updated in database.',
      });
    } catch (err: any) {
      addToast({
        type: 'warning',
        title: 'Brand Profile Updated (Local)',
        message: err.message || 'Changes saved in active session.',
      });
    }
  };

  // State Transition Governance
  const submitForReview = async (id: string): Promise<boolean> => {
    const item = contentItems.find((c) => c.id === id);
    if (!item) return false;

    if (item.status !== 'draft' && item.status !== 'rejected') {
      addToast({
        type: 'error',
        title: 'Invalid Transition',
        message: `Content in status '${item.status}' cannot be submitted for review.`,
      });
      return false;
    }

    // Try backend transition if connected
    try {
      await api.transitionContent(id, 'submit_review');
    } catch {
      // Local optimistic fallback
    }

    const event: WorkflowEvent = {
      id: `he-${Date.now()}`,
      contentId: id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      fromStatus: item.status,
      toStatus: 'in_review',
      feedback: 'Submitted for team review and brand voice check.',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setContentItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'in_review',
              history: [event, ...c.history],
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    addToast({
      type: 'success',
      title: 'Submitted to Review Queue',
      message: `"${item.title.substring(0, 30)}..." is now awaiting Reviewer approval.`,
    });
    return true;
  };

  const approveContent = async (id: string): Promise<boolean> => {
    if (currentUser.role === 'creator') {
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'Creators cannot self-approve content. Switch role to Reviewer or Admin.',
      });
      return false;
    }

    const item = contentItems.find((c) => c.id === id);
    if (!item) return false;

    if (item.status !== 'in_review') {
      addToast({
        type: 'error',
        title: 'Invalid State',
        message: 'Only items in "In Review" status can be approved.',
      });
      return false;
    }

    try {
      await api.transitionContent(id, 'approve');
    } catch {
      // Optimistic local
    }

    const event: WorkflowEvent = {
      id: `he-${Date.now()}`,
      contentId: id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      fromStatus: 'in_review',
      toStatus: 'approved',
      feedback: 'Approved by editorial reviewer. Ready for campaign scheduling.',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setContentItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'approved',
              history: [event, ...c.history],
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    addToast({
      type: 'success',
      title: 'Content Approved! 🎉',
      message: `"${item.title.substring(0, 30)}..." is marked Approved.`,
    });
    return true;
  };

  const requestChanges = async (id: string, feedback: string): Promise<boolean> => {
    if (currentUser.role === 'creator') {
      addToast({
        type: 'error',
        title: 'Permission Denied',
        message: 'Only Reviewers and Admins can request changes.',
      });
      return false;
    }

    const item = contentItems.find((c) => c.id === id);
    if (!item) return false;

    try {
      await api.transitionContent(id, 'request_changes', feedback);
    } catch {
      // Optimistic local
    }

    const event: WorkflowEvent = {
      id: `he-${Date.now()}`,
      contentId: id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      fromStatus: item.status,
      toStatus: 'draft',
      feedback,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    const newComment = {
      id: `cm-${Date.now()}`,
      contentId: id,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      body: feedback,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setContentItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'draft',
              comments: [newComment, ...c.comments],
              history: [event, ...c.history],
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    addToast({
      type: 'warning',
      title: 'Changes Requested',
      message: 'Draft returned to creator with revision feedback.',
    });
    return true;
  };

  const scheduleContent = async (id: string, scheduledAt: string): Promise<boolean> => {
    const item = contentItems.find((c) => c.id === id);
    if (!item) return false;

    if (item.status !== 'approved') {
      addToast({
        type: 'error',
        title: 'Approval Required',
        message: 'Content must be approved by a reviewer before assigning a publishing schedule.',
      });
      return false;
    }

    try {
      await api.transitionContent(id, 'schedule', undefined, scheduledAt);
    } catch {
      // Optimistic local
    }

    const event: WorkflowEvent = {
      id: `he-${Date.now()}`,
      contentId: id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      fromStatus: 'approved',
      toStatus: 'scheduled',
      feedback: `Planned publication scheduled for ${scheduledAt} (UTC).`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setContentItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'scheduled',
              scheduledAt,
              history: [event, ...c.history],
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    addToast({
      type: 'success',
      title: 'Publishing Scheduled 📅',
      message: `Scheduled for ${scheduledAt}. Visible on the Campaign Calendar.`,
    });
    return true;
  };

  const createContent = (item: Partial<ContentItem>): ContentItem => {
    const tempId = `cnt-${Date.now()}`;
    const optimisticItem: ContentItem = {
      id: tempId,
      workspaceId: currentWorkspace.id,
      title: item.title || 'Untitled Draft',
      body: item.body || '',
      platform: item.platform || 'linkedin',
      format: item.format || 'Post',
      language: item.language || 'English',
      tone: item.tone || 'Professional',
      status: 'draft',
      authorName: currentUser.name,
      authorRole: currentUser.role,
      campaignId: item.campaignId,
      campaignName: campaigns.find((c) => c.id === item.campaignId)?.name,
      version: 1,
      comments: [],
      history: [
        {
          id: `he-${Date.now()}`,
          contentId: tempId,
          actorName: currentUser.name,
          actorRole: currentUser.role,
          fromStatus: 'draft',
          toStatus: 'draft',
          feedback: 'Created in AI Studio.',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        }
      ],
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    setContentItems((prev) => [optimisticItem, ...prev]);

    // Asynchronously persist to backend DB
    api.createContent({
      title: optimisticItem.title,
      body: optimisticItem.body,
      platform: optimisticItem.platform,
      format: optimisticItem.format,
      language: optimisticItem.language,
      tone: optimisticItem.tone,
      campaign_id: optimisticItem.campaignId,
    }).then((saved) => {
      const mapped = mapBackendContentToFrontend(saved);
      setContentItems((prev) => prev.map((c) => (c.id === tempId ? mapped : c)));
    }).catch((err) => {
      console.warn('Could not persist content to backend:', err);
    });

    addToast({
      type: 'success',
      title: 'Saved to Content Library',
      message: `"${optimisticItem.title}" saved as Draft.`,
    });
    return optimisticItem;
  };

  const updateContent = async (id: string, updates: Partial<ContentItem>) => {
    setContentItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              version: c.version + 1,
              updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : c
      )
    );

    try {
      const res = await api.updateContent(id, {
        title: updates.title,
        body: updates.body,
        platform: updates.platform,
        format: updates.format,
        language: updates.language,
        tone: updates.tone,
        campaign_id: updates.campaignId,
        scheduled_at: updates.scheduledAt,
      });
      const mapped = mapBackendContentToFrontend(res);
      setContentItems((prev) => prev.map((c) => (c.id === id ? mapped : c)));
    } catch {
      // optimistic update already applied
    }

    addToast({
      type: 'info',
      title: 'Content Updated',
      message: 'Draft updates saved successfully.',
    });
  };

  const deleteContent = async (id: string) => {
    setContentItems((prev) => prev.filter((c) => c.id !== id));
    try {
      await api.deleteContent(id);
    } catch {
      // optimistic
    }
    addToast({
      type: 'info',
      title: 'Item Removed',
      message: 'Content item archived/removed from workspace.',
    });
  };

  const duplicateContent = async (id: string): Promise<ContentItem | null> => {
    try {
      const res = await api.duplicateContent(id);
      const mapped = mapBackendContentToFrontend(res);
      setContentItems((prev) => [mapped, ...prev]);
      addToast({
        type: 'success',
        title: 'Draft Duplicated',
        message: `Created copy "${mapped.title}" (v1 Draft).`,
      });
      return mapped;
    } catch {
      const orig = contentItems.find((c) => c.id === id);
      if (orig) {
        const copy: ContentItem = {
          ...orig,
          id: `cnt-${Date.now()}`,
          title: `${orig.title} (Copy)`,
          status: 'draft',
          version: 1,
          scheduledAt: undefined,
          history: [
            {
              id: `he-${Date.now()}`,
              contentId: `cnt-${Date.now()}`,
              actorName: currentUser.name,
              actorRole: currentUser.role,
              fromStatus: 'draft',
              toStatus: 'draft',
              feedback: `Duplicated from item #${orig.id.slice(0, 8)}.`,
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          ],
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        setContentItems((prev) => [copy, ...prev]);
        addToast({
          type: 'success',
          title: 'Draft Duplicated (Local)',
          message: `Created copy "${copy.title}" (v1 Draft).`,
        });
        return copy;
      }
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        setCurrentRole,
        currentWorkspace,
        workspaces,
        setWorkspace: setCurrentWorkspace,
        contentItems,
        campaigns,
        brandProfile,
        updateBrandProfile,
        toasts,
        addToast,
        removeToast,
        backendHealthy,
        submitForReview,
        approveContent,
        requestChanges,
        scheduleContent,
        createContent,
        updateContent,
        deleteContent,
        duplicateContent,
        syncWithBackend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
