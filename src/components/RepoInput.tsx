import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Github, Loader2, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { parseRepoUrl, fetchGitHubIssues } from '@/utils/github';
import { classifyIssue } from '@/utils/classifier';
import { ClassifiedIssue, saveClassifiedIssues, saveGitHubToken, loadGitHubToken } from '@/utils/storage';
import { ExampleRepos } from './ExampleRepos';

interface RepoInputProps {
  onIssuesLoaded: (issues: ClassifiedIssue[]) => void;
}

export function RepoInput({ onIssuesLoaded }: RepoInputProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [token, setToken] = useState(loadGitHubToken() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState('');

  const handleFetchIssues = useCallback(async (urlOverride?: string) => {
    const url = urlOverride || repoUrl;
    setError('');
    setSuccess('');
    setProgress('');

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    const parsed = parseRepoUrl(url.trim());
    if (!parsed) {
      setError('Invalid GitHub repository URL. Expected format: github.com/owner/repo or owner/repo');
      return;
    }

    setLoading(true);
    setProgress('Connecting to GitHub API...');

    try {
      if (token) saveGitHubToken(token);

      setProgress(`Fetching issues from ${parsed.owner}/${parsed.repo}...`);
      const issues = await fetchGitHubIssues(parsed.owner, parsed.repo, token || undefined, 'open', 100);

      if (issues.length === 0) {
        setError('No open issues found in this repository. Try a different repo.');
        setLoading(false);
        setProgress('');
        return;
      }

      setProgress(`Classifying ${issues.length} issues...`);

      const classifiedIssues: ClassifiedIssue[] = issues.map(issue => {
        const classification = classifyIssue(issue);
        return {
          ...issue,
          difficulty: classification.difficulty,
          classificationScore: classification.score,
          classificationFactors: classification.factors,
          classifiedAt: new Date().toISOString()
        };
      });

      saveClassifiedIssues(classifiedIssues);
      onIssuesLoaded(classifiedIssues);

      const easy = classifiedIssues.filter(i => i.difficulty === 'Easy').length;
      const medium = classifiedIssues.filter(i => i.difficulty === 'Medium').length;
      const hard = classifiedIssues.filter(i => i.difficulty === 'Hard').length;

      setSuccess(
        `✅ Loaded ${classifiedIssues.length} issues from ${parsed.owner}/${parsed.repo} — Easy: ${easy}, Medium: ${medium}, Hard: ${hard}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issues');
    } finally {
      setLoading(false);
      setProgress('');
    }
  }, [repoUrl, token, onIssuesLoaded]);

  const handleSelectRepo = useCallback((url: string) => {
    setRepoUrl(url);
    handleFetchIssues(url);
  }, [handleFetchIssues]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const issues: ClassifiedIssue[] = (Array.isArray(data) ? data : data.issues || []).map((issue: any) => {
          const normalized = {
            id: issue.id || Math.random(),
            number: issue.number || 0,
            title: issue.title || '',
            body: issue.body || issue.description || '',
            state: issue.state || 'open',
            labels: Array.isArray(issue.labels)
              ? issue.labels.map((l: any) => typeof l === 'string' ? l : l.name || '')
              : [],
            comments: issue.comments || 0,
            created_at: issue.created_at || new Date().toISOString(),
            updated_at: issue.updated_at || new Date().toISOString(),
            html_url: issue.html_url || issue.url || '#',
            user: issue.user || { login: 'unknown', avatar_url: '' },
            repository: issue.repository || file.name.replace('.json', '')
          };
          const classification = classifyIssue(normalized);
          return {
            ...normalized,
            difficulty: classification.difficulty,
            classificationScore: classification.score,
            classificationFactors: classification.factors,
            classifiedAt: new Date().toISOString()
          };
        });

        if (issues.length === 0) {
          setError('No issues found in uploaded file');
          return;
        }

        saveClassifiedIssues(issues);
        onIssuesLoaded(issues);
        setSuccess(`✅ Loaded and classified ${issues.length} issues from uploaded file`);
      } catch {
        setError('Invalid JSON file. Please upload a valid issues JSON file.');
      }
    };
    reader.readAsText(file);
  }, [onIssuesLoaded]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="w-6 h-6" />
            Fetch Repository Issues
          </CardTitle>
          <CardDescription>
            Enter a GitHub repository URL or upload a JSON file to fetch and classify issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL *</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/owner/repo or owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchIssues()}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github-token">GitHub Token (Optional)</Label>
            <Input
              id="github-token"
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Providing a token increases rate limits (60 → 5000 req/hr) and allows access to private repos.{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Create one here
              </a>
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => handleFetchIssues()} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress || 'Processing...'}
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Fetch & Classify Issues
                </>
              )}
            </Button>

            <Label
              htmlFor="file-upload"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload JSON
            </Label>
            <input
              id="file-upload"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <ExampleRepos onSelectRepo={handleSelectRepo} loading={loading} />
    </div>
  );
}
