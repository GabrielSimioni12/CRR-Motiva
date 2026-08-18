"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * app/template.tsx (diferente de layout.tsx) remonta a cada navegação,
 * então dá pra animar a entrada de cada rota sem perder o estado
 * persistente do layout (Nav fica fora disso).
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
