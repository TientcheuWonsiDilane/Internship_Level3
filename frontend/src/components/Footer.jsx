import React from "react";
import BrandLogo from "./BrandLogo";
import { Link } from "react-router-dom";

const Footer = () => {
  const footerLinks = [
    { label: "Help", to: "/contact" },
    { label: "Contact", to: "/contact" },
    { label: "Terms", to: "/terms" },
    { label: "Privacy", to: "/privacy" },
  ];

  return (
    <footer className="relative border-t border-white/8 bg-[#050506] px-6 py-16 md:py-20">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(5,5,6,0)_70%)] blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_0.8fr] md:items-end">
        <div className="max-w-2xl">
          <div className="flex items-end gap-3 md:gap-4">
            <BrandLogo
              to="/"
              className="mb-1"
              imageClassName="h-14 w-auto sm:h-16 md:h-20 lg:h-24"
            />
            <h2 className="text-5xl leading-none tracking-normal text-white md:text-7xl lg:text-8xl">etrics</h2>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <p className="max-w-xl text-base leading-7 text-white/55 md:text-lg md:text-right">
            Built for organizations, teams, workflows, and GitHub automations
            that need a cleaner way to move work from idea to delivery.
          </p>

          <nav
            aria-label="Footer links"
            className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
            {footerLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
