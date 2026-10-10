import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { Platform, Tone, Language } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badge';
import { api } from '../../services/api';
import { 
  Sparkles, 
  Send, 
  Save, 
  RefreshCw, 
  Minimize2, 
  Maximize2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  SlidersHorizontal,
  Share2,
  PenLine
} from 'lucide-react';

export const AIStudioView: React.FC = () => {
  const { brandProfile, campaigns, createContent, submitForReview, addToast } = useApp();

  // Form State
  const [topic, setTopic] = useState('Why modern software architecture demands verifiable governance workflows');
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [format, setFormat] = useState('Thought-Leadership Article');
  const [tone, setTone] = useState<Tone>('Thought-Leadership');
  const [language, setLanguage] = useState<Language>('English');
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [generatedTitle, setGeneratedTitle] = useState('Architectural Integrity: Why Verifiable Governance Outperforms Ad-Hoc Copilots');
  const [generatedBody, setGeneratedBody] = useState(
`In enterprise engineering, velocity without governance is just technical debt with higher throughput.

When evaluating agentic systems for complex SDLC pipelines, three architectural boundaries are non-negotiable:
1. Complete isolation of LLM credentials from frontend runtimes.
2. Server-side state machine enforcement that prevents unauthorized self-approvals.
3. Multi-turn co-pilots like IBM Bob delivering verifiable audit logs and regression tests.

Are your content workflows governed with the same rigor as your production deployments?

#EnterpriseArchitecture #AutonomousSystems #BuildWithIBM #SoftwareEngineering`
  );

  // Advisory Quality Scorecard State
  const [qualityScorecard, setQualityScorecard] = useState<{
    readabilityScore: number;
    charCount: number;
    charLimit: number;
    hasCta: boolean;
    prohibitedFound: string[];
    isCompliant: boolean;
    advisoryNotes: string[];
  }>({
    readabilityScore: 94,
    charCount: 680,
    charLimit: 3000,
    hasCta: true,
    prohibitedFound: [],
    isCompliant: true,
    advisoryNotes: ['Copy conforms to brand voice guidelines and platform formatting standards.']
  });

  // Evaluate quality check against live backend or local heuristics
  const runQualityCheck = async (text: string, targetPlatform: string) => {
    try {
      const res = await api.qualityCheckAI(text, targetPlatform);
      setQualityScorecard({
        readabilityScore: res.readability_score,
        charCount: res.char_count,
        charLimit: res.char_limit,
        hasCta: res.has_cta,
        prohibitedFound: res.prohibited_terms_found || [],
        isCompliant: res.is_brand_compliant,
        advisoryNotes: res.advisory_notes || []
      });
    } catch {
      // Local fallback heuristic
      const prohibited = brandProfile.prohibitedPhrases.filter(p => text.toLowerCase().includes(p.toLowerCase()));
      setQualityScorecard({
        readabilityScore: prohibited.length === 0 ? 92 : 60,
        charCount: text.length,
        charLimit: targetPlatform === 'linkedin' ? 3000 : (targetPlatform === 'x' ? 280 : 2200),
        hasCta: text.includes('?') || text.includes('👇'),
        prohibitedFound: prohibited,
        isCompliant: prohibited.length === 0,
        advisoryNotes: prohibited.length > 0 ? [`Prohibited phrases detected: ${prohibited.join(', ')}`] : ['Brand guidelines satisfied.']
      });
    }
  };

  useEffect(() => {
    runQualityCheck(generatedBody, platform);
  }, [generatedBody, platform]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setApiError(null);
    try {
      const result = await api.generateAI({
        topic,
        platform,
        format_type: format,
        tone,
        language
      });
      setGeneratedTitle(result.title);
      setGeneratedBody(result.body);
      addToast({
        type: 'success',
        title: 'Draft Generated Successfully',
        message: `Applied brand profile "${brandProfile.name}" with ${tone} tone in ${language}.`,
      });
    } catch (err: any) {
      console.warn('API generate error, using reliable fallback:', err);
      // Fallback generation without losing inputs
      let fallbackTitle = `${tone}: Analysis of ${topic}`;
      let fallbackBody = `In enterprise operations, ${topic.toLowerCase()} is vital.\n\n1. Ensure complete security.\n2. Apply Agiloft review governance.\n3. Track brand voice fidelity.\n\nWhat are your thoughts on this strategy?`;
      if (language === 'Hindi') {
        fallbackTitle = `${tone} विश्लेषण: ${topic}`;
        fallbackBody = `आधुनिक एंटरप्राइज आर्किटेक्चर और ${topic.toLowerCase()} के लिए स्पष्ट दिशानिर्देश जरूरी हैं।\n\n१. सर्वर सुरक्षा\n२. संपादकीय समीक्षा\n\nआपकी क्या राय है?`;
      }
      setGeneratedTitle(fallbackTitle);
      setGeneratedBody(fallbackBody);
      addToast({
        type: 'info',
        title: 'Draft Generated (Offline Mode)',
        message: `Generated local draft for ${platform} in ${language}.`,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineAction = async (action: string) => {
    setIsActionLoading(true);
    try {
      const res = await api.refineAI(generatedBody, action, tone);
      setGeneratedBody(res.refined_body);
      addToast({
        type: 'info',
        title: `AI Action Applied: ${action.toUpperCase()}`,
        message: 'Content updated with refined structure.',
      });
    } catch {
      // Local fallback
      if (action === 'shorten') {
        const paragraphs = generatedBody.split('\n\n');
        setGeneratedBody(paragraphs.slice(0, 2).join('\n\n') + '\n\n#QuickTake');
      } else if (action === 'expand') {
        setGeneratedBody(generatedBody + '\n\nDeep Dive: Enterprise teams report a 3.4x reduction in turnaround latency.');
      } else if (action === 'rewrite') {
        setGeneratedBody(`Reframed Perspective:\n${generatedBody}\n\nKey Takeaway: Governance empowers velocity.`);
      }
      addToast({ type: 'info', title: `Action Applied: ${action}`, message: 'Adjusted copy formatting.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRepurpose = async (targetPlatform: Platform) => {
    setIsActionLoading(true);
    try {
      const res = await api.repurposeAI(generatedBody, targetPlatform);
      setPlatform(targetPlatform);
      setGeneratedBody(res.adapted_body);
      addToast({
        type: 'success',
        title: `Repurposed for ${targetPlatform.toUpperCase()}`,
        message: 'Formatting and syntax adapted for target platform.',
      });
    } catch {
      setPlatform(targetPlatform);
      if (targetPlatform === 'x') {
        setGeneratedBody(`🧵 1/3 Summary:\n\n${generatedBody.slice(0, 200)}...\n\n2/3 Full analysis in our blog 👇`);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSaveDraft = () => {
    createContent({
      title: generatedTitle,
      body: generatedBody,
      platform,
      format,
      language,
      tone,
      campaignId: selectedCampaignId,
    });
  };

  const handleSaveAndSubmit = async () => {
    const item = createContent({
      title: generatedTitle,
      body: generatedBody,
      platform,
      format,
      language,
      tone,
      campaignId: selectedCampaignId,
    });
    await submitForReview(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Brand Voice Active Guardian Banner */}
      <div className="bg-gradient-to-r from-brand-950/70 via-slate-900 to-slate-900 border border-brand-800/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-300">Active Brand Voice Profile:</span>
              <span className="text-xs font-bold text-white bg-brand-950 px-2 py-0.5 rounded border border-brand-800/50">
                {brandProfile.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Audience: <span className="text-slate-300">{brandProfile.audience}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
            {brandProfile.preferredTerms.length} Approved Keywords
          </span>
          <span className="px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
            {brandProfile.prohibitedPhrases.length} Restricted Phrases
          </span>
        </div>
      </div>

      {apiError && (
        <div className="bg-rose-950/80 border border-rose-800 p-3 rounded-lg flex items-center gap-2 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Creative Brief Inputs */}
        <div className="lg:col-span-5 space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Creative Brief & Parameters</CardTitle>
                <CardDescription>Configure target platform, objective, tone, and language.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic / Brief Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic / Brief Intent
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-750 text-slate-100 text-sm p-3 focus:outline-none focus:border-brand-500 font-sans"
                  placeholder="e.g. Announcing our new enterprise cloud security certification..."
                />
              </div>

              {/* Target Platform Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['linkedin', 'x', 'instagram', 'youtube', 'blog'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={`text-xs py-2 px-2.5 rounded-lg border font-medium flex items-center justify-center gap-1.5 transition-all ${
                        platform === p
                          ? 'bg-brand-600/30 border-brand-500 text-brand-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <PlatformBadge platform={p} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone & Language Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tone of Voice
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Thought-Leadership">Thought-Leadership</option>
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual & Engaging</option>
                    <option value="Persuasive">Persuasive</option>
                    <option value="Bold">Bold & Provocative</option>
                    <option value="Educational">Educational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-medium"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                  </select>
                </div>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Content Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="Thought-Leadership Article">Thought-Leadership Article</option>
                  <option value="Thread / Hook Summary">Thread / Hook Summary</option>
                  <option value="Product Launch Brief">Product Launch Brief</option>
                  <option value="Short Form Video Script">Short Form Video Script</option>
                </select>
              </div>

              {/* Campaign Association */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Associate Campaign (Optional)
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="">None (Standalone Content)</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="primary"
                className="w-full py-2.5"
                isLoading={isGenerating}
                onClick={handleGenerate}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? 'Orchestrating Model...' : 'Generate Enterprise Draft'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Interactive Editor & Advisory Quality Scorecard */}
        <div className="lg:col-span-7 space-y-5">
          <Card variant="elevated">
            <CardHeader className="flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={platform} />
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-300 font-medium">{format}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-brand-300 bg-brand-950/70 border border-brand-800/40 px-2 py-0.5 rounded font-medium">
                  {language}
                </span>
              </div>
              <StatusBadge status="draft" />
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Editable Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Draft Title
                </label>
                <input
                  type="text"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 font-semibold text-base text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Editable Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Generated Copy (Rich Text Editor)
                </label>
                <textarea
                  rows={10}
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 font-sans text-sm text-slate-200 leading-relaxed rounded-lg p-3.5 focus:outline-none focus:border-brand-500 whitespace-pre-wrap"
                />
              </div>

              {/* Quick AI Refining Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-brand-400" /> Refine:
                  </span>
                  <button
                    onClick={() => handleRefineAction('shorten')}
                    disabled={isActionLoading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-750 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Minimize2 className="w-3 h-3" /> Shorten
                  </button>
                  <button
                    onClick={() => handleRefineAction('expand')}
                    disabled={isActionLoading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-750 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Maximize2 className="w-3 h-3" /> Expand
                  </button>
                  <button
                    onClick={() => handleRefineAction('rewrite')}
                    disabled={isActionLoading}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-750 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <PenLine className="w-3 h-3" /> Rewrite
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-750 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>

                {/* Repurpose Shortcuts */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
                    <Share2 className="w-3.5 h-3.5 text-sky-400" /> Repurpose:
                  </span>
                  {(['x', 'linkedin', 'instagram', 'youtube', 'blog'] as Platform[]).map((target) => (
                    <button
                      key={target}
                      onClick={() => handleRepurpose(target)}
                      disabled={isActionLoading || platform === target}
                      className={`text-xs px-2.5 py-1 rounded-md border capitalize transition-colors ${
                        platform === target
                          ? 'bg-brand-600/40 text-brand-200 border-brand-500 cursor-default'
                          : 'bg-slate-850 hover:bg-slate-750 text-slate-300 border-slate-750'
                      }`}
                    >
                      {target}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advisory Content Quality Check Scorecard */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Advisory Content Quality Check
                  </span>
                  <span className={`text-xs font-mono ${qualityScorecard.charCount > qualityScorecard.charLimit ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                    {qualityScorecard.charCount} / {qualityScorecard.charLimit} characters ({platform})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Readability Score</span>
                    <span className="font-bold text-emerald-400 text-sm">{qualityScorecard.readabilityScore} / 100</span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Call To Action</span>
                    <span className={`font-bold text-sm ${qualityScorecard.hasCta ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {qualityScorecard.hasCta ? 'Detected' : 'Missing'}
                    </span>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Restricted Words</span>
                    {qualityScorecard.prohibitedFound.length > 0 ? (
                      <span className="font-bold text-rose-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {qualityScorecard.prohibitedFound.join(', ')}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-400 text-sm">0 Found (Clean)</span>
                    )}
                  </div>
                </div>

                {/* Advisory Notes List */}
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                  <span className="font-semibold text-slate-300">Advisory Recommendation: </span>
                  {qualityScorecard.advisoryNotes.join(' ')}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex-wrap gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleSaveDraft}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save as Draft
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveAndSubmit}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit for Review
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
