import { GitHubIssue } from './github';
import { Difficulty } from './classifier';

export interface ClassifiedIssue extends GitHubIssue {
  difficulty: Difficulty;
  classificationScore: number;
  classificationFactors: string[];
  classifiedAt: string;
}

export interface UserSkillSet {
  languages: string[];
  domains: string[];
}

const ISSUES_KEY = 'github_classified_issues';
const SKILLS_KEY = 'user_skill_set';
const TOKEN_KEY = 'github_token';

export function saveClassifiedIssues(issues: ClassifiedIssue[]): void {
  try { localStorage.setItem(ISSUES_KEY, JSON.stringify(issues)); } catch (e) { console.error(e); }
}

export function loadClassifiedIssues(): ClassifiedIssue[] {
  try {
    const data = localStorage.getItem(ISSUES_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function clearClassifiedIssues(): void {
  try { localStorage.removeItem(ISSUES_KEY); } catch (e) { console.error(e); }
}

export function saveUserSkills(skills: UserSkillSet): void {
  try { localStorage.setItem(SKILLS_KEY, JSON.stringify(skills)); } catch (e) { console.error(e); }
}

export function loadUserSkills(): UserSkillSet {
  try {
    const data = localStorage.getItem(SKILLS_KEY);
    return data ? JSON.parse(data) : { languages: [], domains: [] };
  } catch { return { languages: [], domains: [] }; }
}

export function saveGitHubToken(token: string): void {
  try { localStorage.setItem(TOKEN_KEY, token); } catch (e) { console.error(e); }
}

export function loadGitHubToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}

export function clearGitHubToken(): void {
  try { localStorage.removeItem(TOKEN_KEY); } catch (e) { console.error(e); }
}
