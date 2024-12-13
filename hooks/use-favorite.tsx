"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoriteUser {
	userId: string;
	name: string;
	position: string;
	department: string;
	imageUrl: string;
}

interface FavoriteStore {
	favorites: FavoriteUser[];
	addFavorite: (user: FavoriteUser) => Promise<void>;
	removeFavorite: (userId: string) => Promise<void>;
	setFavorites: (users: FavoriteUser[]) => void;
	fetchFavorites: () => Promise<void>;
	checkIsFavorited: (userId: string) => Promise<boolean>;
}

export const useFavoriteStore = create<FavoriteStore>()(
	persist(
		(set, get) => ({
			favorites: [],

			// 즐겨찾기 전체 목록을 백엔드로부터 가져와서 상태에 반영
			fetchFavorites: async () => {
				try {
					const res = await fetch("/api/favorites", {
						method: "GET",
					});
					const data = await res.json();
					// 백엔드에서는 { favorites: FavoriteUser[] } 형태로 반환한다고 가정
					// (백엔드 코드 참고: { favorites: favoritesData })
					set({ favorites: data.favorites });
				} catch (error) {
					console.error("Failed to fetch favorites:", error);
				}
			},

			// 로컬 상태 수정 + 백엔드에 추가 요청
			addFavorite: async (user: FavoriteUser) => {
				try {
					const res = await fetch("/api/favorites", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							userId: user.userId,
							name: user.name,
							position: user.position,
							department: user.department,
							imageUrl: user.imageUrl,
							action: "add",
						}),
					});

					const data = await res.json();
					if (res.ok) {
						// 백엔드 응답에 favorites 배열이 담겨 있다면 해당 데이터를 Zustand에 반영
						// 단, 여기서는 백엔드에서 favorites의 userId만 반환하고 있으며,
						// 실제 full data를 갖기 위해서는 fetchFavorites를 다시 호출하거나,
						// 백엔드에 full data를 요청할 수도 있음.
						// 여기서는 단순히 현재 상태에도 추가하는 로직을 사용.
						set((state) => ({
							favorites: [...state.favorites, user],
						}));
					} else {
						console.error("Failed to add favorite:", data.error);
					}
				} catch (error) {
					console.error("Error adding favorite:", error);
				}
			},

			// 로컬 상태 수정 + 백엔드에 제거 요청
			removeFavorite: async (userId: string) => {
				try {
					const res = await fetch("/api/favorites", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							userId,
							action: "remove",
						}),
					});

					const data = await res.json();
					if (res.ok) {
						set((state) => ({
							favorites: state.favorites.filter((fav) => fav.userId !== userId),
						}));
					} else {
						console.error("Failed to remove favorite:", data.error);
					}
				} catch (error) {
					console.error("Error removing favorite:", error);
				}
			},

			setFavorites: (users) => {
				set({ favorites: users });
			},

			// 특정 userId가 즐겨찾기인지 백엔드로 조회
			checkIsFavorited: async (userId: string) => {
				try {
					const url = `/api/favorites?userId=${userId}`;
					const res = await fetch(url, { method: "GET" });
					const data = await res.json();
					return data.isFavorited || false;
				} catch (error) {
					console.error("Error checking favorite status:", error);
					return false;
				}
			},
		}),
		{
			name: "favorites-storage",
		}
	)
);
