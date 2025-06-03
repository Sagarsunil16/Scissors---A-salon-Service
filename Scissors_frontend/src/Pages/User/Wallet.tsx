import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import ProfileNavbar from "../../Components/ProfileNavbar";
import { getWalletBalance, getWalletTransactions } from "../../Services/UserAPI";
import { toast } from "react-toastify";
import moment from "moment-timezone";

interface Transaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  description: string;
  createdAt: string;
  appointment?: {
    _id: string;
  };
}

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [balanceResponse, transactionsResponse] = await Promise.all([
          getWalletBalance(),
          getWalletTransactions({ page: currentPage, limit: transactionsPerPage }),
        ]);
        setBalance(balanceResponse.data.data.balance);
        setTransactions(transactionsResponse.data.data.transactions);
        setTotalPages(transactionsResponse.data.data.pages || 1);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch wallet data");
        toast.error(err.response?.data?.message || "Failed to fetch wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const formatDate = (date: string) => {
    return moment.utc(date).tz("Asia/Kolkata").format("Do MMMM, YYYY, h:mm A");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="flex justify-center py-4 mt-20">
        <ProfileNavbar />
      </div>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Wallet</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-8 text-lg font-medium">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Balance */}
            <Card className="lg:col-span-1 shadow-xl rounded-xl bg-white">
              <CardHeader className="bg-black rounded-t-xl">
                <CardTitle className="text-xl font-semibold text-white">Wallet Balance</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <p className="text-5xl font-extrabold text-gray-900">
                    ₹{balance !== null ? balance.toFixed(2) : "0.00"}
                  </p>
                  <p className="text-sm text-gray-600">Available Balance as of {moment().format("Do MMMM, YYYY")}</p>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Last Updated</p>
                    <p className="text-xs text-gray-500">{moment().format("h:mm A, MMMM Do, YYYY")}</p>
                  </div>
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Currency</p>
                    <p className="text-sm text-gray-900">Indian Rupee (INR)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="lg:col-span-1 shadow-xl rounded-xl bg-white">
              <CardHeader className="bg-black rounded-t-xl">
                <CardTitle className="text-xl font-semibold text-white">Transaction History</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No transactions found</p>
                ) : (
                  <>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {transactions.map((transaction) => (
                        <div
                          key={transaction._id}
                          className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                          </div>
                          <p
                            className={`text-sm font-semibold ${
                              transaction.type === "credit" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-6">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1 || loading}
                        onClick={() => handlePageChange(currentPage - 1)}
                        className="text-sm px-4 py-2 border-gray-300 hover:bg-gray-50"
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages || loading}
                        onClick={() => handlePageChange(currentPage + 1)}
                        className="text-sm px-4 py-2 border-gray-300 hover:bg-gray-50"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wallet;