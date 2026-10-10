import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Platform, Tone, Language } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { PlatformBadge, StatusBadge } from '../../components/ui/Badge';
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
  Share2
} from 'lucide-react';

export const AIStudioView: React.FC = () => {
  const { brandProfile, campaigns, createContent, submitForReview, addToast } = useApp();

  // Form State
  const [topic, setTopic] = useState('Why modern software architecture demands verifiable governance workflows');
  const [platform, setPlatform] = useState<Platform>('linkedin');
  const [format] = useState('Thought-Leadership Article');
  const [tone, setTone] = useState<Tone>('Thought-Leadership');
  const [language, setLanguage] = useState<Language>('English');
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Quality check simulation
  const checkProhibitedPhrases = () => {
    return brandProfile.prohibitedPhrases.filter((phrase) =>
      generatedBody.toLowerCase().includes(phrase.toLowerCase())
    );
  };
  const prohibitedFound = checkProhibitedPhrases();

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      let newTitle = '';
      let newBody = '';

      if (language === 'Hindi') {
        newTitle = `आधुनिक एंटरप्राइज आर्किटेक्चर और सुरक्षित गवर्नेंस: ${topic}`;
        newBody = `एंटरप्राइज इंजीनियरिंग में गति के साथ-साथ गवर्नेंस भी अत्यंत आवश्यक है।\n\nजब हम डिजिटल सामग्री का निर्माण करते हैं, तो ब्रांड की विश्वसनीयता और सुरक्षा सबसे महत्वपूर्ण होती है।\n1. मॉडल सीक्रेट्स और कीज़ सर्वर-साइड सुरक्षित रहें।\n2. कंटेंट रिव्यू और अप्रूवल की स्पष्ट प्रक्रिया हो।\n\n#एंटरप्राइज #सॉफ्टवेयरइंजीनियरिंग #आर्किटेक्चर`;
      } else if (language === 'Marathi') {
        newTitle = `आधुनिक एंटरप्राइज आर्किटेक्चर आणि पडताळणीयोग्य गव्हर्नन्स: ${topic}`;
        newBody = `एंटरप्राइज सॉफ्टवेअर क्षेत्रात वेगापेक्षा सुरक्षा आणि विश्वासार्हता अधिक महत्त्वाची आहे.\n\nसामग्री तयार करताना खालील 3 गोष्टी लक्षात ठेवल्या पाहिजेत:\n1. सर्व सुरक्षितता मानके पाळली जाणे.\n2. पुनरावलोकन आणि मंजुरी प्रक्रियेचा स्पष्ट मार्ग असणे.\n\n#एंटरप्राइज #मराठी #तंत्रज्ञान`;
      } else {
        newTitle = `${tone} Analysis: ${topic}`;
        newBody = `In modern multi-channel operations, ${topic.toLowerCase()} has transitioned from a theoretical ideal into a competitive necessity.\n\nBy leveraging structured brand guidelines and strict state machine transitions, teams ensure every published asset meets compliance standards.\n\nKey takeaways:\n• Zero secret leakage across clients.\n• Mandatory human reviewer approval checkpoints.\n• Measurable audience resonance with ${brandProfile.name}.\n\nWhat are your thoughts on this strategy?`;
      }

      setGeneratedTitle(newTitle);
      setGeneratedBody(newBody);
      addToast({
        type: 'success',
        title: 'Draft Generated Successfully',
        message: `Applied brand profile "${brandProfile.name}" with ${tone} tone.`,
      });
    }, 900);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'shorten') {
      const sentences = generatedBody.split('\n\n');
      setGeneratedBody(sentences.slice(0, 2).join('\n\n') + '\n\n#QuickTake');
      addToast({ type: 'info', title: 'Draft Shortened', message: 'Condensed text for high-impact readability.' });
    } else if (action === 'expand') {
      setGeneratedBody(
        generatedBody + '\n\nDeep Dive: Enterprise teams adopting this methodology report a 3.4x reduction in review latency and zero unauthorized brand deviations.'
      );
      addToast({ type: 'info', title: 'Draft Expanded', message: 'Added supporting enterprise context and metrics.' });
    } else if (action === 'repurpose_x') {
      setPlatform('x');
      setGeneratedBody(
        `🚨 Why governance matters in enterprise AI:\n\n1/3 Velocity without guardrails creates debt.\n2/3 Isolate LLM keys server-side.\n3/3 Never allow self-approval for production copy.\n\nFull breakdown below 👇`
      );
      addToast({ type: 'info', title: 'Repurposed for X (Twitter)', message: 'Adjusted length and thread syntax.' });
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

  const handleSaveAndSubmit = () => {
    const item = createContent({
      title: generatedTitle,
      body: generatedBody,
      platform,
      format,
      language,
      tone,
      campaignId: selectedCampaignId,
    });
    submitForReview(item.id);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Brand Voice Banner */}
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
              Target Audience: <span className="text-slate-300">{brandProfile.audience}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">
            {brandProfile.preferredTerms.length} Approved Keywords
          </span>
          <span className="px-2 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
            {brandProfile.prohibitedPhrases.length} Restricted Terms
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Brief Input Form */}
        <div className="lg:col-span-5 space-y-5">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Creative Brief & Parameters</CardTitle>
                <CardDescription>Configure target platform, audience objective, and tone.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Topic / Brief Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Topic / Creative Brief
                </label>
                <textarea
                  rows={3}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-750 text-slate-100 text-sm p-3 focus:outline-none focus:border-brand-500"
                  placeholder="e.g. Announcing our new enterprise cloud security certification..."
                />
              </div>

              {/* Platform Selector */}
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

              {/* Tone & Language row */}
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
                    className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                  </select>
                </div>
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

        {/* Right Column: Interactive Output Editor & Quality Scorecard */}
        <div className="lg:col-span-7 space-y-5">
          <Card variant="elevated">
            <CardHeader className="flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={platform} />
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-300 font-medium">{format}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-brand-300 bg-brand-950/70 border border-brand-800/40 px-2 py-0.5 rounded">
                  {language}
                </span>
              </div>
              <StatusBadge status="draft" />
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Editable Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Draft Title</label>
                <input
                  type="text"
                  value={generatedTitle}
                  onChange={(e) => setGeneratedTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 font-semibold text-base text-slate-100 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Editable Body */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Generated Copy & Structure</label>
                <textarea
                  rows={10}
                  value={generatedBody}
                  onChange={(e) => setGeneratedBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 font-sans text-sm text-slate-200 leading-relaxed rounded-lg p-3.5 focus:outline-none focus:border-brand-500 whitespace-pre-wrap"
                />
              </div>

              {/* Quick AI Refining Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> AI Actions:
                </span>
                <button
                  onClick={() => handleQuickAction('shorten')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Minimize2 className="w-3 h-3" /> Shorten
                </button>
                <button
                  onClick={() => handleQuickAction('expand')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" /> Expand
                </button>
                <button
                  onClick={() => handleQuickAction('repurpose_x')}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <Share2 className="w-3 h-3" /> Repurpose for X
                </button>
                <button
                  onClick={handleGenerate}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md border border-slate-700 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>

              {/* Advisory Quality Checker Card */}
              <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Advisory Content Quality Check
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Characters: {generatedBody.length} / 3000
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Readability Index</span>
                    <span className="font-bold text-emerald-400 text-sm">92 / 100</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Brand Voice Match</span>
                    <span className="font-bold text-brand-300 text-sm">98% (High)</span>
                  </div>

                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Restricted Words</span>
                    {prohibitedFound.length > 0 ? (
                      <span className="font-bold text-rose-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {prohibitedFound.join(', ')}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-400 text-sm">0 Found (Clean)</span>
                    )}
                  </div>
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
