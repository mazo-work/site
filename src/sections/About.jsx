import AnimatedSection from "../components/AnimatedSection";

const About = () => {
  return (
    <AnimatedSection id="about" className="bg-gray-50 dark:bg-gray-800 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          About Me
        </h2>
        <p className="text-gray-700 dark:text-gray-300 text-lg">
          With a foundation in data analytics and over 5 years of experience in customer success, 
          technical consulting, and programmatic advertising, I specialize in bridging the gap between 
          complex technology and business outcomes. I am fully bilingual in English and Spanish, which allows me 
          to support and collaborate effectively with diverse client and internal teams.
        </p>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
          I’ve led cross-functional initiatives, managed high-value client portfolios, and acted 
          as a strategic advisor across a range of verticals. Whether solving implementation 
          challenges, optimizing campaigns, or improving internal workflows — I bring structure, 
          clarity, and focus to every stage of execution.
        </p>
      </div>
    </AnimatedSection>
  );
};

export default About;
