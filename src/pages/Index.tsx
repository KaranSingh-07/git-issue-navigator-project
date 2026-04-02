import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RepoInput } from '@/components/RepoInput';
import { IssueDashboard } from '@/components/IssueDashboard';
import { Visualizations } from '@/components/Visualizations';
import { SkillsManager } from '@/components/SkillsManager';
import { StatsSummary } from '@/components/StatsSummary';
import { MyFiles } from '@/components/MyFiles';
import { UserProfile } from '@/components/UserProfile';
import { ClassifiedIssue, loadClassifiedIssues, clearClassifiedIssues, UserSkillSet, loadUserSkills } from '@/utils/storage';
import { Button } from '@/components/ui/button';
import { Github, BarChart, User, List, Trash2, LogOut, FolderOpen, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import logo from '@/assets/logo.png';

export default function Index() {
  const { logout } = useAuth();
  const [issues, setIssues] = useState<ClassifiedIssue[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkillSet>({ languages: [], domains: [] });
  const [activeTab, setActiveTab] = useState('fetch');

  useEffect(() => {
    const loadedIssues = loadClassifiedIssues();
    const loadedSkills = loadUserSkills();
    setIssues(loadedIssues);
    setUserSkills(loadedSkills);
    if (loadedIssues.length > 0) setActiveTab('dashboard');
  }, []);

  const handleIssuesLoaded = (newIssues: ClassifiedIssue[]) => {
    setIssues(newIssues);
    setActiveTab('dashboard');
  };

  const handleClearData = () => {
    clearClassifiedIssues();
    setIssues([]);
    setActiveTab('fetch');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5">
        {/* Header */}
        <header className="mb-3 sm:mb-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img src={logo} alt="Issue Classifier Logo" width={36} height={36} className="rounded-lg shadow-sm flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight truncate">
                  Issue Classifier
                </h1>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                  Classify GitHub issues &amp; find your perfect contribution
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {issues.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs px-2 sm:px-3">
                      <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
                      <span className="hidden sm:inline">Clear</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all {issues.length} classified issues. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearData}>Clear Data</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs px-2 sm:px-3" onClick={logout}>
                <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex h-9 w-max sm:w-auto gap-0.5 bg-muted/60 p-0.5 rounded-lg">
              <TabsTrigger value="fetch" className="flex items-center gap-1 text-xs px-2.5 sm:px-3 rounded-md data-[state=active]:shadow-sm">
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fetch Issues</span>
                <span className="sm:hidden">Fetch</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" disabled={issues.length === 0} className="flex items-center gap-1 text-xs px-2.5 sm:px-3 rounded-md data-[state=active]:shadow-sm">
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Board</span>
                {issues.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full leading-none">
                    {issues.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="visualizations" disabled={issues.length === 0} className="flex items-center gap-1 text-xs px-2.5 sm:px-3 rounded-md data-[state=active]:shadow-sm">
                <BarChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-1 text-xs px-2.5 sm:px-3 rounded-md data-[state=active]:shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-1 text-xs px-2.5 sm:px-3 rounded-md data-[state=active]:shadow-sm">
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">My Files</span>
                <span className="sm:hidden">Files</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1 text-xs px-2.5 sm:px-3 rounded-md data-[state=active]:shadow-sm">
                <User className="w-3.5 h-3.5" />
                Profile
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="fetch" className="space-y-3 mt-0">
            <RepoInput onIssuesLoaded={handleIssuesLoaded} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { label: 'Easy', color: 'bg-emerald-500', bgColor: 'bg-emerald-500/10', desc: 'Great for beginners — docs, minor fixes, UI tweaks.' },
                { label: 'Medium', color: 'bg-amber-500', bgColor: 'bg-amber-500/10', desc: 'Needs experience — feature work and moderate bugs.' },
                { label: 'Hard', color: 'bg-red-500', bgColor: 'bg-red-500/10', desc: 'For pros — complex bugs, architecture, critical fixes.' },
              ].map((item) => (
                <div key={item.label} className="bg-card rounded-lg p-3 shadow-sm border flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-md ${item.bgColor} flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-xs">{item.label} Issues</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-lg p-4 shadow-sm border">
              <h3 className="font-semibold text-xs mb-2">How Classification Works</h3>
              <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
                <p><strong className="text-foreground">Heuristic-Based Analysis</strong> — our classifier examines:</p>
                <ul className="list-disc list-inside space-y-0.5 ml-2">
                  <li>Issue labels (e.g., "good first issue", "critical", "bug")</li>
                  <li>Technical keywords in title and description</li>
                  <li>Description length and complexity</li>
                  <li>Comment count and code block presence</li>
                </ul>
                <p>Each factor contributes to a difficulty score → Easy / Medium / Hard.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-3 mt-0">
            <StatsSummary issues={issues} />
            <IssueDashboard issues={issues} userSkills={userSkills} />
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-3 mt-0">
            <StatsSummary issues={issues} />
            <Visualizations issues={issues} />
          </TabsContent>

          <TabsContent value="skills" className="mt-0">
            <SkillsManager onSkillsUpdate={setUserSkills} />
          </TabsContent>

          <TabsContent value="files" className="mt-0">
            <MyFiles />
          </TabsContent>

          <TabsContent value="profile" className="mt-0">
            <UserProfile />
          </TabsContent>
        </Tabs>

        <footer className="mt-8 pt-4 border-t text-center text-[11px] text-muted-foreground space-y-0.5">
          <p>Built for WnCC • Helping students find the right issues to contribute In</p>
          
        </footer>
      </div>
    </div>
  );
}
