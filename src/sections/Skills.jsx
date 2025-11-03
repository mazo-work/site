import AnimatedSection from "../components/AnimatedSection";

const skills = [
  {
    title: "Strategic Account Management",
    description:
      "Developed and maintained strong relationships with high-value clients by providing proactive support, campaign performance reviews, and optimization strategies aligned with business goals.",
    tags: ["Client Success", "Retention", "Strategic Partnerships"],
  },
  {
    title: "Cross-Functional Collaboration",
    description:
      "Worked closely with product, engineering, and sales teams to deliver solutions tailored to client objectives, including new feature rollout support and feedback loops into product development.",
    tags: ["Internal Alignment", "CS-to-Product", "Agile Teams"],
  },
  {
    title: "Platform & Data Enablement",
    description:
      "Educated clients on advanced platform features, implemented custom reporting dashboards, and translated data insights into actionable recommendations to drive measurable results.",
    tags: ["AdTech Tools", "Data Fluency", "Client Enablement"],
  },
  {
    title: "Onboarding & Adoption Programs",
    description:
      "Designed onboarding journeys that accelerated time-to-value and improved adoption rates by standardizing best practices, QBRs, and support materials across verticals.",
    tags: ["Onboarding", "Playbooks", "Training"],
  },
  {
    title: "Escalation & Issue Resolution",
    description:
      "Managed complex client issues with urgency and transparency, aligning cross-functional resources and clear communication to ensure retention and satisfaction.",
    tags: ["Client Advocacy", "Resolution Management", "CX"],
  },
];

const Card = ({ title, description, tags }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow transition transform hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{description}</p>
    <div className="flex flex-wrap gap-2 mt-auto">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
);

const Skills = () => {
  return (
    <AnimatedSection
      id="skills"
      className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center"
    >
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Skills
        </h2>

        <div className="flex flex-col items-center gap-10">
          {/* Top Row - 3 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
            {skills.slice(0, 3).map((skill, index) => (
              <Card key={index} {...skill} />
            ))}
          </div>

          {/* Bottom Row - 2 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-[960px] items-stretch mx-auto">
            {skills.slice(3).map((skill, index) => (
              <Card key={index + 3} {...skill} />
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
};

export default Skills;
