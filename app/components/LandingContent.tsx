import React from "react";

export const ARCHITECTGPT_URL = "https://www.architectgpt.io";
export const REACT_PLANNER_URL = "https://github.com/cvdlab/react-planner";

export const FAQ_ITEMS: Array<{ question: string; answer: string }> = [
  {
    question: "Is ArchiPi really free?",
    answer:
      "Yes. ArchiPi is completely free to use. There are no paid tiers, trials, or hidden fees — every feature, including the 3D view and OBJ export, is available to everyone.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. ArchiPi requires no signup or login. Open the app in your browser and start drawing your floor plan right away.",
  },
  {
    question: "Can I export my floor plan?",
    answer:
      "Yes. You can export your design as a 3D OBJ model for use in other 3D software, and you can save and load your project files locally at any time.",
  },
  {
    question: "Where is my work saved?",
    answer:
      "Your project is autosaved locally in your browser, so you can close the tab and pick up where you left off on the same device. You can also download your project as a file for safekeeping or to move it between devices.",
  },
  {
    question: "Does ArchiPi work on mobile devices?",
    answer:
      "ArchiPi is designed for desktop browsers, where precise drawing with a mouse or trackpad works best. On phones and tablets you will be asked to switch to a desktop browser.",
  },
  {
    question: "Who makes ArchiPi?",
    answer:
      "ArchiPi is built by the team behind ArchitectGPT, an AI-powered home and interior design product. ArchiPi builds on the open-source react-planner project by CVDLAB.",
  },
];

const FEATURES: Array<{ title: string; text: string }> = [
  {
    title: "2D floor plan drawing",
    text: "Draw walls, add doors and windows, and lay out rooms with snapping to points, lines, and a grid.",
  },
  {
    title: "Instant 3D view",
    text: "Switch to a 3D or first-person view of your plan at any time to walk through your design.",
  },
  {
    title: "Furniture catalog",
    text: "Furnish your plan with a catalog of sofas, beds, tables, kitchen items, and more.",
  },
  {
    title: "OBJ export",
    text: "Export your design as a standard OBJ 3D model for use in other tools.",
  },
  {
    title: "Autosave",
    text: "Your work is saved locally in your browser automatically — no account needed.",
  },
  {
    title: "No signup required",
    text: "Start designing immediately. ArchiPi is free and runs entirely in your browser.",
  },
];

/**
 * Server-rendered, crawlable landing content. It sits in normal document flow
 * below the full-viewport planner, so it never overlaps the app and is only
 * seen when a visitor (or crawler) scrolls past the first screen.
 */
export default function LandingContent() {
  return (
    <section
      aria-label="About ArchiPi"
      className="w-full bg-zinc-950 text-zinc-300 border-t border-zinc-800"
    >
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <header className="space-y-4">
          <h1 className="text-3xl font-bold text-zinc-100">
            Free Online Floor Plan Creator
          </h1>
          <p className="font-light leading-relaxed">
            ArchiPi is a free floor plan design tool that runs entirely in your
            browser. Sketch your home, apartment, or office in 2D, furnish it
            from a built-in catalog, then explore it in 3D — no signup, no
            downloads, and no cost. Your work autosaves locally, and you can
            export your design as a 3D OBJ model whenever you like.
          </p>
        </header>

        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Features</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map(({ title, text }) => (
              <li
                key={title}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4"
              >
                <h3 className="font-medium text-zinc-100 mb-1">{title}</h3>
                <p className="text-sm font-light text-zinc-400">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-zinc-100 mb-4">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {FAQ_ITEMS.map(({ question, answer }) => (
              <div key={question}>
                <dt className="font-medium text-zinc-100 mb-1">{question}</dt>
                <dd className="text-sm font-light text-zinc-400 leading-relaxed">
                  {answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <footer className="text-sm font-light text-zinc-500 border-t border-zinc-800 pt-6 space-y-1">
          <p>
            From the makers of{" "}
            <a
              href={ARCHITECTGPT_URL}
              target="_blank"
              rel="noopener"
              className="text-zinc-300 hover:text-zinc-100 underline underline-offset-2 transition-colors"
            >
              ArchitectGPT
            </a>{" "}
            — AI-powered home and interior design.
          </p>
          <p>
            Built on{" "}
            <a
              href={REACT_PLANNER_URL}
              target="_blank"
              rel="noopener"
              className="text-zinc-300 hover:text-zinc-100 underline underline-offset-2 transition-colors"
            >
              react-planner
            </a>{" "}
            by CVDLAB (MIT License).
          </p>
        </footer>
      </div>
    </section>
  );
}
