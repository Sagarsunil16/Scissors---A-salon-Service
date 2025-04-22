import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../../Components/ui/alert";
import { CheckCircle2, X } from "lucide-react";

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (sessionId) {
      setShowPopup(true);
      const timer = setTimeout(() => {
        setShowPopup(false);
        navigate("/");
      }, 5000); // Redirect after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Main Content */}
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Your appointment has been booked successfully. You'll receive a
            confirmation email soon.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Redirecting to homepage in a few seconds...
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>

      {/* Pop-up Alert */}
      {showPopup && (
        <div className="fixed bottom-4 right-4 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
          <Alert className="bg-green-600 text-white border-none shadow-lg">
            <AlertTitle className="flex items-center justify-between">
              <span>Success!</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPopup(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </AlertTitle>
            <AlertDescription>
              Your payment was processed successfully!
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
};

export default BookingSuccess;