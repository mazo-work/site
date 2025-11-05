import AnimatedSection from "../components/AnimatedSection";

const Hero = () => {
  return (
    <AnimatedSection
      id="hero"
      className="min-h-screen bg-white dark:bg-gray-900 flex flex-col justify-center items-center text-center"
    >
      <div className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Hi, I'm Jonathan Mazo
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg sm:text-xl mb-6">
          I’m passionate about connecting data to decisions — turning complexity into clarity through curiosity, creative problem-solving, and insight-driven strategy.
        </p>
        <a
          href="#contact"
          className="inline-block px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Let’s Connect
        </a>
      </div>
    </AnimatedSection>
  );
};

export default Hero;
