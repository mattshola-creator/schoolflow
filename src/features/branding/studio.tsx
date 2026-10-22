"use client";
import { useEffect, useState } from "react";
import {
  showroomThemes,
  resolveShowroomTheme,
  type ShowroomPlan,
} from "@/features/showroom/catalog";
import { themeStyle } from "@/features/showroom/dashboard";
import { ProgressCard, TrendChart } from "@/features/showroom/charts";
import {
  customBackgroundPermitted,
  themePermitted,
  validatedAppearance,
  type BrandingAppearance,
} from "./model";
import styles from "./studio.module.css";
const initial: BrandingAppearance = {
  themeId: "emerald",
  preset: "executive",
  focalX: 50,
  focalY: 50,
  overlay: 0.65,
};
export function BrandingStudio({
  schoolName,
  plan,
}: {
  schoolName: string;
  plan: ShowroomPlan;
}) {
  const [appearance, setAppearance] = useState(initial),
    [width, setWidth] = useState(1440),
    [notice, setNotice] = useState(""),
    [image, setImage] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [sourceFile, setSourceFile] = useState<File | null>(null);
  const theme = resolveShowroomTheme(appearance.themeId);
  const permitted = themePermitted(theme.id, plan);
  useEffect(
    () => () => {
      if (image) URL.revokeObjectURL(image);
    },
    [image],
  );
  async function previewImage(file: File | undefined) {
    if (!file) return;
    setSourceFile(file);
    setBusy(true);
    setNotice("Processing image securely…");
    try {
      const form = new FormData();
      form.set("image", file);
      if (appearance.crop) form.set("crop", JSON.stringify(appearance.crop));
      const response = await fetch("/api/branding/image-preview", {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error ?? "Image preview unavailable");
      }
      setImage(URL.createObjectURL(await response.blob()));
      setNotice(
        "Optimized image preview ready. It has not been uploaded to shared Storage or published.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Image preview failed",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      className={`${styles.studio} sf-visualization-stage`}
      style={themeStyle(theme)}
    >
      <p>Branding & Experience Studio · authorized school context</p>
      <h1 className="text-3xl font-bold">
        Make {schoolName} feel unmistakably yours.
      </h1>
      <p>
        Effective theme access: {plan}. Every premium design remains available
        to preview.
      </p>
      <div className={styles.notice}>
        QA integration: shared drafts, publishing, history and
        personal-preference persistence are awaiting the separate migration
        security gate. Current controls change this preview only.
      </div>
      <div className={styles.gallery} aria-label="Twelve curated themes">
        {showroomThemes.map((item) => (
          <button
            key={item.id}
            className={styles.tile}
            aria-pressed={theme.id === item.id}
            onClick={() => setAppearance({ ...appearance, themeId: item.id })}
          >
            <strong>{item.name}</strong>
            <span className={styles.swatches} aria-hidden="true">
              {[item.nav, item.primary, item.accent, item.canvas].map(
                (color, i) => (
                  <i key={i} style={{ background: color }} />
                ),
              )}
            </span>
            <span>{item.description}</span>
            <small className="mt-2 block">
              {themePermitted(item.id, plan)
                ? "Included in your access"
                : "Premium preview · subscription required to publish"}
            </small>
          </button>
        ))}
      </div>
      <div className={styles.controls} aria-label="Preview viewport">
        {[320, 360, 768, 1440].map((size) => (
          <button
            key={size}
            className={styles.tile}
            aria-pressed={width === size}
            onClick={() => setWidth(size)}
          >
            {size}px
          </button>
        ))}
      </div>
      <div className={styles.fields}>
        <label>
          Presentation preset
          <select
            value={appearance.preset}
            onChange={(e) =>
              setAppearance({
                ...appearance,
                preset: e.target.value as BrandingAppearance["preset"],
              })
            }
          >
            <option value="executive">Executive overview</option>
            <option value="analytics">Analytics first</option>
            <option value="action-first">Action first</option>
          </select>
        </label>
        <label>
          Background image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={!customBackgroundPermitted(plan) || busy}
            onChange={(e) => void previewImage(e.target.files?.[0])}
          />
          <small>
            JPG, PNG, WebP · 5 MB maximum · 1280×720 to 4096×4096.
            Professional/Enterprise.
          </small>
        </label>
        <label>
          Horizontal position
          <input
            type="range"
            min="0"
            max="100"
            value={appearance.focalX}
            onChange={(e) =>
              setAppearance({ ...appearance, focalX: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Vertical position
          <input
            type="range"
            min="0"
            max="100"
            value={appearance.focalY}
            onChange={(e) =>
              setAppearance({ ...appearance, focalY: Number(e.target.value) })
            }
          />
        </label>
        <label>
          Readability overlay
          <input
            type="range"
            min="0.65"
            max="0.85"
            step="0.05"
            value={appearance.overlay}
            onChange={(e) =>
              setAppearance({ ...appearance, overlay: Number(e.target.value) })
            }
          />
        </label>
      </div>
      <fieldset
        className={`${styles.fields} mt-4`}
        disabled={!customBackgroundPermitted(plan) || busy}
      >
        <legend className="font-semibold">Crop before optimization</legend>
        <label>
          Enable crop
          <input
            type="checkbox"
            checked={Boolean(appearance.crop)}
            onChange={(e) =>
              setAppearance({
                ...appearance,
                crop: e.target.checked
                  ? { x: 0, y: 0, width: 1, height: 1 }
                  : undefined,
              })
            }
          />
        </label>
        {appearance.crop &&
          (["x", "y", "width", "height"] as const).map((key) => (
            <label key={key}>
              Crop {key}
              <input
                type="number"
                min={key === "width" || key === "height" ? 0.01 : 0}
                max="1"
                step="0.01"
                value={appearance.crop![key]}
                onChange={(e) =>
                  setAppearance({
                    ...appearance,
                    crop: {
                      ...appearance.crop!,
                      [key]: Number(e.target.value),
                    },
                  })
                }
              />
            </label>
          ))}
        <p>
          Normalized crop bounds must stay within the image and retain at least
          1280×720 pixels.
        </p>
        <button
          type="button"
          className={styles.tile}
          disabled={!sourceFile || busy}
          onClick={() => void previewImage(sourceFile ?? undefined)}
        >
          Reprocess selected image
        </button>
      </fieldset>
      <div
        className={styles.preview}
        data-layout={
          appearance.preset === "analytics"
            ? "analytic"
            : appearance.preset === "action-first"
              ? "command"
              : theme.layout
        }
        data-texture={theme.texture}
        style={{ width }}
        aria-label={`${width}px ${theme.name} presentation preview`}
      >
        <header
          className={styles.hero}
          style={
            image
              ? {
                  backgroundImage: `linear-gradient(rgb(0 0 0 / ${appearance.overlay}),rgb(0 0 0 / ${appearance.overlay})), url("${image}")`,
                  backgroundPosition: `${appearance.focalX}% ${appearance.focalY}%`,
                  color: "#fff",
                }
              : undefined
          }
        >
          <p>Fictional dashboard data · visual preview only</p>
          <h2>{schoolName}</h2>
          <p>Clear priorities. Confident school operations.</p>
        </header>
        <div className={styles.boards}>
          <TrendChart
            title="Attendance presentation"
            description="Fictional recorded-mark percentages; not school records."
            period="Synthetic week · 5 days"
            points={[
              { label: "Mon", value: 88 },
              { label: "Tue", value: 92 },
              { label: "Wed", value: 91 },
              { label: "Thu", value: 95 },
              { label: "Fri", value: 94 },
            ]}
          />
          <ProgressCard
            title="Recorded attendance"
            description="Synthetic present-or-late marks divided by recorded marks."
            period="Fictional day"
            numerator={94}
            denominator={100}
          />
        </div>
      </div>
      <div className={styles.controls}>
        <button
          className={styles.tile}
          disabled={!permitted}
          onClick={() => {
            validatedAppearance(appearance, plan);
            setNotice(
              "Preview selection validated against your effective theme access. Shared saving remains gated.",
            );
          }}
        >
          Validate preview selection
        </button>
        <button className={styles.tile} disabled>
          Save shared draft — migration pending
        </button>
        <button className={styles.tile} disabled>
          Publish — migration pending
        </button>
        <button
          className={styles.tile}
          onClick={() => {
            setAppearance(initial);
            setImage(null);
            setSourceFile(null);
            setNotice(
              "Local preview reset. Shared school appearance is unchanged.",
            );
          }}
        >
          Reset preview
        </button>
      </div>
      <p role="status" aria-live="polite">
        {notice}
      </p>
      <a className="underline" href="/administration">
        Back to Administration
      </a>
    </main>
  );
}
