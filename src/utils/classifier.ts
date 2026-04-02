/**
 * Issue Difficulty Classifier
 * Heuristic-based classification for GitHub issues
 */

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ClassificationResult {
  difficulty: Difficulty;
  score: number;
  factors: string[];
}

const COMPLEX_KEYWORDS = [
  'architecture', 'refactor', 'optimization', 'performance', 'algorithm',
  'database', 'migration', 'security', 'scalability', 'integration',
  'infrastructure', 'distributed', 'concurrent', 'async', 'memory leak',
  'core', 'engine', 'compiler', 'parser', 'critical', 'breaking change'
];

const EASY_KEYWORDS = [
  'typo', 'documentation', 'docs', 'readme', 'comment', 'text',
  'formatting', 'style', 'css', 'ui', 'button', 'color', 'layout',
  'fix spelling', 'update', 'cleanup', 'minor'
];

const BEGINNER_LABELS = [
  'good first issue', 'beginner', 'easy', 'starter', 'documentation',
  'help wanted', 'good-first-issue', 'beginner-friendly'
];

const HARD_LABELS = [
  'critical', 'high priority', 'bug', 'security', 'breaking',
  'needs investigation', 'complex'
];

export function classifyIssue(issue: {
  title: string;
  body: string;
  labels: string[];
  comments: number;
  state: string;
}): ClassificationResult {
  let score = 50;
  const factors: string[] = [];
  const text = `${issue.title || ''} ${issue.body || ''}`.toLowerCase();
  const lowerLabels = (issue.labels || []).map(l => (l || '').toLowerCase());

  // Factor 1: Labels
  if (lowerLabels.some(label => BEGINNER_LABELS.some(bl => label.includes(bl)))) {
    score -= 20;
    factors.push('Beginner-friendly label');
  }
  if (lowerLabels.some(label => HARD_LABELS.some(hl => label.includes(hl)))) {
    score += 25;
    factors.push('Complex/critical label');
  }

  // Factor 2: Content length
  const wordCount = (issue.body || '').split(/\s+/).length;
  if (wordCount < 50) {
    score -= 10;
    factors.push('Short description');
  } else if (wordCount > 200) {
    score += 15;
    factors.push('Detailed description');
  }

  // Factor 3: Keywords
  const complexCount = COMPLEX_KEYWORDS.filter(kw => text.includes(kw)).length;
  const easyCount = EASY_KEYWORDS.filter(kw => text.includes(kw)).length;

  if (complexCount > 0) {
    score += complexCount * 10;
    factors.push(`Complex keywords (${complexCount})`);
  }
  if (easyCount > 0) {
    score -= easyCount * 8;
    factors.push(`Simple keywords (${easyCount})`);
  }

  // Factor 4: Comments
  if (issue.comments > 10) {
    score += 15;
    factors.push('High comment count');
  } else if (issue.comments < 3) {
    score -= 5;
    factors.push('Few comments');
  }

  // Factor 5: Title
  const titleLower = (issue.title || '').toLowerCase();
  if (titleLower.includes('fix') || titleLower.includes('bug')) {
    score += 10;
    factors.push('Bug fix');
  }
  if (titleLower.includes('doc') || titleLower.includes('readme')) {
    score -= 15;
    factors.push('Documentation');
  }

  // Factor 6: Code blocks
  const codeBlockCount = ((issue.body || '').match(/```/g) || []).length / 2;
  if (codeBlockCount > 2) {
    score += 10;
    factors.push('Multiple code blocks');
  }

  let difficulty: Difficulty;
  if (score < 40) difficulty = 'Easy';
  else if (score < 65) difficulty = 'Medium';
  else difficulty = 'Hard';

  return {
    difficulty,
    score: Math.max(0, Math.min(100, score)),
    factors
  };
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were',
    'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'should', 'could', 'may', 'might', 'must', 'can', 'to', 'in', 'for', 'of',
    'with', 'this', 'that', 'from', 'by', 'or', 'and', 'but', 'if', 'then',
    'than', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some',
    'any', 'few', 'more', 'most', 'other', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'up', 'down', 'out', 'off', 'over',
    'under', 'again', 'further', 'once', 'here', 'there', 'also', 'its', 'it',
    'not', 'no', 'nor', 'only', 'own', 'same', 'so', 'too', 'very', 'just'
  ]);

  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}
