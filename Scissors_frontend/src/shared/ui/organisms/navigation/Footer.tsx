import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import BrandMark from "@/shared/ui/atoms/BrandMark";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-[#101816] text-white">
      <div className="section-shell py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <BrandMark tone="dark" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              Premium salon discovery, booking, and business management in one
              calm product experience.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              Explore
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li><a href="/" className="hover:text-white">Home</a></li>
              <li><a href="/salons" className="hover:text-white">Salons</a></li>
              <li><a href="/login" className="hover:text-white">Login</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              For Business
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li><a href="/salon/register" className="hover:text-white">Register salon</a></li>
              <li><a href="/salon/login" className="hover:text-white">Salon login</a></li>
              <li><a href="/admin/login" className="hover:text-white">Admin</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
              Contact
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li>support@scissors.com</li>
              <li>(+22) 123 - 4567 - 900</li>
            </ul>
            <div className="mt-5 flex gap-4 text-white/70">
              <a href="https://facebook.com" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://twitter.com" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn"><FaLinkedin /></a>
              <a href="https://instagram.com" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-sm text-white/50">
          Copyright 2026, Scissors. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
