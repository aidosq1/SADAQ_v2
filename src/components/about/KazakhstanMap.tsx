"use client";

import React, { useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";

// Import local JSON directly
import topoData from "@/app/about/regions/kazakhstan.json";

interface KazakhstanMapProps {
    onRegionSelect?: (regionName: string) => void;
}

const geoUrl = topoData as any;

export function KazakhstanMap({ onRegionSelect }: KazakhstanMapProps) {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

    return (
        <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden relative map-wrapper bg-white">
            {/* Injecting user-specific styles */}
            <style jsx global>{`
        .map-wrapper svg {
            filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
        }
        .map-wrapper svg path {
            fill: #D1D5DB !important; /* Серый цвет для всех областей */
            stroke: #FFFFFF !important; /* Белые границы */
            stroke-width: 1.5px !important;
            transition: all 0.3s ease !important; /* Плавность */
            cursor: pointer !important; /* Курсор-рука */
            outline: none !important; /* Убираем синюю обводку при клике */
        }
        /* ЭФФЕКТ ПРИ НАВЕДЕНИИ */
        .map-wrapper svg path:hover {
            fill: #4DA8C4 !important; /* Бирюзовый цвет при наведении */
            transform: translateY(-2px); /* Легкое всплытие */
            filter: drop-shadow(0 4px 6px rgba(77, 168, 196, 0.4)); /* Тень */
            z-index: 10; /* Чтобы активная область была выше соседних */
        }
        /* АКТИВНЫЙ РЕГИОН */
        .map-wrapper svg path.active-region {
            fill: #4DA8C4 !important;
            filter: drop-shadow(0 0 10px rgba(77, 168, 196, 0.6));
        }
        /* TOOLTIP */
        #tooltip {
            pointer-events: none;
            position: fixed;
            z-index: 100;
            background: #4DA8C4;
            color: white;
            padding: 8px 16px;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transform: translate(15px, 15px);
            display: none;
        }
      `}</style>

            {/* Tooltip Element */}
            <div
                id="tooltip"
                style={{
                    display: hoveredRegion ? 'block' : 'none',
                    left: tooltipPos.x,
                    top: tooltipPos.y
                }}
            >
                {hoveredRegion}
            </div>

            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 3000,
                    center: [67, 48]
                }}
                className="w-full h-full"
            >
                <ZoomableGroup center={[67, 48]} zoom={1} maxZoom={4} minZoom={0.8} disablePanning={false}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo: any) => {
                                const { name } = geo.properties;
                                const isSelected = selectedRegion === name;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        // Adding name attribute as requested by user logic mental model
                                        // @ts-ignore
                                        name={name}
                                        className={isSelected ? "active-region" : ""}
                                        onMouseEnter={() => {
                                            setHoveredRegion(name);
                                        }}
                                        onMouseMove={(e) => {
                                            setTooltipPos({ x: e.clientX, y: e.clientY });
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredRegion(null);
                                        }}
                                        onClick={() => {
                                            setSelectedRegion(name);
                                            console.log("Выбран регион: " + name);
                                            if (onRegionSelect) onRegionSelect(name);
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}
