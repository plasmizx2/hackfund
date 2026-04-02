"use client";

import { useCallback, useEffect, useId, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

type LocationPickerProps = {
  /** When set with onLatLngChange, lat/lng are controlled by the parent (e.g. hackathon form). */
  controlledLat?: string;
  controlledLng?: string;
  onLatLngChange?: (lat: string, lng: string) => void;
};

export function LocationPicker({
  controlledLat,
  controlledLng,
  onLatLngChange,
}: LocationPickerProps) {
  const id = useId();
  const controlled = onLatLngChange !== undefined;

  const [internalLat, setInternalLat] = useState("");
  const [internalLng, setInternalLng] = useState("");
  const lat = controlled ? (controlledLat ?? "") : internalLat;
  const lng = controlled ? (controlledLng ?? "") : internalLng;

  const setPair = useCallback(
    (la: string, lo: string) => {
      if (controlled) {
        onLatLngChange!(la, lo);
      } else {
        setInternalLat(la);
        setInternalLng(lo);
      }
    },
    [controlled, onLatLngChange],
  );

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (lat && lng) setStatus("success");
  }, [lat, lng]);

  const useMyLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setMessage("Location isn’t available in this browser.");
      return;
    }
    setStatus("loading");
    setMessage(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude.toFixed(6);
        const lo = pos.coords.longitude.toFixed(6);
        setPair(la, lo);
        setStatus("success");
        setMessage("We’ll use this for “near me” and maps later.");
      },
      (err) => {
        setStatus("error");
        if (err.code === err.PERMISSION_DENIED) {
          setMessage("Location access was blocked. Allow location for this site, or enter coordinates below.");
        } else {
          setMessage("Couldn’t read your location. Try again or enter coordinates below.");
        }
        setShowManual(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }, [setPair]);

  const clearLocation = useCallback(() => {
    setPair("", "");
    setStatus("idle");
    setMessage(null);
  }, [setPair]);

  return (
    <div className="space-y-3">
      <div>
        <span className="block text-sm font-medium text-foreground">Event location pin</span>
        <p className="mt-1 text-xs text-muted-foreground">
          We use this so people can find hackathons near them later — same idea as “check in” or
          maps using your location, not typing numbers.
        </p>
      </div>

      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/40 bg-accent-muted px-4 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/20 disabled:opacity-60"
        >
          {status === "loading" ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              Getting location…
            </>
          ) : (
            <>
              <LocationIcon className="h-4 w-4" />
              Use my current location
            </>
          )}
        </button>
        {status === "success" && lat && lng ? (
          <button
            type="button"
            onClick={clearLocation}
            className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      {status === "success" && lat && lng ? (
        <p className="rounded-xl border border-accent/25 bg-accent-muted px-3 py-2 text-sm text-foreground/90">
          <span className="font-medium text-accent">Saved.</span>{" "}
          <span className="font-mono text-xs text-muted-foreground">
            {lat}, {lng}
          </span>
          {message ? <span className="ml-2 text-muted-foreground">{message}</span> : null}
        </p>
      ) : null}

      {status === "error" && message ? (
        <p className="text-sm text-amber-200/90">{message}</p>
      ) : null}

      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowManual((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground"
          aria-expanded={showManual}
          aria-controls={`${id}-manual`}
        >
          {showManual ? "Hide" : "Enter coordinates manually"} (optional)
        </button>
        {showManual ? (
          <div id={`${id}-manual`} className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${id}-lat`} className="block text-xs text-muted-foreground">
                Latitude
              </label>
              <input
                id={`${id}-lat`}
                type="number"
                step="any"
                value={lat}
                onChange={(e) => {
                  const v = e.target.value;
                  setPair(v, lng);
                  setStatus(v ? "success" : "idle");
                }}
                className="hf-input mt-1 font-mono text-sm"
                placeholder="37.7749"
              />
            </div>
            <div>
              <label htmlFor={`${id}-lng`} className="block text-xs text-muted-foreground">
                Longitude
              </label>
              <input
                id={`${id}-lng`}
                type="number"
                step="any"
                value={lng}
                onChange={(e) => {
                  const v = e.target.value;
                  setPair(lat, v);
                  setStatus(v ? "success" : "idle");
                }}
                className="hf-input mt-1 font-mono text-sm"
                placeholder="-122.4194"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  );
}
