import AnimatedSection from "../components/AnimatedSection";

const Contact = () => {
  return (
    <AnimatedSection
      id="contact"
      className="bg-gray-100 dark:bg-gray-900 min-h-screen flex items-center justify-center"
    >
      <div className="w-full max-w-2xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Contact Me
        </h2>

        <form
          action="https://formspree.io/f/xrbpnprp"
          method="POST"
          className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg"
        >
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              name="message"
              rows="4"
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </AnimatedSection>
  );
};

export default Contact;
