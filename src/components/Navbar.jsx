import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkStyle =
    "block py-2 px-4 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400 transition";

  const navLinks = (
    <>
      <a href="#hero" className={linkStyle} onClick={() => setIsMenuOpen(false)}>
        Home
      </a>
      <a href="#about" className={linkStyle} onClick={() => setIsMenuOpen(false)}>
        About
      </a>
      <a href="#skills" className={linkStyle} onClick={() => setIsMenuOpen(false)}>
        Skills
      </a>
      <a href="#resume" className={linkStyle} onClick={() => setIsMenuOpen(false)}>
        Resume
      </a>
      <a href="#contact" className={linkStyle} onClick={() => setIsMenuOpen(false)}>
        Contact
      </a>
    </>
  );

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/70 dark:bg-gray-900/70 shadow-sm transition ${
        scrolled ? "border-b border-gray-200 dark:border-gray-700" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Name */}
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          Jonathan Mazo
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks}
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center space-x-3">
          {/* Sidebar toggle for mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-800 dark:text-gray-200"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Hamburger menu for nav links */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800 dark:text-gray-200"
            aria-label="Toggle Nav"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Links */}
      {isMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex flex-col space-y-2 bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
            {navLinks}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
