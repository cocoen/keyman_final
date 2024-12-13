import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { auth } from "@/app/lib/auth";

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function POST(req: Request) {
	const session = await auth();
	const userEmail = session?.user?.email;

	if (!userEmail) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

	const { userId, name, position, department, imageUrl, action } = await req.json();
	const key = `favorites:${userEmail}`;
	const timestampKey = `favorites:timestamp:${userEmail}`;
	const dataKey = `favorites:data:${userEmail}:${userId}`;

	if (action === "add") {
		// Check if user is already in favorites
		const exists = await redis.sismember(key, userId);
		if (exists) {
			return NextResponse.json({ error: "Already in favorites" }, { status: 400 });
		}

		await redis.sadd(key, userId);
		await redis.zadd(timestampKey, { score: Date.now(), member: userId });
		await redis.hset(dataKey, {
			name,
			position, 
			department,
			imageUrl
		});
	} else if (action === "remove") {
		await redis.srem(key, userId);
		await redis.zrem(timestampKey, userId);
		await redis.del(dataKey);
	}

	// Get updated favorites list sorted by timestamp
	const favorites = await redis.zrange(timestampKey, 0, -1, { rev: true });
	
	return NextResponse.json({ success: true, favorites });
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const userId = url.searchParams.get("userId");

	const session = await auth();
	const userEmail = session?.user?.email;

	if (!userEmail) return NextResponse.json({ favorites: [] });

	const timestampKey = `favorites:timestamp:${userEmail}`;
	
	if (userId) {
		const key = `favorites:${userEmail}`;
		const isFavorited = await redis.sismember(key, userId);
		return NextResponse.json({ isFavorited });
	}

	// Get all favorites sorted by timestamp
	const favorites = await redis.zrange(timestampKey, 0, -1, { rev: true });
	const favoritesData = await Promise.all(
		favorites.map(async (userId) => {
			const dataKey = `favorites:data:${userEmail}:${userId}`;
			const data = await redis.hgetall(dataKey);
			return { userId, ...data };
		})
	);
	return NextResponse.json({ favorites: favoritesData });
}
