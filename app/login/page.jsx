"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import login2 from "../../public/login2.jpg";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import logo from "../../public/chatrealfam.png";

export default function LoginPage() {
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      toast.success("Login successful! Redirecting...", {
        duration: 3000,
      });
      router.push("/dashboard");
    }
  }, [status, router]);

  // Check for error in URL params (from NextAuth callback)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "OAuthAccountNotLinked" || errorParam === "AccountNotFound") {
      setError(
        "A chatrealfam account for this sign-in option does not exist. Please try another sign-in option or sign-up."
      );
      toast.error(
        "A chatrealfam account for this sign-in option does not exist. Please try another sign-in option or sign-up.",
        { duration: 5000 }
      );
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
      toast.error(result.error, { duration: 3000 });
      console.error("Credentials login error:", result.error);
    }
  };

  const handleSocialLogin = async (provider) => {
    setError("");
    // ✅ Redirect new social login users to /channel-selection
    const result = await signIn(provider, {
      callbackUrl: "/channel-selection",
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "OAuthAccountNotLinked" || result.error === "AccountNotFound") {
        setError(
          "A chatrealfam account for this sign-in option does not exist. Please try another sign-in option or sign-up."
        );
        toast.error(
          "A chatrealfam account for this sign-in option does not exist. Please try another sign-in option or sign-up.",
          { duration: 5000 }
        );
      } else {
        setError(result.error);
        toast.error(result.error, { duration: 3000 });
      }
      console.error("Social login error:", result.error);
    } else {
      toast.success(`Logging in with ${provider}...`, { duration: 3000 });
    }
  };

  const validateForm = () => {
    let isValid = true;
    if (!email) {
      setEmailError("Email is required");
      toast.error("Email is required");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required");
      toast.error("Password is required");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <Toaster position="top-center" />

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <div className="flex justify-center gap-2 md:justify-start px-8">
              <div className="flex items-center justify-center h-30 w-30">
                <Image src={logo} alt="Logo" width={200} height={160} />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                {error && (
                  <div className="w-full p-3 mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-sm text-muted-foreground">
                  Login to your chatrealfam AI account
                </p>
              </div>

              <div className="grid gap-8">
                <div className="grid grid-row-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("google")}
                    className="w-full cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                    </svg>
                    Sign In With Google
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("facebook")}
                    className="w-full cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="#1877F2"
                      />
                    </svg>
                    Sign In With Facebook
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleSocialLogin("telegram")}
                    className="w-full cursor-pointer"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M9.999 15.2 9.8 19c.4 0 .6-.2.8-.4l2-1.9 4.1 3c.8.4 1.3.2 1.5-.8l2.7-12.7c.3-1.1-.4-1.6-1.2-1.3L2.5 10.2c-1.1.4-1.1 1-.2 1.3l4.1 1.3 9.6-6c.5-.3 1-.1.6.2l-7.7 6.2Z"
                        fill="#0088CC"
                      />
                    </svg>
                    Sign In With Telegram
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/channel-selection"
                  className="underline underline-offset-4 text-blue-500 hover:text-gray-600"
                >
                  Sign up
                </Link>
              </div>

              <div className="text-center text-xs text-muted-foreground mt-40 text-balance 
                *:[a]:text-blue-500 *:[a]:hover:text-blue-800 *:[a]:underline *:[a]:underline-offset-4">
                By continuing, you agree to our{" "}
                <a href="/privacy-policy">Privacy Policy</a> and{" "}
                <a href="/terms">Terms</a>.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <Image
          src={login2}
          alt="Login page illustration"
          fill={true}
          quality={100}
          priority={false}
          placeholder="blur"
          blurDataURL=""
          className="absolute h-full w-full object-cover rounded-l-4xl"
        />
      </div>
    </div>
  );
}
