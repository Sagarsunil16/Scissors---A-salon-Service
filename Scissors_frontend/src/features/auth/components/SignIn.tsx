import { Link, useLocation, useNavigate } from "react-router-dom";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { UserSignInProps } from "@/interfaces/interface";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/Config/firebase";
import { googleLogin } from "@/features/user/api/UserAPI";
import { signInFailure, signInstart, signInSuccess } from "@/Redux/User/userSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { ArrowRight, LockKeyhole, Mail, Scissors, ShieldCheck } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const SignIn = ({ title, onSubmit, redirectPath }: UserSignInProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: { pathname?: string; search?: string } } | null)?.from;
  const targetPath = fromPath?.pathname
    ? `${fromPath.pathname}${fromPath.search ?? ""}`
    : redirectPath;

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Enter a valid email address")
      .required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const getAuthError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      return (
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Sign in failed. Please try again."
      );
    }
    return error instanceof Error ? error.message : "Sign in failed. Please try again.";
  };

  const handleSubmit = async (values: typeof initialValues) => {
    await onSubmit(values);
    navigate(targetPath, { replace: true });
  };

  const signInWithGoogle = async () => {
    dispatch(signInstart());
    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const response = await googleLogin({
        token: idToken,
        refreshToken: result.user.refreshToken,
      });

      dispatch(signInSuccess(response.data.user));
      toast.success(response.data.message);
      navigate(targetPath, { replace: true });
    } catch (error: unknown) {
      const message = getAuthError(error);
      dispatch(signInFailure(message));
      toast.error(message);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-20">
      <section className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-lg bg-[#101816] p-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,162,68,0.28),transparent_34%)]" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
                <Scissors className="h-6 w-6 text-accent" />
              </div>
              <h1 className="mt-8 max-w-lg text-4xl font-semibold tracking-tight">
                Book trusted salon services with confidence.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
                Sign in to manage appointments, messages, wallet activity, and your profile in one place.
              </p>
              <div className="mt-10 grid gap-3">
                {["Secure session cookies", "Fast appointment access", "Personalized salon discovery"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              User sign in
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Continue with your email or Google account.
            </p>
          </div>

          <div className="app-surface rounded-lg p-5 sm:p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email address
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Field
                        type="email"
                        id="email"
                        name="email"
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="you@example.com"
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Password
                      </label>
                      <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                      <Field
                        type="password"
                        id="password"
                        name="password"
                        className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Enter password"
                      />
                    </div>
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Form>
              )}
            </Formik>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <button
              id="google-signin-btn"
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-border bg-white text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
              onClick={signInWithGoogle}
            >
              <img
                src="https://img.icons8.com/color/48/000000/google-logo.png"
                alt=""
                className="h-5 w-5"
              />
              Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              No account?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SignIn;
