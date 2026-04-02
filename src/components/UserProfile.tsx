import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useFirestore";
import { useAuth } from "@/contexts/AuthContext";
import { Pencil, Plus, X, Loader2, User, GraduationCap, BookOpen, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function UserProfile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile();

  const [editModal, setEditModal] = useState(false);
  const [skillModal, setSkillModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    displayName: "",
    institute: "",
    branch: "",
    bio: "",
    photoURL: "",
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        institute: profile.institute || "",
        branch: profile.branch || "",
        bio: profile.bio || "",
        photoURL: profile.photoURL || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    await updateProfile(form);
    setSaving(false);
    setEditModal(false);
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !profile) return;
    const updated = [...(profile.skills || []), newSkill.trim()];
    setSaving(true);
    await updateProfile({ skills: updated });
    setSaving(false);
    setNewSkill("");
    setSkillModal(false);
  };

  const handleRemoveSkill = async (skill: string) => {
    if (!profile) return;
    const updated = (profile.skills || []).filter((s) => s !== skill);
    await updateProfile({ skills: updated });
  };

  const initials = (profile?.displayName || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Profile Information</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditModal(true)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="w-24 h-24 shrink-0">
              <AvatarImage src={profile?.photoURL} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h2 className="text-xl font-semibold">{profile?.displayName || "No name set"}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">{profile?.email || user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="w-4 h-4 shrink-0" />
                  <span>{profile?.institute || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>{profile?.branch || "Not set"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4 shrink-0" />
                  <span>{profile?.bio || "No bio added"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Skills</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setSkillModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(!profile?.skills || profile.skills.length === 0) ? (
            <p className="text-muted-foreground text-sm">No skills added yet. Add your skills to get better issue recommendations.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                  {skill}
                  <button
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                    onClick={() => handleRemoveSkill(skill)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Update your profile information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium">Institute / College</label>
              <Input value={form.institute} onChange={(e) => setForm({ ...form, institute: e.target.value })} placeholder="e.g. IIT Bombay" />
            </div>
            <div>
              <label className="text-sm font-medium">Education / Branch</label>
              <Input value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} placeholder="e.g. Computer Science" />
            </div>
            <div>
              <label className="text-sm font-medium">Bio</label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A short bio about yourself" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Photo URL</label>
              <Input value={form.photoURL} onChange={(e) => setForm({ ...form, photoURL: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Skill Modal */}
      <Dialog open={skillModal} onOpenChange={setSkillModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Skill</DialogTitle>
            <DialogDescription>Add a new skill to your profile.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="e.g. React, Python, Machine Learning"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSkillModal(false)}>Cancel</Button>
            <Button onClick={handleAddSkill} disabled={!newSkill.trim() || saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
