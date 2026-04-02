import { useMemo } from 'react';
import { ClassifiedIssue } from '@/utils/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Clock } from 'lucide-react';

interface StatsSummaryProps {
  issues: ClassifiedIssue[];
}

export function StatsSummary({ issues }: StatsSummaryProps) {
  const stats = useMemo(() => {
    const total = issues.length;
    const easy = issues.filter(i => i.difficulty === 'Easy').length;
    const medium = issues.filter(i => i.difficulty === 'Medium').length;
    const hard = issues.filter(i => i.difficulty === 'Hard').length;
    const easyPercent = total > 0 ? Math.round((easy / total) * 100) : 0;
    const hardPercent = total > 0 ? Math.round((hard / total) * 100) : 0;
    const totalComments = issues.reduce((sum, issue) => sum + issue.comments, 0);
    const avgComments = total > 0 ? (totalComments / total).toFixed(1) : '0';
    const mostRecent = issues.length > 0
      ? new Date(Math.max(...issues.map(i => new Date(i.updated_at).getTime())))
      : null;
    const daysAgo = mostRecent
      ? Math.floor((Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const repoName = issues.length > 0 ? issues[0].repository : '';
    return { total, easy, medium, hard, easyPercent, hardPercent, avgComments, daysAgo, repoName };
  }, [issues]);

  if (issues.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">from {stats.repoName}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Easy Issues</CardTitle>
          <TrendingDown className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.easy}</div>
          <p className="text-xs text-muted-foreground">{stats.easyPercent}% of total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hard Issues</CardTitle>
          <TrendingUp className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.hard}</div>
          <p className="text-xs text-muted-foreground">{stats.hardPercent}% of total</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Comments</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgComments}</div>
          <p className="text-xs text-muted-foreground">
            {stats.daysAgo !== null ? `Last updated ${stats.daysAgo} days ago` : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
