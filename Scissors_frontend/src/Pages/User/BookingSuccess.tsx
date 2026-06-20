import { AlertCircle, CalendarCheck2, CheckCircle2, Loader2, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getCheckoutSessionStatus } from "@/features/user/api/UserAPI";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/primitives/alert";
import { Button } from "@/shared/ui/primitives/button";
import { Card, CardContent } from "@/shared/ui/primitives/card";

type ConfirmationState = "waiting" | "confirmed" | "failed";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [status, setStatus] = useState<ConfirmationState>("waiting");
  const [message, setMessage] = useState("Payment received. Waiting for secure webhook confirmation...");
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("failed");
      setMessage("Payment session was not found. Please check your appointments or try booking again.");
      return;
    }

    let cancelled = false;

    const pollWebhookConfirmation = async () => {
      try {
        const response = await getCheckoutSessionStatus(sessionId);
        if (cancelled) return;

        if (response.data.status === "confirmed") {
          setAppointmentId(response.data.appointmentId || null);
          setStatus("confirmed");
          setMessage("Your appointment has been confirmed by the payment webhook.");
          return true;
        }

        setStatus("waiting");
        setMessage("Payment received. Waiting for secure webhook confirmation...");
        return false;
      } catch (error: any) {
        if (cancelled) return;
        setStatus("failed");
        setMessage(
          error.response?.data?.message ||
            "Payment was completed, but confirmation status could not be checked. Please check your appointments."
        );
        return true;
      }
    };

    let attempts = 0;
    const maxAttempts = 10;

    pollWebhookConfirmation();
    const intervalId = window.setInterval(async () => {
      attempts += 1;
      const shouldStop = await pollWebhookConfirmation();
      if (shouldStop || attempts >= maxAttempts) {
        window.clearInterval(intervalId);
        if (!cancelled && !shouldStop) {
          setStatus("failed");
          setMessage("Payment received, but webhook confirmation is still pending. Please check your appointments shortly.");
        }
      }
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [sessionId]);

  const isConfirmed = status === "confirmed";
  const isWaiting = status === "waiting";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-4 py-10 text-slate-950">
      <Card className="w-full max-w-lg rounded-md border-slate-200 shadow-sm">
        <CardContent className="space-y-6 p-6 text-center sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            {isWaiting ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : isConfirmed ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-600" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Payment status
            </p>
            <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
              {isWaiting
                ? "Waiting for webhook"
                : isConfirmed
                  ? "Booking confirmed"
                  : "Confirmation needs attention"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
          </div>

          {appointmentId && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-xs font-medium uppercase text-slate-500">Appointment ID</p>
                  <p className="break-all font-semibold text-slate-950">{appointmentId}</p>
                </div>
              </div>
            </div>
          )}

          {status === "failed" && (
            <Alert variant="destructive" className="rounded-md text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Do not pay again immediately</AlertTitle>
              <AlertDescription>
                First check your appointments. If it is not listed after a minute, try again or contact support.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              onClick={() => navigate("/appointments")}
              className="h-11 rounded-md bg-emerald-700 text-white hover:bg-emerald-800"
              disabled={isWaiting}
            >
              <CalendarCheck2 className="h-4 w-4" />
              View appointments
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-md bg-white">
              <Link to="/">Return home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default BookingSuccess;
