"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONFETTI_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FFB3BA", "#BAE1FF", "#E8BAFF", "#BAFFC9"];
const SHAPES = ["●", "★", "♥", "◆"];

interface Particle {
  id: number;
  x: number;
  color: string;
  shape: string;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
      size: 14 + Math.random() * 14,
    }));
    setParticles(items);

    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
              animate={{ y: "110vh", opacity: 0, rotate: p.rotation + 360 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
              className="absolute"
              style={{
                fontSize: p.size,
                color: p.color,
                left: 0,
              }}
            >
              {p.shape}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
