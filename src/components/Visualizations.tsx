import { useMemo } from 'react';
import { ClassifiedIssue } from '@/utils/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { extractKeywords } from '@/utils/classifier';
import { BarChart as BarChartIcon, TrendingUp } from 'lucide-react';
import { WordCloud } from './WordCloud';
import { format, parseISO, startOfMonth } from 'date-fns';

interface VisualizationsProps {
  issues: ClassifiedIssue[];
}

const DIFFICULTY_COLORS = {
  Easy: '#22c55e',
  Medium: '#eab308',
  Hard: '#ef4444'
};

export function Visualizations({ issues }: VisualizationsProps) {
  const pieData = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    issues.forEach(issue => counts[issue.difficulty]++);
    return [
      { name: 'Easy', value: counts.Easy, color: DIFFICULTY_COLORS.Easy },
      { name: 'Medium', value: counts.Medium, color: DIFFICULTY_COLORS.Medium },
      { name: 'Hard', value: counts.Hard, color: DIFFICULTY_COLORS.Hard }
    ];
  }, [issues]);

  const barData = useMemo(() => {
    const labelCounts: Record<string, { Easy: number; Medium: number; Hard: number }> = {};
    issues.forEach(issue => {
      (issue.labels || []).forEach(label => {
        if (!labelCounts[label]) labelCounts[label] = { Easy: 0, Medium: 0, Hard: 0 };
        labelCounts[label][issue.difficulty]++;
      });
    });
    return Object.entries(labelCounts)
      .map(([label, counts]) => ({
        label: label.length > 20 ? label.substring(0, 20) + '...' : label,
        Easy: counts.Easy,
        Medium: counts.Medium,
        Hard: counts.Hard,
        total: counts.Easy + counts.Medium + counts.Hard
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [issues]);

  const timelineData = useMemo(() => {
    const monthMap: Record<string, { Easy: number; Medium: number; Hard: number }> = {};
    issues.forEach(issue => {
      const month = format(startOfMonth(parseISO(issue.created_at)), 'yyyy-MM');
      if (!monthMap[month]) monthMap[month] = { Easy: 0, Medium: 0, Hard: 0 };
      monthMap[month][issue.difficulty]++;
    });
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, counts]) => ({
        month: format(parseISO(month + '-01'), 'MMM yyyy'),
        ...counts
      }));
  }, [issues]);

  const wordCloudData = useMemo(() => {
    const data: Record<string, Map<string, number>> = {
      Easy: new Map(), Medium: new Map(), Hard: new Map()
    };
    issues.forEach(issue => {
      const text = `${issue.title || ''} ${issue.body || ''}`;
      extractKeywords(text).forEach(keyword => {
        const map = data[issue.difficulty];
        map.set(keyword, (map.get(keyword) || 0) + 1);
      });
    });
    const result: Record<string, Array<{ text: string; value: number }>> = {};
    for (const difficulty of ['Easy', 'Medium', 'Hard']) {
      result[difficulty] = Array.from(data[difficulty].entries())
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 40);
    }
    return result;
  }, [issues]);

  const scoreDistribution = useMemo(() => {
    const buckets: Record<string, number> = {
      '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0
    };
    issues.forEach(issue => {
      const s = issue.classificationScore;
      if (s <= 20) buckets['0-20']++;
      else if (s <= 40) buckets['21-40']++;
      else if (s <= 60) buckets['41-60']++;
      else if (s <= 80) buckets['61-80']++;
      else buckets['81-100']++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [issues]);

  if (issues.length === 0) {
    return (
      <Card><CardContent className="py-8 text-center text-muted-foreground">No data to visualize. Fetch some issues first!</CardContent></Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="w-5 h-5" />
              Difficulty Distribution
            </CardTitle>
            <CardDescription>Total: {issues.length} issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={90}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Classification Score Distribution</CardTitle>
            <CardDescription>How issues are distributed across difficulty scores (0-100)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {timelineData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Issues Over Time
            </CardTitle>
            <CardDescription>Monthly breakdown of issues by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Easy" stroke={DIFFICULTY_COLORS.Easy} strokeWidth={2} />
                <Line type="monotone" dataKey="Medium" stroke={DIFFICULTY_COLORS.Medium} strokeWidth={2} />
                <Line type="monotone" dataKey="Hard" stroke={DIFFICULTY_COLORS.Hard} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Labels Bar Chart */}
      {barData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Labels by Difficulty</CardTitle>
            <CardDescription>Distribution of difficulties across the most common labels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Easy" stackId="a" fill={DIFFICULTY_COLORS.Easy} />
                <Bar dataKey="Medium" stackId="a" fill={DIFFICULTY_COLORS.Medium} />
                <Bar dataKey="Hard" stackId="a" fill={DIFFICULTY_COLORS.Hard} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Word Clouds */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Word Clouds by Difficulty</CardTitle>
          <CardDescription>Most frequent keywords found in issues of each difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['Easy', 'Medium', 'Hard'] as const).map(difficulty => (
              <div key={difficulty} className="border rounded-lg p-4">
                <h4 className="font-semibold text-center mb-2" style={{ color: DIFFICULTY_COLORS[difficulty] }}>
                  {difficulty} Issues
                </h4>
                {wordCloudData[difficulty]?.length > 0 ? (
                  <WordCloud words={wordCloudData[difficulty]} color={DIFFICULTY_COLORS[difficulty]} />
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">No keywords found</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
