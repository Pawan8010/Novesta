import { useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin } from 'lucide-react';
import { siteConfig } from '../config/site';

interface GoogleMapEmbedProps {
  quotaExceeded: boolean;
}

function useTokenColors() {
  const [colors, setColors] = useState({
    ink: 'var(--color-ink)',
    inverseInk: 'var(--color-inverse-ink)',
  });

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue('--color-ink').trim();
    const inverseInk = styles.getPropertyValue('--color-inverse-ink').trim();
    if (ink && inverseInk) {
      setColors({ ink, inverseInk });
    }
  }, []);

  return colors;
}

function OfficeMarkerWithInfoWindow() {
  const [infoOpen, setInfoOpen] = useState(true);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const { brand } = siteConfig;
  const { address } = siteConfig.contact;
  const tokenColors = useTokenColors();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={address.coordinates}
        title={`${brand.name} — ${address.city}, ${address.state}`}
        onClick={() => setInfoOpen((prev) => !prev)}
      >
        <Pin
          background={tokenColors.ink}
          borderColor={tokenColors.inverseInk}
          glyphColor={tokenColors.inverseInk}
          scale={1.15}
        />
      </AdvancedMarker>

      {infoOpen && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => setInfoOpen(false)}
        >
          <div className="p-1 text-[var(--color-ink)]">
            <p className="text-[14px] font-medium">{brand.name}</p>
            <p className="mt-1 text-[13px] leading-5 text-[var(--color-ink-secondary)]">
              {address.line1}, {address.city}, {address.state} {address.postalCode}
            </p>
            <a
              href={address.googleMapsDirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--color-ink)] underline"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

export function GoogleMapEmbed({ quotaExceeded }: GoogleMapEmbedProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { address } = siteConfig.contact;

  if (!apiKey || quotaExceeded) {
    return (
      <div className="flex h-[280px] flex-col justify-between rounded-[var(--radius-2xl)] border border-[var(--color-inverse-border)] bg-[var(--color-inverse-bg)] p-6 text-[var(--color-inverse-ink)]">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-inverse-ink)]">
            <MapPin className="h-5 w-5 text-[var(--color-inverse-ink)]" aria-hidden="true" />
            <span className="text-[14px] font-medium">
              {address.city}, {address.state}, {address.country}
            </span>
          </div>
          <p className="mt-3 text-[15px] leading-6 text-[var(--color-inverse-muted)]">
            {address.line1}, {address.city}, {address.state} {address.postalCode}
          </p>
          <p className="mt-2 text-[13px] text-[var(--color-inverse-muted)]">
            {quotaExceeded
              ? 'Interactive map preview reached its daily demo quota. Open Google Maps directly below.'
              : 'Add VITE_GOOGLE_MAPS_API_KEY to render the interactive map canvas, or open directions directly.'}
          </p>
        </div>

        <a
          href={address.googleMapsDirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] w-fit items-center gap-2 rounded-[var(--radius-step8)] border border-[var(--color-inverse-border)] bg-transparent px-4 py-2.5 text-[14px] font-medium text-[var(--color-inverse-ink)] transition-colors hover:border-[var(--color-inverse-ink)]"
        >
          <span>View {address.city} location on Google Maps</span>
          <ExternalLink className="h-4 w-4 text-[var(--color-inverse-ink)]" aria-hidden="true" />
        </a>
      </div>
    );
  }

  return (
    <div
      className="h-[280px] w-full overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-inverse-border)]"
      aria-label={`Google Map showing ${siteConfig.brand.name} location in ${address.city}, ${address.state}`}
    >
      <APIProvider apiKey={apiKey} libraries={['marker']} language="en" region="IN">
        <GoogleMap
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          defaultCenter={address.coordinates}
          defaultZoom={13}
          gestureHandling="cooperative"
          style={{ width: '100%', height: '100%' }}
        >
          <OfficeMarkerWithInfoWindow />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
