import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';

interface ExampleRepo {
  owner: string;
  repo: string;
  description: string;
  stars: string;
}

const EXAMPLE_REPOS: ExampleRepo[] = [
  { owner: 'facebook', repo: 'react', description: 'A JavaScript library for building user interfaces', stars: '220k+' },
  { owner: 'microsoft', repo: 'vscode', description: 'Visual Studio Code - Open Source code editor', stars: '160k+' },
  { owner: 'vercel', repo: 'next.js', description: 'The React Framework for Production', stars: '120k+' },
  { owner: 'nodejs', repo: 'node', description: 'Node.js JavaScript runtime', stars: '105k+' },
  { owner: 'denoland', repo: 'deno', description: 'A modern runtime for JavaScript and TypeScript', stars: '93k+' },
  { owner: 'rust-lang', repo: 'rust', description: 'Empowering everyone to build reliable software', stars: '95k+' }
];

interface ExampleReposProps {
  onSelectRepo: (url: string) => void;
  loading?: boolean;
}

export function ExampleRepos({ onSelectRepo, loading }: ExampleReposProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="w-5 h-5" />
          Try These Popular Repositories
        </CardTitle>
        <CardDescription>Click any repository to instantly fetch and classify its issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLE_REPOS.map(repo => (
            <div
              key={`${repo.owner}/${repo.repo}`}
              className="border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
              onClick={() => !loading && onSelectRepo(`${repo.owner}/${repo.repo}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">{repo.owner}/{repo.repo}</h4>
                <span className="text-xs text-muted-foreground">⭐ {repo.stars}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{repo.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={(e) => { e.stopPropagation(); onSelectRepo(`${repo.owner}/${repo.repo}`); }}
              >
                {loading ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Github className="w-3 h-3 mr-1" />
                )}
                Fetch & Classify
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
