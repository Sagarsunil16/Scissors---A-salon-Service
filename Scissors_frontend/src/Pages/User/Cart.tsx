import { useState } from "react";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";

const Cart = () => {
  // Sample cart data (Replace with actual state management or API calls)
  const [cart, setCart] = useState([
    { id: 1, name: "Haircut", price: 20 },
    { id: 2, name: "Facial", price: 50 },
    { id: 3, name: "Manicure", price: 30 },
  ]);

  // Function to remove a service from the cart
  const removeFromCart = (id) => {
    setCart(cart.filter((service) => service.id !== id));
  };

  // Calculate total price
  const totalPrice = cart.reduce((acc, service) => acc + service.price, 0);

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-6">Your Cart</h2>
        {cart.length > 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <ul>
              {cart.map((service) => (
                <li
                  key={service.id}
                  className="flex justify-between items-center border-b py-3"
                >
                  <span className="text-lg">{service.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-700 font-medium">${service.price}</span>
                    <button
                      onClick={() => removeFromCart(service.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-6 text-xl font-semibold">
              <span>Total:</span>
              <span>${totalPrice}</span>
            </div>
            <button
              className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Proceed to Checkout
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
