import { tool } from "@langchain/core/tools";
import { z } from "zod";
import sharp from "sharp";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const BUCKET = "Characters";

interface SerperImage {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageWidth: number;
  imageHeight: number;
  link: string;
}

/**
 * Searches Serper.dev (Google Images) for character images.
 * Returns top 6 results with direct URLs and thumbnails.
 */
export const findCharacterImage = tool(
  async ({ name, work }: { name: string; work: string }) => {
    if (!SERPER_API_KEY) {
      return JSON.stringify({
        error: "Image search not configured. SERPER_API_KEY not set.",
        images: [],
      });
    }

    const query = `${name} ${work} character`;

    try {
      const res = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query, num: 6 }),
      });

      if (!res.ok) {
        return JSON.stringify({
          error: `Serper API error: ${res.status}`,
          images: [],
        });
      }

      const data = await res.json();
      const images = (data.images ?? []).map((img: SerperImage) => ({
        url: img.imageUrl,
        thumbnail: img.thumbnailUrl,
        width: img.imageWidth,
        height: img.imageHeight,
      }));

      return JSON.stringify({ query, images });
    } catch (err) {
      return JSON.stringify({
        error: `Failed to search images: ${String(err)}`,
        images: [],
      });
    }
  },
  {
    name: "find_character_image",
    description:
      "Search for character images using the character's name and source work. Returns up to 6 image results with direct URLs and thumbnails. Use this after generating a character profile to find a representative image.",
    schema: z.object({
      name: z.string().describe("The character's name (e.g. 'Ms. Frizzle')"),
      work: z
        .string()
        .describe(
          "The franchise/work the character is from (e.g. 'The Magic School Bus')"
        ),
    }),
  }
);

/**
 * Downloads an image, center-crops to 512×512 WebP, and uploads to Supabase Storage.
 * Returns the public URL of the stored image.
 */
export const saveCharacterImage = tool(
  async ({
    imageUrl,
    characterId,
  }: {
    imageUrl: string;
    characterId: string;
  }) => {
    // Download image
    let imageBuffer: Buffer;
    try {
      const res = await fetch(imageUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ImageCrop/1.0)" },
        signal: AbortSignal.timeout(10_000),
      });

      if (!res.ok) {
        return JSON.stringify({
          error: `Failed to download image: ${res.status}`,
        });
      }

      imageBuffer = Buffer.from(await res.arrayBuffer());
    } catch (err) {
      return JSON.stringify({
        error: `Failed to download image: ${String(err)}`,
      });
    }

    // Center crop to 1:1 and resize to 512×512 WebP
    let croppedBuffer: Buffer;
    try {
      const metadata = await sharp(imageBuffer).metadata();
      const { width, height } = metadata;

      if (!width || !height) {
        return JSON.stringify({ error: "Could not read image dimensions" });
      }

      const size = Math.min(width, height);
      const left = Math.floor((width - size) / 2);
      const top = Math.floor((height - size) / 2);

      croppedBuffer = await sharp(imageBuffer)
        .extract({ left, top, width: size, height: size })
        .resize(512, 512)
        .webp({ quality: 85 })
        .toBuffer();
    } catch (err) {
      return JSON.stringify({
        error: `Failed to process image: ${String(err)}`,
      });
    }

    // Upload to Supabase Storage
    try {
      const supabase = createSupabaseServiceClient();
      const fileName = `${characterId}.webp`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, croppedBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) {
        return JSON.stringify({
          error: `Upload failed: ${uploadError.message}`,
        });
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

      return JSON.stringify({ storedUrl: publicUrl });
    } catch (err) {
      return JSON.stringify({
        error: `Failed to upload image: ${String(err)}`,
      });
    }
  },
  {
    name: "save_character_image",
    description:
      "Download an image from a URL, center-crop it to a 512×512 square WebP, and upload it to Supabase Storage. Returns the public URL of the stored image. Use this when the user has selected an image from the search results.",
    schema: z.object({
      imageUrl: z
        .string()
        .describe("The direct URL of the image to download and crop"),
      characterId: z
        .string()
        .describe(
          "The character ID used for naming the stored file (e.g. 'ms-frizzle')"
        ),
    }),
  }
);
