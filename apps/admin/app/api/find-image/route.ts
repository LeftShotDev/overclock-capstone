import { NextResponse } from "next/server";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

interface SerperImage {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  imageWidth: number;
  imageHeight: number;
  link: string;
}

export async function POST(req: Request) {
  const { name, work } = await req.json();

  if (!name || !work) {
    return NextResponse.json(
      { error: "name and work are required" },
      { status: 400 }
    );
  }

  if (!SERPER_API_KEY) {
    return NextResponse.json(
      { error: "Image search not configured. Set SERPER_API_KEY." },
      { status: 500 }
    );
  }

  const query = `${name} ${work} character`;

  try {
    const res = await fetch("https://google.serper.dev/images", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, num: 8 }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Serper API error: ${res.status}`, details: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    const images = (data.images ?? []).map((img: SerperImage) => ({
      url: img.imageUrl,
      thumbnail: img.thumbnailUrl,
      width: img.imageWidth,
      height: img.imageHeight,
    }));

    return NextResponse.json({ query, images });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search images", details: String(err) },
      { status: 500 }
    );
  }
}
