import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UserSkillSet, saveUserSkills, loadUserSkills } from '@/utils/storage';
import { X, Plus, Code, Briefcase, Sparkles, RotateCcw } from 'lucide-react';

interface SkillsManagerProps {
  onSkillsUpdate: (skills: UserSkillSet) => void;
}

const SUGGESTED_LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'R', 'MATLAB', 'SQL'
];

const SUGGESTED_DOMAINS = [
  'Web Development', 'Mobile', 'Machine Learning', 'Data Science',
  'DevOps', 'Backend', 'Frontend', 'UI/UX', 'Security', 'Database',
  'Cloud', 'API', 'Testing', 'Documentation', 'Performance'
];

export function SkillsManager({ onSkillsUpdate }: SkillsManagerProps) {
  const [skills, setSkills] = useState<UserSkillSet>({ languages: [], domains: [] });
  const [newLanguage, setNewLanguage] = useState('');
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    const loaded = loadUserSkills();
    setSkills(loaded);
    onSkillsUpdate(loaded);
  }, []);

  const updateSkills = (updated: UserSkillSet) => {
    setSkills(updated);
    saveUserSkills(updated);
    onSkillsUpdate(updated);
  };

  const handleAddLanguage = (language: string) => {
    const trimmed = language.trim();
    if (trimmed && !skills.languages.includes(trimmed)) {
      updateSkills({ ...skills, languages: [...skills.languages, trimmed] });
      setNewLanguage('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    updateSkills({ ...skills, languages: skills.languages.filter(l => l !== language) });
  };

  const handleAddDomain = (domain: string) => {
    const trimmed = domain.trim();
    if (trimmed && !skills.domains.includes(trimmed)) {
      updateSkills({ ...skills, domains: [...skills.domains, trimmed] });
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    updateSkills({ ...skills, domains: skills.domains.filter(d => d !== domain) });
  };

  const handleClearAll = () => {
    updateSkills({ languages: [], domains: [] });
  };

  const hasSkills = skills.languages.length > 0 || skills.domains.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Your Skill Profile
              </CardTitle>
              <CardDescription className="mt-1">
                Define your skills to get personalized issue recommendations on the Dashboard tab
              </CardDescription>
            </div>
            {hasSkills && (
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <RotateCcw className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Programming Languages */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Code className="w-4 h-4" />
              Programming Languages
              {skills.languages.length > 0 && (
                <Badge variant="secondary" className="text-xs">{skills.languages.length} selected</Badge>
              )}
            </Label>

            {skills.languages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.languages.map(lang => (
                  <Badge key={lang} variant="secondary" className="gap-1 py-1">
                    {lang}
                    <button onClick={() => handleRemoveLanguage(lang)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Type a language and press Enter..."
                value={newLanguage}
                onChange={(e) => setNewLanguage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLanguage(newLanguage)}
              />
              <Button size="sm" onClick={() => handleAddLanguage(newLanguage)} disabled={!newLanguage.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_LANGUAGES.filter(l => !skills.languages.includes(l)).map(lang => (
                  <Button key={lang} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleAddLanguage(lang)}>
                    + {lang}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Domains */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base">
              <Briefcase className="w-4 h-4" />
              Domains & Interests
              {skills.domains.length > 0 && (
                <Badge variant="secondary" className="text-xs">{skills.domains.length} selected</Badge>
              )}
            </Label>

            {skills.domains.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.domains.map(domain => (
                  <Badge key={domain} variant="secondary" className="gap-1 py-1">
                    {domain}
                    <button onClick={() => handleRemoveDomain(domain)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Type a domain and press Enter..."
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain(newDomain)}
              />
              <Button size="sm" onClick={() => handleAddDomain(newDomain)} disabled={!newDomain.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-1">
                {SUGGESTED_DOMAINS.filter(d => !skills.domains.includes(d)).map(domain => (
                  <Button key={domain} variant="outline" size="sm" className="text-xs h-7" onClick={() => handleAddDomain(domain)}>
                    + {domain}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How Personalized Recommendations Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>Once you add your skills, the system matches them against issue titles, descriptions, and labels:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li><strong className="text-foreground">Language match</strong> — Each programming language found in an issue gives +2 points</li>
            <li><strong className="text-foreground">Domain match</strong> — Each domain/interest found gives +1 point</li>
            <li>Issues are ranked by total match score and shown in the <strong className="text-foreground">Dashboard → Recommended For You</strong> section</li>
          </ul>
          <p className="mt-3">
            💡 <strong className="text-foreground">Tip:</strong> Go to the Dashboard tab after adding skills to see your personalized recommendations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
