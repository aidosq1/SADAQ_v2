"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    rotationFactor?: number; // How much it tilts (higher = more tilt)
}

export function TiltCard({
    children,
    className,
    rotationFactor = 20,
    ...props
}: TiltCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({ opacity: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();

        // Calculate mouse position relative to center of card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -rotationFactor; // Invert Y axis for natural feel
        const rotateY = ((x - centerX) / centerX) * rotationFactor;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out',
        });

        // Optional: Spotlight/Glow effect
        setGlowStyle({
            opacity: 1,
            background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.1), transparent 80%)`
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-out',
        });
        setGlowStyle({ opacity: 0, transition: 'opacity 0.5s ease-out' });
    };

    return (
        <div
            ref={cardRef}
            className={cn("relative transition-all duration-200", className)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transformStyle: 'preserve-3d', ...style }} // Important for 3D
            {...props}
        >
            <div className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" style={glowStyle} />
            {children}
        </div>
    );
}
