import { useState, useMemo } from 'react';
import { ClassifiedIssue } from '@/utils/storage';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Calendar, MessageSquare, Tag, TrendingUp, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IssueDashboardProps {
  issues: ClassifiedIssue[];
  userSkills?: { languages: string[]; domains: string[] };
}

const ITEMS_PER_PAGE = 15;

export function IssueDashboard({ issues, userSkills }: IssueDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'comments' | 'difficulty'>('updated');
  const [page, setPage] = useState(1);

  const allLabels = useMemo(() => {
    const labelSet = new Set<string>();
    issues.forEach(issue => (issue.labels || []).forEach(label => labelSet.add(label)));
    return Array.from(labelSet).sort();
  }, [issues]);

  const calculateSkillMatch = (issue: ClassifiedIssue): number => {
    if (!userSkills || (userSkills.languages.length === 0 && userSkills.domains.length === 0)) return 0;
    const text = `${issue.title || ''} ${issue.body || ''} ${(issue.labels || []).join(' ')}`.toLowerCase();
    let matchScore = 0;
    userSkills.languages.forEach(lang => { if (text.includes(lang.toLowerCase())) matchScore += 2; });
    userSkills.domains.forEach(domain => { if (text.includes(domain.toLowerCase())) matchScore += 1; });
    return matchScore;
  };

  const filteredIssues = useMemo(() => {
    let filtered = issues;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(issue =>
        (issue.title || '').toLowerCase().includes(query) ||
        (issue.body || '').toLowerCase().includes(query) ||
        (issue.labels || []).some(label => (label || '').toLowerCase().includes(query))
      );
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(issue => issue.difficulty === difficultyFilter);
    }

    if (labelFilter !== 'all') {
      filtered = filtered.filter(issue => (issue.labels || []).includes(labelFilter));
    }

    if (dateFilter !== 'all') {
      const now = Date.now();
      const msPerDay = 1000 * 60 * 60 * 24;
      let cutoff = 0;
      switch (dateFilter) {
        case '7d': cutoff = now - 7 * msPerDay; break;
        case '30d': cutoff = now - 30 * msPerDay; break;
        case '90d': cutoff = now - 90 * msPerDay; break;
        case '1y': cutoff = now - 365 * msPerDay; break;
      }
      if (cutoff) {
        filtered = filtered.filter(issue => new Date(issue.updated_at).getTime() >= cutoff);
      }
    }

    const diffOrder: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };

    return [...filtered].sort((a, b) => {
      if (sortBy === 'updated') return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      if (sortBy === 'created') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'comments') return b.comments - a.comments;
      if (sortBy === 'difficulty') return diffOrder[a.difficulty] - diffOrder[b.difficulty];
      return 0;
    });
  }, [issues, searchQuery, difficultyFilter, labelFilter, dateFilter, sortBy]);

  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
  const paginatedIssues = filteredIssues.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page when filters change
  useMemo(() => setPage(1), [searchQuery, difficultyFilter, labelFilter, dateFilter]);

  const recommendedIssues = useMemo(() => {
    if (!userSkills || (userSkills.languages.length === 0 && userSkills.domains.length === 0)) return [];
    return issues
      .map(issue => ({ issue, matchScore: calculateSkillMatch(issue) }))
      .filter(item => item.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)
      .map(item => item.issue);
  }, [issues, userSkills]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getDifficultyBadgeVariant = (difficulty: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (difficulty) {
      case 'Easy': return 'default';
      case 'Medium': return 'secondary';
      case 'Hard': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Search</CardTitle>
          <CardDescription>Showing {filteredIssues.length} of {issues.length} issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2 lg:col-span-1">
              <Label htmlFor="search"><Search className="w-4 h-4 inline mr-1" />Search</Label>
              <Input id="search" placeholder="Search titles & descriptions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger><SelectValue placeholder="All difficulties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Easy">🟢 Easy</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="Hard">🔴 Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Label</Label>
              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger><SelectValue placeholder="All labels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  {allLabels.map(label => (
                    <SelectItem key={label} value={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger><SelectValue placeholder="All time" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="created">Created Date</SelectItem>
                  <SelectItem value="comments">Comment Count</SelectItem>
                  <SelectItem value="difficulty">Difficulty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendedIssues.length > 0 && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recommended For You
            </CardTitle>
            <CardDescription>
              Based on your skills: {[...(userSkills?.languages || []), ...(userSkills?.domains || [])].join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedIssues.map(issue => (
              <IssueCard key={`rec-${issue.id}`} issue={issue} getDifficultyColor={getDifficultyColor} getDifficultyBadgeVariant={getDifficultyBadgeVariant} showMatchScore skillMatch={calculateSkillMatch(issue)} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Issues List */}
      <div className="space-y-3">
        {paginatedIssues.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No issues found matching your filters. Try adjusting the search or filters.</CardContent></Card>
        ) : (
          paginatedIssues.map(issue => (
            <IssueCard key={issue.id} issue={issue} getDifficultyColor={getDifficultyColor} getDifficultyBadgeVariant={getDifficultyBadgeVariant} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface IssueCardProps {
  issue: ClassifiedIssue;
  getDifficultyColor: (d: string) => string;
  getDifficultyBadgeVariant: (d: string) => "default" | "secondary" | "destructive" | "outline";
  showMatchScore?: boolean;
  skillMatch?: number;
}

function IssueCard({ issue, getDifficultyColor, getDifficultyBadgeVariant, showMatchScore, skillMatch }: IssueCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <div className={`w-2.5 h-2.5 rounded-full ${getDifficultyColor(issue.difficulty)}`} />
              <Badge variant={getDifficultyBadgeVariant(issue.difficulty)}>{issue.difficulty}</Badge>
              <span className="text-sm text-muted-foreground">#{issue.number}</span>
              {showMatchScore && skillMatch && (
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  Skill Match: {skillMatch}
                </Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-semibold mb-1">Score: {issue.classificationScore}/100</p>
                  <ul className="text-xs space-y-0.5">
                    {issue.classificationFactors.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </div>

            <h3 className="text-lg font-semibold mb-2 break-words">{issue.title}</h3>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {(issue.body || '').substring(0, 200)}
              {(issue.body || '').length > 200 && '...'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(issue.updated_at), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {issue.comments} comments
              </div>
              {issue.repository && (
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {issue.repository}
                </div>
              )}
            </div>

            {issue.labels.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {issue.labels.map(label => (
                  <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
                ))}
              </div>
            )}
          </div>

          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 p-2 rounded-md hover:bg-accent transition-colors"
            title="Open on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
