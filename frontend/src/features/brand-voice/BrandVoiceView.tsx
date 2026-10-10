import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Plus, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Tone } from '../../types';

export const BrandVoiceView: React.FC = () => {
  const { brandProfile, updateBrandProfile } = useApp();

  const [profileName, setProfileName] = useState(brandProfile.name);
  const [tone, setTone] = useState<Tone>(brandProfile.primaryTone);
  const [audience, setAudience] = useState(brandProfile.audience);
  const [guidelines, setGuidelines] = useState(brandProfile.styleGuidelines);
  const [preferredTerms, setPreferredTerms] = useState<string[]>(brandProfile.preferredTerms);
  const [prohibitedPhrases, setProhibitedPhrases] = useState<string[]>(brandProfile.prohibitedPhrases);

  const [newKeyword, setNewKeyword] = useState('');
  const [newProhibited, setNewProhibited] = useState('');

  // Synchronize state when brandProfile loads from backend
  useEffect(() => {
    setProfileName(brandProfile.name);
    setTone(brandProfile.primaryTone);
    setAudience(brandProfile.audience);
    setGuidelines(brandProfile.styleGuidelines);
    setPreferredTerms(brandProfile.preferredTerms);
    setProhibitedPhrases(brandProfile.prohibitedPhrases);
  }, [brandProfile]);

  // Live validator test input
  const [testSnippet, setTestSnippet] = useState('Our cheap AI solution delivers disruptive hacks for enterprise cloud.');

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !preferredTerms.includes(newKeyword.trim())) {
      setPreferredTerms([...preferredTerms, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (term: string) => {
    setPreferredTerms(preferredTerms.filter((t) => t !== term));
  };

  const handleAddProhibited = () => {
    if (newProhibited.trim() && !prohibitedPhrases.includes(newProhibited.trim())) {
      setProhibitedPhrases([...prohibitedPhrases, newProhibited.trim()]);
      setNewProhibited('');
    }
  };

  const handleRemoveProhibited = (term: string) => {
    setProhibitedPhrases(prohibitedPhrases.filter((t) => t !== term));
  };

  const handleSave = () => {
    updateBrandProfile({
      name: profileName,
      primaryTone: tone,
      audience,
      styleGuidelines: guidelines,
      preferredTerms,
      prohibitedPhrases,
    });
  };

  // Test snippet matches
  const flaggedTerms = prohibitedPhrases.filter((p) =>
    testSnippet.toLowerCase().includes(p.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Brand Voice & Governance Rules</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure linguistic guidelines, target demographics, and forbidden phrases automatically injected into prompt builders.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} leftIcon={<ShieldCheck className="w-4 h-4" />}>
          Save Brand Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Rules Config */}
        <div className="lg:col-span-7 space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Core Voice Guidelines</CardTitle>
              <CardDescription>Primary tone and strategic persona specifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as Tone)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500"
                >
                  <option value="Thought-Leadership">Thought-Leadership</option>
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Persuasive">Persuasive</option>
                  <option value="Bold">Bold</option>
                  <option value="Educational">Educational</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Audience</label>
                <textarea
                  rows={2}
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Style Guidelines</label>
                <textarea
                  rows={4}
                  value={guidelines}
                  onChange={(e) => setGuidelines(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Approved & Prohibited Vocabulary */}
          <Card>
            <CardHeader>
              <CardTitle>Vocabulary Guardrails</CardTitle>
              <CardDescription>Approved keywords to emphasize and prohibited terms to strictly prevent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Preferred terms */}
              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1.5">
                  Approved Keywords / Preferred Vocabulary ({preferredTerms.length})
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {preferredTerms.map((term) => (
                    <span key={term} className="bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span>{term}</span>
                      <button onClick={() => handleRemoveKeyword(term)} className="hover:text-emerald-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add approved phrase..."
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                    className="flex-1 bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
                  />
                  <Button variant="secondary" size="sm" onClick={handleAddKeyword} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add
                  </Button>
                </div>
              </div>

              {/* Prohibited terms */}
              <div>
                <label className="block text-xs font-semibold text-rose-400 mb-1.5">
                  Prohibited Phrases / Banned Terms ({prohibitedPhrases.length})
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {prohibitedPhrases.map((phrase) => (
                    <span key={phrase} className="bg-rose-950/60 text-rose-300 border border-rose-800/60 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span>{phrase}</span>
                      <button onClick={() => handleRemoveProhibited(phrase)} className="hover:text-rose-100">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add prohibited term (e.g. cheap, magic AI)..."
                    value={newProhibited}
                    onChange={(e) => setNewProhibited(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddProhibited())}
                    className="flex-1 bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-500"
                  />
                  <Button variant="danger" size="sm" onClick={handleAddProhibited} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Brand Safety Tester */}
        <div className="lg:col-span-5 space-y-5">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Interactive Brand Safety Tester</CardTitle>
              <CardDescription>Test any copy snippet in real time against your brand guidelines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sample Copy to Test</label>
                <textarea
                  rows={4}
                  value={testSnippet}
                  onChange={(e) => setTestSnippet(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-750 text-xs text-slate-200 rounded-lg p-3 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              {/* Real-time result */}
              <div className={`p-4 rounded-xl border ${flaggedTerms.length > 0 ? 'bg-rose-950/30 border-rose-800/60 text-rose-200' : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'}`}>
                <div className="flex items-center gap-2 font-semibold text-xs">
                  {flaggedTerms.length > 0 ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span>Brand Voice Violation Detected ({flaggedTerms.length} restricted terms)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>100% Brand Compliant — No Restricted Words</span>
                    </>
                  )}
                </div>

                {flaggedTerms.length > 0 && (
                  <div className="mt-2 text-xs">
                    <p className="text-rose-300 mb-1">Banned vocabulary found in test copy:</p>
                    <div className="flex flex-wrap gap-1">
                      {flaggedTerms.map((t) => (
                        <span key={t} className="bg-rose-900/80 text-rose-100 font-bold px-2 py-0.5 rounded text-[11px]">
                          "{t}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
