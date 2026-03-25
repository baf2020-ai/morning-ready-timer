"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 새 팔레트 기반 컨페티 색상
const CONFETTI_COLORS = ["#6C5CE7", "#FFAD42", "#E84393", "#00B894", "#FF8FA3", "#54A0FF", "#A29BFE"];
// 별/하트/리본 모양 (이모지 대신 유니코드 도형 + 커스텀)
const SHAPES = ["★", "♥", "✦", "●", "♦"];

interface Particle {
  id: number;
  x: number;
  color: string;
  shape: string;
  delay: number;
  duration: number;
  rotation: number;
  size: number;
  wobble: number;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      delay: Math.random() * 0.6,
      duration: 2.5 + Math.random() * 2,
      rotation: Math.random() * 360,
      size: 12 + Math.random() * 16,
      wobble: (Math.random() - 0.5) * 100,
    }));
    setParticles(items);

    const timer = setTimeout(() => setShow(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0, scale: 0 }}
              animate={{
                y: "110vh",
                x: `${p.x + p.wobble / 10}vw`,
                opacity: [1, 1, 0],
                rotate: p.rotation + 720,
                scale: [0, 1.2, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
                scale: { duration: 0.3, delay: p.delay },
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
