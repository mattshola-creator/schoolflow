"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { BrandingSnapshot } from "./persistence";
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
  initialSnapshot,
}: {
  schoolName: string;
  plan: ShowroomPlan;
  initialSnapshot: BrandingSnapshot;
}) {
  const router = useRouter();
  const [appearance, setAppearance] = useState<BrandingAppearance>(
      initialSnapshot.effective,
    ),
    [width, setWidth] = useState(1440),
    [notice, setNotice] = useState(""),
    [image, setImage] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [sourceFile, setSourceFile] = useState<File | null>(null);
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [previewVersion, setPreviewVersion] = useState(
    initialSnapshot.published_version_id,
  );
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [assetUnavailable, setAssetUnavailable] = useState(false);
  const [assetLoading, setAssetLoading] = useState(
    Boolean(
      initialSnapshot.published_version_id && customBackgroundPermitted(plan),
    ),
  );
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
  async function persist(
    operation: "save" | "publish" | "restore",
    versionId?: string,
  ) {
    setBusy(true);
    setNotice("Applying authorized school appearance…");
    try {
      let assetId: string | null = selectedAsset;
      if (operation === "save" && sourceFile) {
        const form = new FormData();
        form.set("image", sourceFile);
        form.set("schoolId", snapshot.schoolId);
        if (appearance.crop) form.set("crop", JSON.stringify(appearance.crop));
        const uploaded = await fetch("/api/branding/assets", {
          method: "POST",
          body: form,
        });
        const result = await uploaded.json();
        if (!uploaded.ok) throw new Error(result.error ?? "Upload unavailable");
        assetId = result.assetId;
      }
      const { crop: _crop, ...config } = appearance;
      void _crop;
      const body =
        operation === "save"
          ? {
              operation,
              schoolId: snapshot.schoolId,
              revision: snapshot.revision,
              requestId: crypto.randomUUID(),
              config,
              assetId,
            }
          : {
              operation,
              schoolId: snapshot.schoolId,
              revision: snapshot.revision,
              versionId,
              ...(operation === "restore"
                ? { requestId: crypto.randomUUID() }
                : {}),
            };
      const response = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Appearance operation failed");
      setSnapshot(result);
      if (operation === "publish") router.refresh();
      const nextVersion =
        operation === "publish"
          ? result.published_version_id
          : result.draft_version_id;
      if (
        (operation === "restore" || !sourceFile) &&
        customBackgroundPermitted(plan) &&
        nextVersion !== previewVersion
      )
        setAssetLoading(true);
      setPreviewVersion(
        operation === "publish"
          ? result.published_version_id
          : result.draft_version_id,
      );
      if (operation === "restore") {
        const restored = result.history.find(
          (v: { id: string }) => v.id === result.draft_version_id,
        );
        if (restored) setAppearance(restored.config);
        setSourceFile(null);
        setImage(null);
      }
      setNotice(
        operation === "publish"
          ? "School appearance published. Refresh restores the published selection."
          : operation === "restore"
            ? "A new draft version was created from history. Publish it when ready."
            : "School draft saved. Publishing remains a separate action.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Appearance unavailable",
      );
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!previewVersion || !customBackgroundPermitted(plan) || sourceFile)
      return;
    const controller = new AbortController();
    void fetch(
      `/api/branding/assets?schoolId=${encodeURIComponent(snapshot.schoolId)}&versionId=${encodeURIComponent(previewVersion)}`,
      { signal: controller.signal, cache: "no-store" },
    )
      .then(async (response) => {
        if (!response.ok) {
          setAssetUnavailable(true);
          setNotice(
            "Private background unavailable. Restore server access or explicitly remove the background before saving.",
          );
          return;
        }
        setAssetUnavailable(false);
        if (response.ok) {
          const result = await response.json();
          setImage(result.url);
          setSelectedAsset(result.assetId);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setAssetUnavailable(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setAssetLoading(false);
      });
    return () => controller.abort();
  }, [previewVersion, snapshot.schoolId, plan, sourceFile]);
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
        QA-only school appearance. Drafts and publication are server-authorized.
        Charts remain fictional. Publishing here does not deploy production.{" "}
        {snapshot.premiumFallback
          ? "Your current plan uses an accessible core fallback; prior versions remain in history."
          : ""}
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
              "Preview selection validated against your effective theme access. Saving and publishing recheck current server permissions.",
            );
          }}
        >
          Validate preview selection
        </button>
        <button
          className={styles.tile}
          disabled={busy || !permitted || assetUnavailable || assetLoading}
          onClick={() => void persist("save")}
        >
          Save shared draft
        </button>
        <button
          className={styles.tile}
          disabled={busy || !snapshot.draft_version_id}
          onClick={() =>
            void persist("publish", snapshot.draft_version_id ?? undefined)
          }
        >
          Publish saved draft
        </button>
        <button
          className={styles.tile}
          onClick={() => {
            setAppearance(initial);
            setImage(null);
            setSourceFile(null);
            setSelectedAsset(null);
            setPreviewVersion(null);
            setAssetUnavailable(false);
            setAssetLoading(false);
            setNotice(
              "Local preview reset. Shared school appearance is unchanged.",
            );
          }}
        >
          Reset preview
        </button>
      </div>
      <section aria-label="Appearance version history">
        <h2 className="text-xl font-semibold">Version history</h2>
        <p>Restoring creates a new draft. Published history is retained.</p>
        {snapshot.history.length === 0 ? (
          <p>No saved versions yet.</p>
        ) : (
          <ul>
            {snapshot.history.map((v) => (
              <li key={v.id}>
                Version {v.version} ·{" "}
                {resolveShowroomTheme(v.config.themeId).name}{" "}
                {v.id === snapshot.published_version_id ? "· Published" : ""}{" "}
                <button
                  className={styles.tile}
                  disabled={busy || !themePermitted(v.config.themeId, plan)}
                  onClick={() => void persist("restore", v.id)}
                >
                  Restore as new draft
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p role="status" aria-live="polite">
        {notice}
      </p>
      <a className="underline" href="/administration">
        Back to Administration
      </a>
    </main>
  );
}
