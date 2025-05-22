// app/auth/sign-in/page.tsx
"use client";

import {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { signIn } from "@/lib/auth/auth-client";
import { AuthCredentialsSchema } from "@/utils/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const passwordInputType = showPassword ? "text" : "password";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = AuthCredentialsSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      validationResult.error.errors.forEach(
        (err: {
          message:
            | string
            | number
            | bigint
            | boolean
            | (() => React.ReactNode)
            | ReactElement<unknown, string | JSXElementConstructor<any>>
            | Iterable<ReactNode>
            | ReactPortal
            | Promise<
                | string
                | number
                | bigint
                | boolean
                | ReactPortal
                | ReactElement<unknown, string | JSXElementConstructor<any>>
                | Iterable<ReactNode>
                | null
                | undefined
              >
            | null
            | undefined;
        }) => {
          toast.error(err.message);
        }
      );
      console.error(
        "Client-side validation failed:",
        validationResult.error.errors
      );
      return;
    }

    const { email: validatedEmail, password: validatedPassword } =
      validationResult.data;

    setLoading(true);

    try {
      const { data, error } = await signIn.email({
        email: validatedEmail,
        password: validatedPassword,
        rememberMe,
      });

      setLoading(false);

      if (error) {
        console.error("Sign in error:", error);
        if (
          error.message === "Invalid credentials" ||
          error.message === "Invalid email or password"
        ) {
          toast.error(
            "Invalid email or password. Please check your credentials."
          );
        } else if (error.message === "User not found") {
          toast.error("No user found with this email address.");
        } else {
          toast.error(
            `Sign in failed: ${error.message || "An unknown error occurred."}`
          );
        }
      } else {
        toast.success("Sign in successful!");
        router.push("/user/infoConnect");
      }
    } catch (caughtError) {
      setLoading(false);
      console.error("Unexpected error during sign in:", caughtError);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true);
    try {
      await signIn.social({
        provider: provider as
          | "github"
          | "apple"
          | "discord"
          | "facebook"
          | "google"
          | "microsoft"
          | "spotify"
          | "twitch"
          | "twitter"
          | "dropbox"
          | "linkedin"
          | "gitlab"
          | "tiktok"
          | "reddit"
          | "roblox"
          | "vk"
          | "kick"
          | "zoom",
        callbackURL: "/",
      });
    } catch (caughtError) {
      console.error(`Error initiating ${provider} sign-in:`, caughtError);
      toast.error(`Failed to initiate ${provider} sign-in.`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="rounded-lg rounded-t-none max-w-md w-full pt-0 pb-4">
        <CardHeader className="p-2 bg-gradient-to-r from-pink-400 to-blue-500 text-white rounded-t-md">
          <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
          <CardDescription className="text-xs md:text-sm text-white/90">
            Enter your email and password below to login or use your social
            account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={passwordInputType}
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-muted-foreground" />
                    ) : (
                      <Eye size={16} className="text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(!!checked)}
                />
                <Label htmlFor="remember">Remember me</Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Logging in...
                  </>
                ) : (
                  <span>Login</span>
                )}
              </Button>
            </div>
          </CardContent>
        </form>

        {/* Optional: You can add a CardFooter here for social login buttons or links */}
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={() => handleSocialSignIn("google")}
            className="w-full"
            variant="outline"
            disabled={loading}
          >
            Sign in with Google
          </Button>
          {/* Add more providers if needed */}
        </CardFooter>
        <CardFooter className="text-center text-sm mt-4 block">
          Don&apos;t have an account ?{" "}
          <Link href="/auth/sign-up" className="underline">
            &nbsp;Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
