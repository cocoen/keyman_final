"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, User, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import LoginButton from "./auth-button";
import { useFavoriteStore } from "@/hooks/use-favorite";

type NavItem = {
	icon: React.ReactNode;
	label: string;
	href: string;
};

type FavoriteItem = {
	userId: string;
	name: string;
	position: string;
	department: string;
	imageUrl?: string;
};

type TeamItem = {
	id: string;
	name: string;
	memberCount: number;
	department: string;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
	{
		icon: <Search size={16} />,
		label: "인재 검색",
		href: "/",
	},
];

const FAVORITE_TEAMS: TeamItem[] = [
	{
		id: "t1",
		name: "WX 해커톤 키맨",
		memberCount: 6,
		department: "POSCO",
	},
	{
		id: "t2",
		name: "데이터 분석팀",
		memberCount: 6,
		department: "데이터팀",
	},
];

function NavigationItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
	return (
		<Link
			href={item.href}
			className={`
        flex items-center
        px-2.5 py-2
        text-gray-300
        hover:bg-[#202020]
        rounded-lg
        transition-all duration-150
        group
        ${isCollapsed ? "justify-center" : "justify-start"}
        hover:text-white
        whitespace-nowrap
      `}
		>
			<span className="text-gray-400 group-hover:text-white">{item.icon}</span>
			{!isCollapsed && <span className="ml-2.5 text-xs font-medium">{item.label}</span>}
		</Link>
	);
}

function FavoriteTalentItem({ talent }: { talent: FavoriteItem }) {
	return (
		<Link
			href={`/profile/${talent.userId}`}
			className="block p-1.5 rounded-lg hover:bg-[#202020] transition-colors duration-150 group"
		>
			<div className="flex items-center">
				<div className="w-6 h-6 bg-[#202020] rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#252525] flex-shrink-0 overflow-hidden">
					{talent.imageUrl ? (
						<Image
							src={talent.imageUrl}
							alt={talent.name}
							width={24}
							height={24}
							className="rounded-full"
						/>
					) : (
						<User size={14} className="group-hover:text-white" />
					)}
				</div>
				<div className="ml-2.5 min-w-0">
					<p className="text-white text-xs font-medium group-hover:text-gray-100 truncate">
						{talent.name}
					</p>
					<p className="text-gray-400 text-[10px] truncate">
						{talent.position} · {talent.department}
					</p>
				</div>
			</div>
		</Link>
	);
}

function UserProfile({ user }: { user: Session["user"] }) {
	if (!user) return null;

	return (
		<Link
			href="/profile"
			className="block p-1.5 rounded-lg hover:bg-[#202020] transition-colors duration-150 group"
		>
			<div className="flex items-center">
				<div className="w-6 h-6 bg-[#202020] rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#252525] flex-shrink-0 overflow-hidden">
					{user.image ? (
						<Image
							src={user.image}
							alt={user.name || ""}
							width={24}
							height={24}
							className="rounded-full"
						/>
					) : (
						<User size={14} className="group-hover:text-white" />
					)}
				</div>
				<div className="ml-2.5 min-w-0">
					<p className="text-white text-xs font-medium group-hover:text-gray-100 truncate">
						{user.name}
					</p>
					<p className="text-gray-400 text-[10px] truncate">{user.email}</p>
				</div>
			</div>
		</Link>
	);
}

interface SidebarProps {
	session: Session | null;
}

export default function Sidebar({ session }: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const { favorites, fetchFavorites } = useFavoriteStore();

	useEffect(() => {
		if (session?.user) {
			fetchFavorites();
		}
	}, [session, fetchFavorites]);

	return (
		<aside
			className={`
      flex flex-col
      h-screen
      bg-[#181818]
      ${isCollapsed ? "w-[50px]" : "w-[220px]"}
      transition-all duration-200 ease-in-out
      py-3 px-1.5
      border-r border-[#202020]
      font-[family-name:var(--font-geist-sans)]
      shadow-md
      overflow-hidden
    `}
		>
			<div className="flex items-center justify-between mb-4 px-1.5">
				{!isCollapsed && (
					<h1 className="text-white text-base font-bold tracking-tight whitespace-nowrap">
						POSCO KEYMAN
					</h1>
				)}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-1.5 hover:bg-[#202020] rounded-lg transition-colors duration-150 active:scale-95 ml-auto"
					type="button"
				>
					{isCollapsed ? (
						<ChevronRight className="w-3.5 h-3.5 text-gray-300" />
					) : (
						<ChevronLeft className="w-3.5 h-3.5 text-gray-300" />
					)}
				</button>
			</div>

			<nav className="space-y-1">
				{DEFAULT_NAV_ITEMS.map((item) => (
					<NavigationItem key={item.label} item={item} isCollapsed={isCollapsed} />
				))}
			</nav>

			{session?.user && !isCollapsed && (
				<div className="flex-1 space-y-4 pt-6 mt-6 border-t border-[#202020]">
					<div className="px-1.5">
						<h2 className="text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider whitespace-nowrap">
							즐겨찾기한 인재
						</h2>
						<div className="space-y-1.5">
							{favorites.map((talent) => (
								<FavoriteTalentItem key={`favorite-${talent.userId}`} talent={talent} />
							))}
						</div>
					</div>
				</div>
			)}

			<div className="mt-auto">
				{!isCollapsed && (
					<div className="px-1.5">
						{session?.user ? <UserProfile user={session.user} /> : <LoginButton />}
					</div>
				)}
			</div>
		</aside>
	);
}
