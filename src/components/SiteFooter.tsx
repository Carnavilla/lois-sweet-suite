import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-serif text-2xl">
            <span className="inline-block h-9 w-9 rounded-full bg-[var(--color-brand-gold)]" />
            Lois Pastries
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            A premium Nigerian bakery crafting celebration cakes, pastries and unforgettable moments.
          </p>
        </div>
        <div>
          <h4 className="font-serif text-lg">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li><Link to="/products" className="hover:text-[var(--color-brand-gold)]">All Pastries</Link></li>
            <li><Link to="/custom-cake" className="hover:text-[var(--color-brand-gold)]">Custom Cakes</Link></li>
            <li><Link to="/training" className="hover:text-[var(--color-brand-gold)]">Training Academy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg">Company</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li><Link to="/about" className="hover:text-[var(--color-brand-gold)]">About</Link></li>
            <li><Link to="/account" className="hover:text-[var(--color-brand-gold)]">My Account</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-serif text-lg">Get in touch</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /><span>polayinka49@gmail.com</span></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /><span>08089574740</span></li>
            <li className="mt-3 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="hover:text-[var(--color-brand-gold)]"><Instagram className="h-5 w-5" /></a>
              <a href="#" aria-label="Facebook" className="hover:text-[var(--color-brand-gold)]"><Facebook className="h-5 w-5" /></a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Lois Pastries. Baked with love in Nigeria.
      </div>
    </footer>
  );
          }
