import { NextResponse } from "next/server";

const CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  if (!CSE_API_KEY || !CSE_ID) {
    return NextResponse.json(
      { error: "Google Custom Search not configured. Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID." },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", CSE_API_KEY);
    url.searchParams.set("cx", CSE_ID);
    url.searchParams.set("q", query);
    url.searchParams.set("searchType", "image");
    url.searchParams.set("num", "8");
    url.searchParams.set("safe", "active");

    const res = await fetch(url.toString());

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Google API error: ${res.status}`, details: text },
        { status: res.status }
      );
    }

    const data = await res.json();

    const images = (data.items ?? []).map(
      (item: { link: string; image?: { thumbnailLink?: string; width?: number; height?: number } }) => ({
        url: item.link,
        thumbnail: item.image?.thumbnailLink ?? item.link,
        width: item.image?.width,
        height: item.image?.height,
      })
    );

    return NextResponse.json({ images });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to search images", details: String(err) },
      { status: 500 }
    );
  }
}
