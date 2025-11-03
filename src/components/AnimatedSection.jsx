import { motion } from "framer-motion";

const AnimatedSection = ({ children, id, className = "" }) => {
  return (
    <motion.section
      id={id}
      className={`px-6 py-16 ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.section>
  );
};

export default AnimatedSection;
