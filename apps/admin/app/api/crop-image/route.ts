import sharp from "sharp";
import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

const BUCKET = "character-images";

export async function POST(req: Request) {
  const { imageUrl, characterId } = await req.json();

  if (!imageUrl || !characterId) {
    return NextResponse.json(
      { error: "imageUrl and characterId are required" },
      { status: 400 }
    );
  }

  // Download image
  let imageBuffer: Buffer;
  try {
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ImageCrop/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to download image: ${res.status}` },
        { status: 502 }
      );
    }

    imageBuffer = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to download image", details: String(err) },
      { status: 502 }
    );
  }

  // Center crop to 1:1 and resize to 512x512 WebP
  let croppedBuffer: Buffer;
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    if (!width || !height) {
      return NextResponse.json(
        { error: "Could not read image dimensions" },
        { status: 400 }
      );
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
    return NextResponse.json(
      { error: "Failed to process image", details: String(err) },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

    return NextResponse.json({ storedUrl: publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to upload image", details: String(err) },
      { status: 500 }
    );
  }
}
