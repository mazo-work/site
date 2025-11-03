import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Hero from "./sections/Hero";
import About from "./sections/About";
import Skills from "./sections/Skills";
import Resume from "./sections/Resume";
import Contact from "./sections/Contact";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dark:bg-gray-900 dark:text-white font-sans scroll-smooth">
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto px-4 pt-24 gap-10">
        {/* Sidebar (Drawer on mobile, sticky on desktop) */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1">
          <Hero />
          <About />
          <Skills />
          <Resume />
          <Contact />
        </main>
      </div>
    </div>
  );
}

export default App;
