import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-[var(--color-brand-ink)] text-[var(--color-brand-cream)]">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 font-serif text-2xl">
            <span className="inline-block h-9 w-9 rounded-full bg-[var(--color-brand-gold)]" />
            Lois Pastries
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            A premium Nigerian bakery crafting celebration cakes, pastries and
            unforgettable moments — by Chef Lois Olayinka.
          </p>
          <div className="mt-5 flex items-center gap-3">
            
              href="#"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--color-brand-gold)] hover:text-[var(--color-brand-ink)]"
            >
              <Instagram className="h-4 w-4" />
            </a>
            
              href="#"
              aria-label="Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-[var(--color-brand-gold)] hover:text-[var(--color-brand-ink)]"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-serif text-lg">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li><Link to="/products" className="hover:text-[var(--color-brand-gold)] transition-colors">All Pastries</Link></li>
            <li><Link to="/custom-cake" className="hover:text-[var(--color-brand-gold)] transition-colors">Custom Cakes</Link></li>
            <li><Link to="/training" className="hover:text-[var(--color-brand-gold)] transition-colors">Training Academy</Link></li>
            <li><Link to="/cart" className="hover:text-[var(--color-brand-gold)] transition-colors">My Cart</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-serif text-lg">Company</h4>
          <ul className="mt-4 space-y-2 text-sm opacity-90">
            <li><Link to="/about" className="hover:text-[var(--color-brand-gold)] transition-colors">About Chef Lois</Link></li>
            <li><Link to="/account" className="hover:text-[var(--color-brand-gold)] transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-serif text-lg">Get in touch</h4>
          <ul className="mt-4 space-y-3 text-sm opacity-90">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
              <span>hello@loispastries.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-[var(--color-brand-gold)]" />
              <span>+234 800 000 0000</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 py-5 text-center text-xs opacity-60">
        © {new Date().getFullYear()} Lois Pastries. Baked with love in Nigeria.
      </div>
    </footer>
  );
}
