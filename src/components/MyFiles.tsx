import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFolders, useFiles } from "@/hooks/useFirestore";
import { FolderOpen, File, Plus, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function MyFiles() {
  const { data: folders, loading: foldersLoading, add: addFolder, remove: removeFolder } = useFolders();
  const { data: files, loading: filesLoading, add: addFile, remove: removeFile } = useFiles();

  const [folderModal, setFolderModal] = useState(false);
  const [fileModal, setFileModal] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileFolder, setFileFolder] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [saving, setSaving] = useState(false);

  const loading = foldersLoading || filesLoading;

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setSaving(true);
    await addFolder({ name: folderName.trim() });
    setSaving(false);
    setFolderName("");
    setFolderModal(false);
  };

  const handleCreateFile = async () => {
    if (!fileName.trim()) return;
    setSaving(true);
    await addFile({
      name: fileName.trim(),
      folderId: fileFolder || undefined,
      size: Number(fileSize) || 0,
    });
    setSaving(false);
    setFileName("");
    setFileFolder("");
    setFileSize("");
    setFileModal(false);
  };

  const getFolderName = (folderId?: string) => {
    if (!folderId) return "No folder";
    return folders.find((f) => f.id === folderId)?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button onClick={() => setFolderModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Folder
        </Button>
        <Button variant="outline" onClick={() => setFileModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add File
        </Button>
      </div>

      {/* Folders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5" />
            Folders ({folders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {folders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No folders yet. Create one to organize your files.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {folders.map((folder) => {
                const fileCount = files.filter((f) => f.folderId === folder.id).length;
                return (
                  <div key={folder.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{folder.name}</p>
                        <p className="text-xs text-muted-foreground">{fileCount} file{fileCount !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeFolder(folder.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <File className="w-5 h-5" />
            Files ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <p className="text-muted-foreground text-sm">No files yet. Add a file to get started.</p>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3 min-w-0">
                    <File className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.size ? `${file.size} KB` : "0 KB"} • {getFolderName(file.folderId)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeFile(file.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Folder Modal */}
      <Dialog open={folderModal} onOpenChange={setFolderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Enter a name for your new folder.</DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderModal(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim() || saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add File Modal */}
      <Dialog open={fileModal} onOpenChange={setFileModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add File</DialogTitle>
            <DialogDescription>Add file metadata. No real upload yet.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="File name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
            <Select value={fileFolder} onValueChange={setFileFolder}>
              <SelectTrigger>
                <SelectValue placeholder="Select folder (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No folder</SelectItem>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Size (KB)"
              type="number"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFileModal(false)}>Cancel</Button>
            <Button onClick={handleCreateFile} disabled={!fileName.trim() || saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
