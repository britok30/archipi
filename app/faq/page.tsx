import React from "react";
import PageHeader from "../components/PageHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ArchiPi | FAQ",
  alternates: {
    canonical: "https://www.archipi.io/faq",
  },
  openGraph: {
    title: "ArchiPi | FAQ",
    url: "https://www.archipi.io/faq",
  },
};

export default function Faq() {
  return (
    <>
      <div className="flex justify-center text-white bg-black flex-col items-center min-h-screen antialiased px-4 py-5 space-y-5">
        <PageHeader title="Frequently Asked Questions (FAQ)" />
        <div className="w-full text-base md:w-[750px] space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-3">What is ArchiPi?</h2>
            <p>
              ArchiPi is an intuitive online tool designed for creating detailed
              2D floor plans and exploring them in immersive 3D. It allows users
              to easily draw floor plans, utilize a vast catalog of customizable
              objects for drag-and-drop modeling, and navigate their designs in
              3D, all within a web browser
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Is ArchiPi free to use?
            </h2>
            <p>
              Yes, ArchiPi is a free tool that allows users to design floor
              plans and model in 3D without any cost.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Can I use ArchiPi without any design experience?
            </h2>
            <p>
              Absolutely! ArchiPi is built for users of all skill levels, from
              beginners to professionals. With its user-friendly interface and
              drag-and-drop functionality, anyone can start designing floor
              plans and visualizing them in 3D.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              How does the 2D to 3D feature work?
            </h2>
            <p>
              After drawing your floor plan in 2D, ArchiPi enables you to
              seamlessly switch to a 3D view, where you can navigate and explore
              your design in a realistic environment. This helps in better
              understanding the spatial dynamics and aesthetics of your plan.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Can I save and share my designs?
            </h2>
            <p>
              Yes, with ArchiPi, you can save your designs and share them with
              others. This is particularly useful for collaboration with
              clients, colleagues, or for personal record-keeping.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              What kind of projects can I create with ArchiPi?
            </h2>
            <p>
              ArchiPi is versatile enough for a wide range of projects,
              including residential and commercial floor plans, interior design
              layouts, or whatever your heart desires. Whether you&apos;re
              remodeling your home or planning office space, ArchiPi can
              accommodate your needs.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-3">
              Do I need to install any software to use ArchiPi?
            </h2>
            <p>
              No, ArchiPi operates entirely in your web browser, eliminating the
              need for any software installation. This makes it accessible from
              any device with internet access.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-3">
              How do I get started with ArchiPi?
            </h2>
            <p>
              Getting started is as simple as visiting the ArchiPi website and
              you can immediately begin creating your first project using the
              tool&apos;s intuitive design interface.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
