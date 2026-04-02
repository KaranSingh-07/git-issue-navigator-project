/**
 * GitHub API Service
 * Fetches issues from GitHub repositories
 */

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  labels: string[];
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  repository?: string;
}

interface GitHubApiIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: string;
  labels: Array<{ name: string } | string>;
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/
    ];

    for (const pattern of patterns) {
      const match = cleanUrl.match(pattern);
      if (match) {
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');
        return { owner, repo };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchGitHubIssues(
  owner: string,
  repo: string,
  token?: string,
  state: 'open' | 'closed' | 'all' = 'open',
  maxIssues: number = 100
): Promise<GitHubIssue[]> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const allIssues: GitHubIssue[] = [];
  let page = 1;
  const perPage = 100;

  while (allIssues.length < maxIssues) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&page=${page}&sort=updated&direction=desc`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found. Please check the repository URL.');
      } else if (response.status === 403) {
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        if (rateLimitRemaining === '0') {
          throw new Error('GitHub API rate limit exceeded. Please provide a GitHub token or wait before trying again.');
        }
        throw new Error('Access forbidden. The repository might be private or require authentication.');
      } else if (response.status === 401) {
        throw new Error('Invalid GitHub token. Please check your token and try again.');
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const issues: GitHubApiIssue[] = await response.json();
    if (issues.length === 0) break;

    const filteredIssues = issues
      .filter(issue => !issue.html_url.includes('/pull/'))
      .map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body || '',
        state: issue.state,
        labels: (issue.labels || []).map(label =>
          typeof label === 'string' ? label : label.name
        ),
        comments: issue.comments,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        html_url: issue.html_url,
        user: issue.user,
        repository: `${owner}/${repo}`
      }));

    allIssues.push(...filteredIssues);

    if (issues.length < perPage || allIssues.length >= maxIssues) break;
    page++;
  }

  return allIssues.slice(0, maxIssues);
}

export async function getRateLimit(token?: string): Promise<{
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch('https://api.github.com/rate_limit', { headers });
  const data = await response.json();

  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    reset: new Date(data.rate.reset * 1000)
  };
}
