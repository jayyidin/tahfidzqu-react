"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Applet Reconstructed
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          The application structure has been restored.
        </p>
      </motion.div>
    </main>
  );
}
