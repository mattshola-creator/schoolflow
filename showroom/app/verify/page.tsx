"use client";

import { useState } from "react";

export default function VerificationPage() {
  const [width, setWidth] = useState(320);
  return (
    <main className="sf-responsive-review">
      <h1>Showroom responsive review</h1>
      <p>
        These controls set the viewport of the actual hosted showroom inside a
        same-origin browser frame. Fictional public content only; no application
        authentication is involved.
      </p>
      <div>
        {[320, 360, 768, 1440].map((value) => (
          <button
            type="button"
            key={value}
            aria-pressed={width === value}
            onClick={() => setWidth(value)}
          >
            {value}px
          </button>
        ))}
      </div>
      <p>
        Frame width: {width} CSS pixels. Scroll the frame to inspect the
        complete page.
      </p>
      <div className="sf-responsive-frame-tray">
        <iframe
          title={`Hosted showroom at ${width} CSS pixels`}
          src="/"
          style={{ width, height: 1000 }}
        />
      </div>
    </main>
  );
}
