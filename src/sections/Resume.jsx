import { motion } from "framer-motion";

const Resume = () => {
  return (
    <section
      id="resume"
      className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 px-6 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-2xl text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Resume
        </h2>

        <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
          Over 5 years of experience driving results in customer success, technical consulting, and digital strategy.
          Proven track record managing campaigns, solving complex implementation challenges, and leading cross-functional collaboration.
        </p>
      </motion.div>
    </section>
  );
};

export default Resume;
