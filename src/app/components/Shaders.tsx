// src/app/components/Shaders.tsx
'use client';

import { useEffect, useRef } from 'react';

// Animated Grid Shader - subtle animated grid lines
export function AnimatedGrid() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px',
                    animation: 'grid-drift 20s linear infinite',
                }}
            />
            <style jsx>{`
                @keyframes grid-drift {
                    0% {
                        transform: translate(0, 0);
                    }
                    100% {
                        transform: translate(80px, 80px);
                    }
                }
            `}</style>
        </div>
    );
}

// Gradient Orbs - floating animated gradient spheres
export function GradientOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large red orb - top right */}
            <div
                className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(249, 115, 22, 0.2) 50%, transparent 70%)',
                    animation: 'float-1 20s ease-in-out infinite',
                }}
            />

            {/* Medium orange orb - bottom left */}
            <div
                className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, rgba(239, 68, 68, 0.2) 50%, transparent 70%)',
                    animation: 'float-2 25s ease-in-out infinite',
                }}
            />

            {/* Small blue orb - center */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-3xl"
                style={{
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                    animation: 'float-3 30s ease-in-out infinite',
                }}
            />

            <style jsx>{`
                @keyframes float-1 {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    50% {
                        transform: translate(-50px, 50px) scale(1.1);
                    }
                }
                @keyframes float-2 {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    50% {
                        transform: translate(50px, -50px) scale(1.15);
                    }
                }
                @keyframes float-3 {
                    0%, 100% {
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        transform: translate(calc(-50% + 30px), calc(-50% - 30px)) scale(1.2);
                    }
                }
            `}</style>
        </div>
    );
}

// Noise Grain Shader - subtle film grain texture
export function NoiseGrain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = 400;
        canvas.height = 400;

        // Create noise
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const buffer = new Uint32Array(imageData.data.buffer);

        for (let i = 0; i < buffer.length; i++) {
            const gray = Math.random() * 255;
            buffer[i] = (255 << 24) | (gray << 16) | (gray << 8) | gray;
        }

        ctx.putImageData(imageData, 0, 0);
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none"
            style={{
                mixBlendMode: 'overlay',
                backgroundSize: '200px 200px',
            }}
        />
    );
}

// Mesh Gradient - smooth animated gradient mesh
export function MeshGradient() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `
                        radial-gradient(at 0% 0%, rgba(239, 68, 68, 0.2) 0px, transparent 50%),
                        radial-gradient(at 100% 0%, rgba(249, 115, 22, 0.2) 0px, transparent 50%),
                        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
                        radial-gradient(at 0% 100%, rgba(239, 68, 68, 0.15) 0px, transparent 50%)
                    `,
                    filter: 'blur(60px)',
                    animation: 'mesh-shift 15s ease-in-out infinite',
                }}
            />
            <style jsx>{`
                @keyframes mesh-shift {
                    0%, 100% {
                        transform: scale(1) rotate(0deg);
                    }
                    50% {
                        transform: scale(1.1) rotate(2deg);
                    }
                }
            `}</style>
        </div>
    );
}

// Spotlight Effect - follows cursor
export function Spotlight() {
    const spotlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (spotlightRef.current) {
                spotlightRef.current.style.background = `
                    radial-gradient(600px circle at ${e.clientX}px ${e.clientY}px,
                    rgba(239, 68, 68, 0.08),
                    transparent 40%)
                `;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={spotlightRef}
            className="fixed inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300"
        />
    );
}

// Aurora Wave - flowing liquid gradient effect
export function AuroraWave() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Main Aurora Wave */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 80% 50% at 50% -20%,
                            rgba(239, 68, 68, 0.3),
                            transparent 50%),
                        radial-gradient(ellipse 60% 50% at 50% 120%,
                            rgba(249, 115, 22, 0.25),
                            transparent 50%)
                    `,
                    filter: 'blur(60px)',
                    animation: 'aurora-wave 15s ease-in-out infinite',
                }}
            />

            {/* Secondary wave layer */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(ellipse 70% 60% at 20% 50%,
                            rgba(249, 115, 22, 0.2),
                            transparent 50%),
                        radial-gradient(ellipse 70% 60% at 80% 50%,
                            rgba(59, 130, 246, 0.15),
                            transparent 50%)
                    `,
                    filter: 'blur(80px)',
                    animation: 'aurora-wave-2 20s ease-in-out infinite',
                }}
            />

            {/* Accent glow */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
                        radial-gradient(circle at 50% 50%,
                            rgba(239, 68, 68, 0.15),
                            transparent 40%)
                    `,
                    filter: 'blur(100px)',
                    animation: 'aurora-pulse 8s ease-in-out infinite',
                }}
            />

            <style jsx>{`
                @keyframes aurora-wave {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                        opacity: 0.8;
                    }
                    50% {
                        transform: translateY(-30px) scale(1.1);
                        opacity: 1;
                    }
                }
                @keyframes aurora-wave-2 {
                    0%, 100% {
                        transform: translateY(0) translateX(0) rotate(0deg);
                        opacity: 0.7;
                    }
                    50% {
                        transform: translateY(20px) translateX(30px) rotate(5deg);
                        opacity: 0.9;
                    }
                }
                @keyframes aurora-pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.2);
                        opacity: 0.8;
                    }
                }
            `}</style>
        </div>
    );
}
