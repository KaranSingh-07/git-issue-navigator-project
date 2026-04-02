import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, MailCheck } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
        // Sign out immediately — don't allow unverified access
        await signOut(auth);
        setVerificationEmail(cred.user.email);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
          await sendEmailVerification(cred.user);
          await signOut(auth);
          setVerificationEmail(cred.user.email);
          return;
        }
      }
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        setError("User already exists. Please sign in");
      } else if (
        code === "auth/wrong-password" ||
        code === "auth/user-not-found" ||
        code === "auth/invalid-credential"
      ) {
        setError("Email or password is incorrect");
      } else if (code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else {
        setError(err?.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verification screen
  if (verificationEmail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MailCheck className="w-6 h-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              We have sent you a verification email to{" "}
              <span className="font-medium text-foreground">{verificationEmail}</span>.
              Please verify it and log in.
            </p>
            <Button className="w-full" onClick={() => { setVerificationEmail(null); setIsSignUp(false); setEmail(""); setPassword(""); }}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Github className="w-6 h-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Sign up to start classifying GitHub issues"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setError("");
              setLoading(true);
              try {
                await signInWithPopup(auth, new GoogleAuthProvider());
              } catch (err: any) {
                if (err?.code !== "auth/popup-closed-by-user") {
                  setError(err?.message || "Google sign-in failed");
                }
              } finally {
                setLoading(false);
              }
            }}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
