
import Script from 'next/script';

export default function KazakhstanMap() {
    return (
        <div className="w-full h-full relative z-10">
            <div id="map" className="w-full h-auto min-h-[600px]"></div>
            <Script
                src="/map/mapdata.js"
                strategy="afterInteractive"
            />
            <Script
                src="/map/countrymap.js"
                strategy="afterInteractive"
            />
        </div>
    );
}
