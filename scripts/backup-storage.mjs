import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const backupRoot = process.env.SCHOOLFLOW_BACKUP_DIR ?? "./backups";

if (!url || !serviceRoleKey) {
  console.error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required and must not be logged.",
  );
  process.exit(2);
}

const timestamp = new Date().toISOString().replaceAll(/[-:.]/g, "");
const destination = join(backupRoot, timestamp, "storage");
const client = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const manifest = [];

async function listObjects(bucket, prefix = "") {
  const objects = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await client.storage.from(bucket).list(prefix, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });
    if (error) throw error;
    if (!data?.length) break;

    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id) objects.push(path);
      else objects.push(...(await listObjects(bucket, path)));
    }
    if (data.length < 100) break;
  }
  return objects;
}

const { data: buckets, error: bucketError } =
  await client.storage.listBuckets();
if (bucketError) throw bucketError;

for (const bucket of buckets ?? []) {
  for (const objectPath of await listObjects(bucket.id)) {
    const { data, error } = await client.storage
      .from(bucket.id)
      .download(objectPath);
    if (error) throw error;
    const bytes = Buffer.from(await data.arrayBuffer());
    const outputPath = join(destination, bucket.id, objectPath);
    await mkdir(dirname(outputPath), { recursive: true, mode: 0o700 });
    await writeFile(outputPath, bytes, { mode: 0o600 });
    manifest.push({
      bucket: bucket.id,
      path: objectPath,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
}

await mkdir(destination, { recursive: true, mode: 0o700 });
await writeFile(
  join(destination, "manifest.json"),
  `${JSON.stringify({ createdAt: new Date().toISOString(), objects: manifest }, null, 2)}\n`,
  { mode: 0o600 },
);

console.log(`Storage backup created at ${destination}`);
console.log(`Objects exported: ${manifest.length}`);
console.log(
  "Copy the timestamped parent directory to the approved encrypted off-site destination.",
);
