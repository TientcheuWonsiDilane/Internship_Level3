import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Button from "./Button";
import BrandLogo from "./BrandLogo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  return (
    <header className="absolute top-2 z-50 w-full px-6 md:px-12 py-5 md:py-5 flex justify-between md:justify-evenly items-center bg-transparent">
      <BrandLogo
        to="/"
        className="z-50 relative"
        imageClassName="h-8 sm:h-9 md:h-10 lg:h-11"
      />

      <nav className="hidden md:block navlinks">
        <ul className="flex justify-center items-center gap-6 lg:gap-9 text-[1rem] lg:text-[1.1rem] font-medium text-gray-300">
          <li>
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/for-teams"
              className="hover:text-white transition-colors">
              Teams
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-white transition-colors">
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      <div className="hidden md:flex authBtns gap-6 lg:gap-9">
        <Link to="/login">
          <Button title="Sign in" type="white" />
        </Link>
        <Link to="/register">
          <Button title="Sign up" type="outline" />
        </Link>
      </div>

      <button
        className="md:hidden text-white z-50 relative"
        onClick={toggleMenu}
        aria-label="Toggle menu">
        {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
      </button>

      <div
        className={`fixed inset-0 bg-[#06040a]/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center transition-all duration-300 ease-in-out md:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <nav className="flex flex-col items-center gap-8 mb-12">
          <Link
            to="/"
            onClick={toggleMenu}
            className="text-3xl font-medium text-gray-200 hover:text-white transition-colors">
            Home
          </Link>
          <Link
            to="/for-teams"
            onClick={toggleMenu}
            className="text-3xl font-medium text-gray-200 hover:text-white transition-colors">
            Teams
          </Link>
          <Link
            to="/about"
            onClick={toggleMenu}
            className="text-3xl font-medium text-gray-200 hover:text-white transition-colors">
            About
          </Link>
          <Link
            to="/contact"
            onClick={toggleMenu}
            className="text-3xl font-medium text-gray-200 hover:text-white transition-colors">
            Contact
          </Link>
        </nav>
        <div className="flex flex-col gap-4 w-[200px]">
          <Link to="/login" onClick={toggleMenu} className="w-full">
            <Button
              title="Sign in"
              type="white"
              className="w-full text-lg py-3"
            />
          </Link>
          <Link to="/register" onClick={toggleMenu} className="w-full">
            <Button
              title="Sign up"
              type="outline"
              className="w-full text-lg py-3"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
