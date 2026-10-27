import { NextResponse } from "next/server";

const ALLOWED_HOSTS = ["drive.google.com", "drive.usercontent.google.com", "googleusercontent.com", "unsplash.com", "pexels.com", "pixabay.com", "wikimedia.org", "flickr.com", "staticflickr.com"];
const MAX_BYTES = 12 * 1024 * 1024;

function isAllowedHost(hostname) {
  const host = hostname.toLowerCase();
  return ALLOWED_HOSTS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

function driveUrls(input) {
  try {
    const url = new URL(input);
    if (!/(^|\.)drive\.google\.com$/i.test(url.hostname)) return [input];
    const id = url.searchParams.get("id") || url.pathname.match(/\/d\/([^/]+)/)?.[1];
    if (!id) return [input];
    const resource = url.searchParams.get("resourcekey");
    const extra = resource ? `&resourcekey=${encodeURIComponent(resource)}` : "";
    return [
      `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600${extra}`,
      `https://drive.google.com/uc?export=view&id=${encodeURIComponent(id)}${extra}`,
      input,
    ];
  } catch {
    return [input];
  }
}

function imageFromPage(html) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]]));
    if (["og:image", "twitter:image", "twitter:image:src"].includes((attrs.property || attrs.name || "").toLowerCase()) && attrs.content) {
      return attrs.content.replaceAll("&amp;", "&").replaceAll("&#x3D;", "=");
    }
  }
  return null;
}

async function fetchPublicImage(input, depth = 0) {
  if (depth > 1) throw new Error("Could not resolve the image URL.");
  const url = new URL(input);
  if (url.protocol !== "https:" || !isAllowedHost(url.hostname)) throw new Error("Use an HTTPS image link from Google Drive, Unsplash, Pexels, Pixabay, Flickr, or Wikimedia.");

  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(10000),
    headers: { Accept: "image/avif,image/webp,image/apng,image/*,text/html;q=0.8,*/*;q=0.5", "User-Agent": "Mozilla/5.0 EduNote/1.0" },
    cache: "force-cache",
  });
  const finalUrl = new URL(response.url);
  if (!isAllowedHost(finalUrl.hostname)) throw new Error("The image link redirected to an unsupported host.");
  if (!response.ok) throw new Error(`The image host returned ${response.status}.`);

  const type = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (type?.startsWith("image/")) {
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) throw new Error("Image is larger than 12 MB.");
    return { bytes, type };
  }
  if (!type?.includes("html")) throw new Error("The link did not return an image.");
  const html = await response.text();
  if (html.length > MAX_BYTES) throw new Error("The image page is too large to preview.");
  const imageUrl = imageFromPage(html);
  if (!imageUrl) throw new Error("No preview image was found on that page. Paste a direct image URL instead.");
  return fetchPublicImage(new URL(imageUrl, finalUrl).toString(), depth + 1);
}

export async function GET(request) {
  const input = new URL(request.url).searchParams.get("url");
  if (!input) return NextResponse.json({ error: "Missing image URL." }, { status: 400 });
  try {
    let lastError;
    for (const candidate of driveUrls(input)) {
      try {
        const image = await fetchPublicImage(candidate);
        return new Response(image.bytes, {
          headers: { "Content-Type": image.type, "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400", "X-Content-Type-Options": "nosniff" },
        });
      } catch (error) { lastError = error; }
    }
    throw lastError || new Error("Could not load the image.");
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load the image." }, { status: 422 });
  }
}
