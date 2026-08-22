import React from "react";
import Hero from "../components/Hero";
import BrandLogo from "../components/BrandLogo";
import { Link } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import CreateOrganizationModal from "../components/modals/CreateOrganizationModal";
import CreateTeamModal from "../components/modals/CreateTeamModal";
import { ArrowRight, GitBranch, Layers3, Users2, Workflow } from "lucide-react";

const featureCards = [
  {
    icon: Users2,
    title: "Organization first",
    description:
      "Keep projects, people, and permissions aligned in one workspace so every team operates from the same source of truth.",
  },
  {
    icon: Layers3,
    title: "Teams that ship together",
    description:
      "Create focused teams, assign ownership clearly, and keep collaboration tight across product, design, and engineering.",
  },
  {
    icon: Workflow,
    title: "Workflows that stay moving",
    description:
      "Track work from planning to delivery with lightweight workflows that reduce friction and keep momentum visible.",
  },
  {
    icon: GitBranch,
    title: "GitHub automations",
    description:
      "Automate repository activity, sync delivery signals, and connect code changes back to the work your teams are already doing.",
  },
];

const detailCards = [
  {
    icon: Users2,
    eyebrow: "Organizations",
    title: "Keep every workspace aligned",
    description:
      "Create a single operating layer for people, projects, and permissions so teams always know where work belongs and who owns it.",
  },
  {
    icon: Layers3,
    eyebrow: "Teams",
    title: "Structure collaboration with intent",
    description:
      "Organize teams around outcomes, reduce noise, and give each group the context they need to move fast without losing coordination.",
  },
  {
    icon: Workflow,
    eyebrow: "Workflows",
    title: "Make progress visible",
    description:
      "Keep planning, handoffs, and delivery in one rhythm so the path from idea to execution is easy to track and refine.",
  },
  {
    icon: GitBranch,
    eyebrow: "GitHub automations",
    title: "Connect code to operations",
    description:
      "Link repository events back to real work, automate repetitive updates, and keep engineering signals flowing into the rest of the platform.",
  },
];

const orbitItems = [
  {
    icon: Users2,
    title: "Organizations",
    className: "top-[10%] left-[50%]",
  },
  {
    icon: Layers3,
    title: "Teams",
    className: "top-[50%] left-[90%]",
  },
  {
    icon: Workflow,
    title: "Workflows",
    className: "top-[90%] left-[50%]",
  },
  {
    icon: GitBranch,
    title: "GitHub automations",
    className: "top-[50%] left-[10%]",
  },
];

const footerLinks = [
  { label: "Help", to: "/contact" },
  { label: "Contact", to: "/contact" },
  { label: "Terms", to: "/terms" },
  { label: "Privacy", to: "/privacy" },
];

const Landing = () => {
  const { showModal } = useModal();
  return (
    <div className="bg-[#050506] text-white overflow-hidden">
      <Hero />
      <section className="relative bg-[#050506] px-6 pb-24 pt-10 md:pt-14">
        <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(5,5,6,0)_70%)] blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-0 py-2 md:py-4">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-white/45">
                Connected operations
              </p>
              <h2 className="mt-4 text-3xl leading-[1.15] tracking-normal md:text-5xl md:leading-[1.12]">
                Run your organization with a single rhythm.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
                Metrics brings your organization, teams, workflows, and GitHub
                automations into one dark workspace so the entire delivery path
                stays visible and easy to act on.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => showModal(CreateOrganizationModal)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90">
                  Create Organization
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => showModal(CreateTeamModal)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                  Create Team
                </button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
  <div className="relative w-full max-w-[520px] aspect-square">
    <div className="absolute inset-10 rounded-full border border-white/10" />

    <div className="absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-[#050506] shadow-[0_0_70px_rgba(255,255,255,0.06)]" />

    <svg
      className="absolute inset-0 h-full w-full text-white/20"
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="50"
        cy="50"
        r="39"
        stroke="currentColor"
        strokeWidth="0.3"
        opacity="0.55"
      />
    </svg>

    <div className="absolute inset-0 pointer-events-none">
      {orbitItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className={`absolute flex flex-col items-center gap-2 pointer-events-auto -translate-x-1/2 -translate-y-1/2 ${item.className}`}
          >
            <div className="max-w-[140px] text-center text-sm font-medium text-white/90">
              {item.title}
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#050506] text-white shadow-[0_0_40px_rgba(255,255,255,0.05)]">
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#050506] px-6 pb-28 pt-4 md:pt-6">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-white/45">
              Feature detail
            </p>
            <h2 className="mt-4 text-3xl leading-[1.15] tracking-normal md:text-5xl md:leading-[1.12]">
              Every part of the workspace is built to move work forward.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              Each layer works on its own, but together they give teams a clean
              way to plan, collaborate, and automate delivery.
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {detailCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:border-white/15 md:p-7">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative flex h-full flex-col gap-5 md:flex-row md:items-start">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white shadow-inner shadow-white/5">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.28em] text-white/40">
                        {String(index + 1).padStart(2, "0")} · {card.eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl leading-snug tracking-normal text-white">
                        {card.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-white/60 md:text-base">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/8 bg-[#050506] px-6 py-16 md:py-20">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),rgba(5,5,6,0)_70%)] blur-3xl pointer-events-none" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.4fr_0.8fr] md:items-end">
          <div className="max-w-2xl">
            <div className="flex items-end gap-3 md:gap-4">
              <BrandLogo
                to="/"
                className="mb-1"
                imageClassName="h-14 w-auto sm:h-16 md:h-20 lg:h-24"
              />
              <h2 className="text-5xl leading-none tracking-normal text-white md:text-7xl lg:text-8xl">
                etrics
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6 md:items-end">
            <p className="max-w-xl text-base leading-7 text-white/55 md:text-lg md:text-right">
              Built for organizations, teams, workflows, and GitHub automations
              that need a cleaner way to move work from idea to delivery.
            </p>

            <nav
              aria-label="Footer links"
              className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-sm font-medium text-white/70 transition-colors hover:text-white">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
