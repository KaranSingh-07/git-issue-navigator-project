import { useState, useEffect, useCallback } from "react";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc, serverTimestamp, setDoc, getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

// Generic subcollection hook
function useSubcollection<T>(subPath: string) {
  const { user } = useAuth();
  const [data, setData] = useState<(T & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setData([]); setLoading(false); return; }
    const ref = collection(db, `users/${user.uid}/${subPath}`);
    const q = query(ref, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data() } as T & { id: string })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [user, subPath]);

  const add = useCallback(async (item: Omit<T, "createdAt">) => {
    if (!user) return;
    await addDoc(collection(db, `users/${user.uid}/${subPath}`), { ...item, createdAt: serverTimestamp() });
  }, [user, subPath]);

  const remove = useCallback(async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/${subPath}`, id));
  }, [user, subPath]);

  return { data, loading, add, remove };
}

export interface FolderData { name: string; createdAt: any; }
export interface FileData { name: string; folderId?: string; size: number; createdAt: any; }

export function useFolders() {
  return useSubcollection<FolderData>("folders");
}

export function useFiles() {
  return useSubcollection<FileData>("files");
}

// User profile
export interface UserProfile {
  displayName: string;
  email: string;
  institute: string;
  branch: string;
  bio: string;
  photoURL: string;
  skills: string[];
  createdAt: any;
}

const defaultProfile: Omit<UserProfile, "email" | "createdAt"> = {
  displayName: "",
  institute: "",
  branch: "",
  bio: "",
  photoURL: "",
  skills: [],
};

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setProfile(null); setLoading(false); return; }
    const ref = doc(db, "users", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        // Initialize profile
        const init: UserProfile = {
          ...defaultProfile,
          displayName: user.displayName || "",
          email: user.email || "",
          createdAt: serverTimestamp(),
        };
        setDoc(ref, init);
        setProfile(init);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid), updates);
  }, [user]);

  return { profile, loading, updateProfile };
}
