import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser, sentOTP } from "@/features/user/api/UserAPI";
import { signUpFailure, signUpStart, signUpSuccess } from "@/Redux/User/userSlice";
import { RootState } from "@/Redux/store";
import { toast } from "react-toastify";
import axios from "axios";
import { ArrowRight, LockKeyhole, Mail, Phone, Scissors, ShieldCheck, UserRound } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

interface SignUpValues {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

const initialValues: SignUpValues = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

const validationSchema = Yup.object({
  firstname: Yup.string().trim().required("First name is required"),
  lastname: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^\d{10}$/, "Enter a valid 10-digit phone number")
    .required("Phone number is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])/,
      "Use uppercase, lowercase, number, and symbol"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
});

const getSignupError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Sign-up failed. Please try again."
    );
  }
  return error instanceof Error ? error.message : "Sign-up failed. Please try again.";
};

const UserSignUp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.user);

  const handleSubmit = async (values: SignUpValues) => {
    dispatch(signUpStart());
    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;

      await signUpUser(payload);
      await sentOTP(values.email);
      dispatch(signUpSuccess());
      toast.success("Please verify the OTP sent to your email.");
      navigate("/signup/verify", { state: { email: values.email } });
    } catch (error: unknown) {
      const errorMessage = getSignupError(error);
      dispatch(signUpFailure(errorMessage));
      toast.error(errorMessage);
    }
  };

  return (
    <main className="min-h-screen bg-background pt-20">
      <section className="section-shell grid min-h-[calc(100vh-5rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Create user account
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Start booking better salon appointments.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Create an account to save your profile, manage appointments, and verify bookings securely.
            </p>
          </div>

          <div className="app-surface rounded-lg p-5 sm:p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstname" className="text-sm font-medium text-foreground">
                      First name
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <Field
                        id="firstname"
                        name="firstname"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="First name"
                      />
                    </div>
                    <ErrorMessage name="firstname" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="lastname" className="text-sm font-medium text-foreground">
                      Last name
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <UserRound className="h-4 w-4 text-muted-foreground" />
                      <Field
                        id="lastname"
                        name="lastname"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="Last name"
                      />
                    </div>
                    <ErrorMessage name="lastname" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      Email
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

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="text-sm font-medium text-foreground">
                      Phone
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Field
                        id="phone"
                        name="phone"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Used for booking updates and account verification.
                    </p>
                    <ErrorMessage name="phone" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background px-3">
                      <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                      <Field
                        type="password"
                        id="password"
                        name="password"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="Create password"
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
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="h-11 w-full bg-transparent text-sm outline-none"
                        placeholder="Repeat password"
                      />
                    </div>
                    <ErrorMessage name="confirmPassword" component="p" className="mt-1 text-xs text-red-600" />
                  </div>

                  <div className="rounded-md bg-muted p-3 text-xs leading-5 text-muted-foreground sm:col-span-2">
                    Use at least 8 characters with uppercase, lowercase, number, and symbol.
                  </div>

                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
                  >
                    {loading || isSubmitting ? "Creating account..." : "Create account"}
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {error && (
                    <p className="text-center text-xs text-red-600 sm:col-span-2">
                      {String(error)}
                    </p>
                  )}

                  <p className="text-center text-xs leading-5 text-muted-foreground sm:col-span-2">
                    By creating an account, you agree to the Terms of Use and Privacy Policy.
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="relative overflow-hidden rounded-lg bg-[#101816] p-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,162,68,0.28),transparent_34%)]" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/10">
                <Scissors className="h-6 w-6 text-accent" />
              </div>
              <h2 className="mt-8 text-3xl font-semibold tracking-tight">
                Your salon schedule, messages, and bookings in one account.
              </h2>
              <div className="mt-8 grid gap-3">
                {["OTP verified signup", "Secure booking history", "Faster checkout later"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-white/65">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-white underline underline-offset-4">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </aside>

        <p className="text-center text-sm text-muted-foreground lg:hidden">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default UserSignUp;
