import { useEffect, useMemo, useState } from "react";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { OTPVerificationProps } from "@/interfaces/interface";
import { toast } from "react-toastify";
import axios from "axios";
import { ArrowRight, MailCheck, RotateCcw, Scissors, ShieldCheck } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const RESEND_SECONDS = 60;

const getOtpError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "OTP verification failed. Please try again."
    );
  }

  return error instanceof Error
    ? error.message
    : "OTP verification failed. Please try again.";
};

const OTP = ({
  resendOTP,
  verifyOTP,
  redirectPath,
  fallbackPath = "/signup",
  title = "Verify your email",
  description = "Enter the 6-digit code we sent to your email to activate your account.",
  eyebrow = "Email verification",
  panelTitle = "One quick check before your account is ready.",
  panelItems = ["Protects your booking profile", "Confirms salon updates reach you", "Keeps account recovery secure"],
  wrongEmailLabel = "Start signup again",
  preserveEmailOnRedirect = false,
  verificationPurpose,
}: OTPVerificationProps) => {
  const [serverError, setServerError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email as string | undefined;

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 2)}${name.length > 2 ? "***" : ""}@${domain}`;
  }, [email]);

  useEffect(() => {
    if (!email) {
      navigate(fallbackPath, { replace: true });
    }
  }, [email, fallbackPath, navigate]);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = window.setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timer]);

  const validationSchema = Yup.object({
    otp: Yup.string()
      .matches(/^\d{6}$/, "OTP must be 6 digits")
      .required("OTP is required"),
  });

  const handleResend = async () => {
    if (!email || timer > 0 || isResending) return;

    setServerError("");
    setIsResending(true);
    try {
      const response = await resendOTP({ email });
      toast.success(response.data.message || "OTP sent successfully");
      setTimer(RESEND_SECONDS);
    } catch (error: unknown) {
      const errorMessage = getOtpError(error);
      toast.error(errorMessage);
      setServerError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (values: { otp: string }) => {
    if (!email) return;

    setServerError("");
    setIsVerifying(true);
    try {
      const response = await verifyOTP({ email, otp: values.otp, purpose: verificationPurpose });
      toast.success(response.data.message || "Email verified successfully");
      navigate(redirectPath, {
        replace: true,
        state: preserveEmailOnRedirect ? { email } : undefined,
      });
    } catch (error: unknown) {
      const errorMessage = getOtpError(error);
      toast.error(errorMessage);
      setServerError(errorMessage);
    } finally {
      setIsVerifying(false);
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
                {panelTitle}
              </h1>
              <div className="mt-8 grid gap-3">
                {panelItems.map((item) => (
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
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>

          <div className="app-surface rounded-lg p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3 rounded-md bg-muted p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-background text-primary">
                <MailCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Code sent to</p>
                <p className="break-all text-sm text-muted-foreground">
                  {maskedEmail || "your email address"}
                </p>
              </div>
            </div>

            <Formik
              initialValues={{ otp: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {() => (
                <Form className="space-y-4">
                  <div>
                    <label htmlFor="otp" className="text-sm font-medium text-foreground">
                      Verification code
                    </label>
                    <Field
                      id="otp"
                      name="otp"
                      inputMode="numeric"
                      maxLength={6}
                      className="mt-2 h-12 w-full rounded-md border border-input bg-background px-4 text-center text-lg font-semibold tracking-[0.45em] outline-none transition focus:border-primary"
                      placeholder="000000"
                    />
                    <ErrorMessage name="otp" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  {serverError && <p className="text-sm text-red-600">{serverError}</p>}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isVerifying ? "Verifying..." : "Verify email"}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col items-center justify-between gap-3 pt-2 text-sm text-muted-foreground sm:flex-row">
                    <span>{timer > 0 ? `Resend available in ${timer}s` : "Did not receive it?"}</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={timer > 0 || isResending}
                      className="inline-flex items-center gap-2 font-semibold text-primary transition hover:text-primary/80 disabled:cursor-not-allowed disabled:text-muted-foreground"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {isResending ? "Sending..." : "Resend OTP"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Wrong email?{" "}
            <Link to={fallbackPath} className="font-semibold text-primary">
              {wrongEmailLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default OTP;
