import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { ArrowRight, KeyRound, Mail, Scissors, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword } from "@/features/user/api/UserAPI";
import "react-toastify/dist/ReactToastify.css";

const getForgotPasswordError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Failed to send OTP. Please try again."
    );
  }

  return error instanceof Error ? error.message : "Failed to send OTP. Please try again.";
};

const ForgotPasswordEmail = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [isSending, setIsSending] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .trim()
      .email("Enter a valid email address")
      .required("Email is required"),
  });

  const handleSubmit = async (values: { email: string }) => {
    setServerError("");
    setIsSending(true);
    try {
      const response = await forgotPassword({ email: values.email.trim() });
      toast.success(response.data.message || "OTP sent successfully");
      navigate("/forgot-password/otp", { state: { email: values.email.trim() } });
    } catch (error: unknown) {
      const errorMessage = getForgotPasswordError(error);
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-20">
      <section className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Password recovery
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Reset access to your account.
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Enter your registered email and we will send a one-time code to verify the reset.
            </p>
          </div>

          <div className="app-surface rounded-lg p-5 sm:p-6">
            <Formik
              initialValues={{ email: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {() => (
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
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  {serverError && <p className="text-sm text-red-600">{serverError}</p>}

                  <button
                    type="submit"
                    disabled={isSending}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSending ? "Sending OTP..." : "Send OTP"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link to="/login" className="font-semibold text-primary">
              Sign in
            </Link>
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="relative overflow-hidden rounded-lg bg-[#101816] p-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,162,68,0.28),transparent_34%)]" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
                <Scissors className="h-6 w-6 text-accent" />
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight">
                Recovery is handled with a short verification window.
              </h2>
              <div className="mt-8 grid gap-3">
                {["OTP protected reset", "No password sent over email", "Session expires automatically"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3">
                    {item === "OTP protected reset" ? (
                      <KeyRound className="h-4 w-4 text-accent" />
                    ) : (
                      <ShieldCheck className="h-4 w-4 text-accent" />
                    )}
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default ForgotPasswordEmail;
