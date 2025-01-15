import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-10">
      <div className="container mx-auto justify-between ">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Column 1: Explore */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="hover:text-blue-500 transition duration-300">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-blue-500 transition duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="/services" className="hover:text-blue-500 transition duration-300">
                  Services
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-blue-500 transition duration-300">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Column 2: Utility Pages */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Utility Pages</h3>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="hover:text-blue-500 transition duration-300">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:text-blue-500 transition duration-300">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-blue-500 transition duration-300">
                  Terms of Use
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Keep in Touch */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Keep in Touch</h3>
            <ul className="space-y-2">
              <li>Address: Mariendalsvej 50D 2 2000 Frederiksberg</li>
              <li>Mail: <a href="mailto:support@Scissors.com" className="hover:text-blue-500 transition duration-300">support@Scissors.com</a></li>
              <li>Phone: <a href="tel:+221234567900" className="hover:text-blue-500 transition duration-300">(+22) 123 - 4567 - 900</a></li>
            </ul>
            {/* Social Media Icons */}
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition duration-300">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition duration-300">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition duration-300">
                <FaLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition duration-300">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 text-center text-sm text-gray-400 bg-black">
          Copyright © 2023, Scissors.dk | All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
