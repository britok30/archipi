"use client";

import React from "react";
import hero from "../../public/main.jpg";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

const PageHeader = ({ title }) => {
  return (
    <div className="h-[70vh] relative text-white  w-full overflow-hidden mb-6">
      <Image
        className="opacity-40"
        src={hero}
        alt="main-img"
        fill
        style={{
          objectFit: "cover",
          filter: "saturate(135%)",
          zIndex: "0",
        }}
        placeholder="blur"
        priority={true}
      />
      <div className="z-10 flex flex-col justify-center items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full">
        <motion.h1
          className="m-0 text-center text-4xl md:text-6xl font-light mb-8 text-white select-none"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h1>

        <button className="bg-white mt-5 hover:scale-105 rounded-md text-black px-2 py-1 transition duration-300 ease-in-out">
          <Link href="/">Return Home</Link>
        </button>
      </div>
    </div>
  );
};

export default PageHeader;
