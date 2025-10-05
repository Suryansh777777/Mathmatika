"use client";

import { motion, type Variants } from "motion/react";
import { memo } from "react";

interface AIOrbProps {
    status: "idle" | "listening" | "processing";
    size?: number;
}

function AIOrb({ status, size = 314 }: AIOrbProps) {
    // Animation variants for different states
    const containerVariants: Variants = {
        idle: {
            scale: 1,
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
            },
        },
        listening: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
        processing: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
    };

    const shape1Variants: Variants = {
        idle: {
            x: [0, 10, 0],
            y: [0, -5, 0],
            rotate: [0, 5, 0],
            transition: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
        listening: {
            x: [0, 15, 0],
            y: [0, -10, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            },
        },
        processing: {
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 0.9, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
            },
        },
    };

    const shape2Variants: Variants = {
        idle: {
            x: [0, -8, 0],
            y: [0, 8, 0],
            rotate: [0, -3, 0],
            transition: {
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
            },
        },
        listening: {
            x: [0, -12, 0],
            y: [0, 12, 0],
            scale: [1, 0.9, 1.1, 1],
            rotate: [0, -8, 0],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
            },
        },
        processing: {
            x: [0, -25, 15, 0],
            y: [0, 20, -15, 0],
            rotate: [0, -180, -360],
            scale: [1, 0.8, 1.3, 1],
            transition: {
                duration: 1.2,
                repeat: Infinity,
                ease: "linear",
                delay: 0.2,
            },
        },
    };

    const shape3Variants: Variants = {
        idle: {
            x: [0, 5, 0],
            y: [0, -3, 0],
            rotate: [0, 2, 0],
            transition: {
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
            },
        },
        listening: {
            x: [0, 8, 0],
            y: [0, -6, 0],
            scale: [1, 1.05, 0.95, 1],
            rotate: [0, 5, 0],
            transition: {
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
            },
        },
        processing: {
            x: [0, 12, -8, 0],
            y: [0, -12, 8, 0],
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.1, 0.9, 1.2, 1],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "linear",
                delay: 0.4,
            },
        },
    };

    const scaleFactor = size / 314;

    return (
        <motion.div
            className="relative overflow-hidden rounded-full"
            style={{
                width: size,
                height: size,
            }}
            variants={containerVariants}
            animate={status}
            initial="idle"
        >
            {/* Blur Shape 1 - Brown */}
            <motion.div
                className="absolute bg-[#8b7d70]"
                style={{
                    width: 165 * scaleFactor,
                    height: 114 * scaleFactor,
                    left: 124 * scaleFactor,
                    top: 100 * scaleFactor,
                    filter: `blur(${22.75 * scaleFactor}px)`,
                }}
                variants={shape1Variants}
                animate={status}
                initial="idle"
            />

            {/* Blur Shape 2 - Light Brown */}
            <motion.div
                className="absolute bg-[#d4cfc8]"
                style={{
                    width: 176 * scaleFactor,
                    height: 128 * scaleFactor,
                    left: 43 * scaleFactor,
                    top: 59 * scaleFactor,
                    filter: `blur(${22.75 * scaleFactor}px)`,
                }}
                variants={shape2Variants}
                animate={status}
                initial="idle"
            />

            {/* Blur Shape 3 - Warm Beige */}
            <motion.div
                className="absolute bg-[#e8e4df]"
                style={{
                    width: 129 * scaleFactor,
                    height: 114 * scaleFactor,
                    left: 66 * scaleFactor,
                    top: 112 * scaleFactor,
                    filter: `blur(${22.75 * scaleFactor}px)`,
                }}
                variants={shape3Variants}
                animate={status}
                initial="idle"
            />

            {/* Optional: Central orb overlay for additional effects */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    background: "radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)",
                }}
            />
        </motion.div>
    );
}

// Memoize component to prevent unnecessary re-renders
export default memo(AIOrb);