import headshot from "../assets/headshot.jpg";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile drawer background */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar content */}
      <aside
        className={`
          fixed top-0 left-0 z-50 w-80 h-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg p-6 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:h-auto lg:w-full lg:max-w-xs lg:sticky lg:top-20 lg:self-start lg:rounded-lg
        `}
        onClick={(e) => e.stopPropagation()} // prevents outside click from closing sidebar
      >
        <div className="flex flex-col items-center text-center">
          {/* Headshot */}
          <img
            src={headshot}
            alt="Jonathan Mazo"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 mb-4"
          />

          {/* Name */}
          <h2 className="text-2xl font-bold mb-2">Jonathan Mazo</h2>

          {/* Skills */}
          <div className="text-left w-full mt-4">
            <h3 className="text-lg font-semibold mb-2">Key Strengths</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Strategic Client Management</li>
              <li>Cross-Functional Communication</li>
              <li>Data-Driven Optimization</li>
              <li>AdTech & Programmatic Expertise</li>
              <li>Bilingual: English & Spanish</li>
            </ul>
          </div>

          {/* Technologies */}
          <div className="text-left w-full mt-6">
            <h3 className="text-lg font-semibold mb-2">Technologies</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>SQL / Tableau / Excel</li>
              <li>CRM & Marketing Tools</li>
              <li>React / Vite / Tailwind</li>
            </ul>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
