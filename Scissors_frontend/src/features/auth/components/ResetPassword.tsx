import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axios from "axios";
import { ArrowRight, LockKeyhole, Scissors, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { resetPassword } from "@/features/user/api/UserAPI";
import "react-toastify/dist/ReactToastify.css";

const getResetPasswordError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to reset password. Please try again."
    );
  }

  return error instanceof Error ? error.message : "Failed to reset password. Please try again.";
};

const ResetPassword = () => {
  const [serverError, setServerError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email as string | undefined;

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long")
      .matches(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])/,
        "Use uppercase, lowercase, number, and symbol"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!email) return;

    setServerError("");
    setIsResetting(true);
    try {
      const response = await resetPassword({
        email,
        password: values.password,
      });
      toast.success(response.data.message || "Password reset successfully");
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      const errorMessage = getResetPasswordError(error);
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-20">
      <section className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden lg:block">
          <div className="relative overflow-hidden rounded-lg bg-[#101816] p-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,162,68,0.25),transparent_36%)]" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
                <Scissors className="h-6 w-6 text-accent" />
              </div>
              <h1 className="mt-8 text-3xl font-semibold tracking-tight">
                Create a stronger password for your bookings.
              </h1>
              <div className="mt-8 grid gap-3">
                {["Minimum 8 characters", "Uses mixed character types", "Reset session is short-lived"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              New password
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Set your new password.
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use a unique password that you do not use on other accounts.
            </p>
          </div>

          <div className="app-surface rounded-lg p-5 sm:p-6">
            <Formik
              initialValues={{ password: "", confirmPassword: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      New password
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="Create new password"
                      />
                    </div>
                    <ErrorMessage name="password" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                      Confirm password
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                      <Field
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="Repeat new password"
                      />
                    </div>
                    <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  {serverError && <p className="text-sm text-red-600">{serverError}</p>}

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isResetting ? "Saving password..." : "Reset password"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Back to{" "}
            <Link to="/login" className="font-semibold text-primary">
              sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default ResetPassword;
