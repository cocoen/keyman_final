"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavoriteStore } from "@/hooks/use-favorite";

interface FavoriteButtonProps {
	userId: string;
	name: string;
	position: string;
	department: string;
	imageUrl: string;
	url: "search" | "profile";
}

export function FavoriteButton({
	userId,
	name,
	position,
	department,
	imageUrl,
	url = "search",
}: FavoriteButtonProps) {
	const [loading, setLoading] = useState(false);
	const { favorites, addFavorite, removeFavorite, checkIsFavorited } = useFavoriteStore();

	// 즐겨찾기 상태를 Zustand store에서 직접 계산
	const isFavorited = favorites.some((fav) => fav.userId === userId);

	useEffect(() => {
		// 초기 즐겨찾기 상태 확인
		const initFavoriteStatus = async () => {
			const status = await checkIsFavorited(userId);
			if (status && !isFavorited) {
				// 백엔드에는 있지만 로컬에 없는 경우 추가
				await addFavorite({ userId, name, position, department, imageUrl });
			}
		};
		initFavoriteStatus();
	}, [userId, name, position, department, imageUrl, checkIsFavorited, addFavorite, isFavorited]);

	const handleFavoriteClick = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (isFavorited) {
				await removeFavorite(userId);
			} else {
				await addFavorite({ userId, name, position, department, imageUrl });
			}
		} catch (error) {
			console.error("Error updating favorite:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleFavoriteClick}>
			<button
				type="submit"
				className={cn(
					"flex items-center gap-1.5 px-2 py-1 bg-neutral-50 text-gray-900 rounded-md transition-colors font-semibold hover:bg-neutral-300 text-xs",
					loading && "opacity-50 pointer-events-none",
					url === "search" && "absolute bottom-3 right-3"
				)}
				aria-label={isFavorited ? "키맨 해제" : "키맨 등록"}
				disabled={loading}
			>
				<Star className={cn("w-3 h-5", isFavorited ? "fill-black text-black" : "text-gray-500")} />
			</button>
		</form>
	);
}
