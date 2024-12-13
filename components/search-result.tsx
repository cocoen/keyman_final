"use client";

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FavoriteButton } from "@/components/favorite-button";
import { Building, Briefcase, Phone, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchResult {
	id: string;
	name: string;
	position: string;
	skills: string[];
	experience: number;
	department: string;
	projects: string[];
	profileImage?: string;
	highlights: string[];
	availability: "available" | "busy" | "unavailable";
	dphone: string; // 회사번호
	mphone: string; // 개인번호
	email: string;
}

type SearchPromptType = "해커톤 담당자 검색" | "모바일 로봇 S/W 설계" | "해상풍력 강재와 구조 설계";

const PROMPT_EXAMPLES: Record<SearchPromptType, string> = {
	"해커톤 담당자 검색":
		"포스코그룹 WX 해커톤 대회에서 임직원 검색 솔루션(키맨)을 개발한 담당자를 찾아줘",
	"모바일 로봇 S/W 설계":
		"포스코DX에서 컴퓨터공학 전공과 관련된 석사, 박사 중 모바일 로봇 소프트웨어(S/W) 설계 경험이 있는 사람 찾아줘",
	"해상풍력 강재와 구조 설계":
		"해상풍력용 강재를 담당하는 포스코 연구원과 해상풍력 구조 설계를 담당하는 포스코이앤씨 리더를 검색해줘",
};

function getSearchResults(query: string, searchResults: SearchResult[]) {
	if (query === PROMPT_EXAMPLES["해커톤 담당자 검색"]) {
		return searchResults.slice(0, 5);
	}
	if (query === PROMPT_EXAMPLES["모바일 로봇 S/W 설계"]) {
		return searchResults.slice(0, 2);
	}
	if (query === PROMPT_EXAMPLES["해상풍력 강재와 구조 설계"]) {
		return searchResults.slice(0, 3);
	}
	return searchResults;
}

function getAvailabilityInfo(availability: SearchResult["availability"]) {
	const availabilityMap = {
		available: {
			text: "협업 가능",
			dotColor: "bg-green-500/50",
			textColor: "text-green-300",
		},
		busy: {
			text: "진행중",
			dotColor: "bg-yellow-500/50",
			textColor: "text-yellow-300",
		},
		unavailable: {
			text: "협업 불가",
			dotColor: "bg-red-500/50",
			textColor: "text-red-300",
		},
	};

	return (
		availabilityMap[availability] || {
			text: "",
			dotColor: "",
			textColor: "",
		}
	);
}

interface SearchResultsClientProps {
	query: string;
	selectedView: "card" | "list";
}

export default function SearchResultsClient({ query, selectedView }: SearchResultsClientProps) {
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [sortBy, setSortBy] = useState<"experience" | "name">("experience");
	const router = useRouter();

	// query 변경 시에만 데이터 요청
	useEffect(() => {
		const fetchResults = async () => {
			setIsLoading(true);
			try {
				const response = await axios.post("http://localhost:8000/search", { query });
				const searchResults = response.data.results as SearchResult[];
				setResults(getSearchResults(query, searchResults));
			} catch (error) {
				console.error("Failed to fetch results:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchResults();
	}, [query]);

	// 정렬된 결과를 memo화하여 selectedView 변경에 따른 성능 최적화
	const sortedResults = useMemo(() => {
		return [...results].sort((a, b) => {
			if (sortBy === "experience") {
				return b.experience - a.experience;
			}
			return a.name.localeCompare(b.name);
		});
	}, [results, sortBy]);

	return (
		<div>
			<div className="flex items-center justify-between mb-3">
				<h1 className="text-sm font-medium">
					검색 결과 <span className="text-[#A8A8A8]">({results.length}명)</span>
				</h1>
				<select
					className="bg-[#2A2A2A] border border-[#363636] rounded-lg px-2 py-1 text-xs"
					value={sortBy}
					onChange={(e) => setSortBy(e.target.value as "experience" | "name")}
				>
					<option value="experience">경력순</option>
					<option value="name">이름순</option>
				</select>
			</div>

			{selectedView === "card" ? (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
					{isLoading
						? [...Array(4)].map((_, i) => (
								<div
									key={i}
									className="bg-[#2A2A2A] border border-[#363636] rounded-2xl p-3 animate-pulse"
								>
									{/* 로딩 상태 스켈레톤 UI */}
									<div className="flex items-start space-x-3">
										<div className="w-10 h-10 rounded-full bg-[#363636]" />
										<div className="flex-1">
											<div className="h-4 bg-[#363636] rounded w-24 mb-2" />
											<div className="space-y-1">
												<div className="h-3 bg-[#363636] rounded w-32" />
												<div className="h-3 bg-[#363636] rounded w-28" />
												<div className="h-3 bg-[#363636] rounded w-20" />
											</div>
											<div className="mt-4 space-y-2">
												<div className="space-y-1">
													<div className="h-2 bg-[#363636] rounded w-16" />
													<div className="flex gap-1">
														<div className="h-4 bg-[#363636] rounded w-16" />
														<div className="h-4 bg-[#363636] rounded w-16" />
													</div>
												</div>
												<div className="space-y-1">
													<div className="h-2 bg-[#363636] rounded w-16" />
													<div className="flex gap-1">
														<div className="h-4 bg-[#363636] rounded w-14" />
														<div className="h-4 bg-[#363636] rounded w-14" />
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
						  ))
						: sortedResults.map((result) => {
								const imageSrc =
									typeof result.profileImage === "string" && result.profileImage.trim() !== ""
										? result.profileImage.includes("random")
											? result.profileImage
											: `/images/${result.id}.jpg`
										: "/images/default.jpg";
								return (
									<div
										key={result.id}
										className="group relative bg-[#2A2A2A] border border-[#363636] rounded-2xl p-3 
									hover:bg-[#363636] cursor-pointer pb-10"
										onClick={() =>
											router.push(`/profile/${result.id}?query=${encodeURIComponent(query)}`)
										}
									>
										<div onClick={(e) => e.stopPropagation()}>
											<FavoriteButton
												userId={result.id}
												name={result.name}
												position={result.position}
												department={result.department}
												imageUrl={imageSrc}
												url="search"
											/>
										</div>
										<div className="flex items-start space-x-3">
											{imageSrc ? (
												<div className="relative w-10 h-10">
													<Image
														src={imageSrc}
														alt={result.name}
														width={40}
														height={40}
														className="rounded-full object-cover w-10 h-10 aspect-square"
													/>
												</div>
											) : (
												<div className="w-10 h-10 rounded-full bg-[#363636] flex items-center justify-center text-sm font-medium">
													{result.name.slice(0, 1)}
												</div>
											)}
											<div className="flex-1">
												<div className="flex items-start justify-between mb-2">
													<div>
														<h3 className="text-sm font-medium">{result.name}</h3>
														<div className="flex items-center space-x-1.5 mt-0.5">
															<Building className="w-3 h-3 text-[#A8A8A8]" />
															<p className="text-xs text-[#A8A8A8]">{result.department}</p>
														</div>
														<div className="flex items-center space-x-1.5 mt-0.5">
															<Briefcase className="w-3 h-3 text-[#A8A8A8]" />
															<p className="text-xs text-[#A8A8A8]">{result.position}</p>
														</div>
														<div className="flex items-center space-x-1.5 mt-0.5">
															<div
																className={`w-1.5 h-1.5 rounded-full ${
																	getAvailabilityInfo(result.availability).dotColor
																}`}
															/>
															<p
																className={`text-xs ${
																	getAvailabilityInfo(result.availability).textColor
																}`}
															>
																{getAvailabilityInfo(result.availability).text}
															</p>
														</div>
													</div>
													<div className="flex flex-col items-end space-y-1">
														<span
															className={`px-1.5 py-0.5 rounded text-[10px] ${
																result.availability === "available"
																	? "bg-green-900/10 text-green-300/90"
																	: result.availability === "busy"
																	? "bg-yellow-900/10 text-yellow-300/90"
																	: "bg-red-900/10 text-red-300/90"
															}`}
														>
															{result.experience}년차
														</span>
														<div className="flex items-center space-x-1.5">
															<Phone className="w-3 h-3 text-[#A8A8A8]" />
															<p className="text-xs text-[#A8A8A8]">{result.dphone}</p>
														</div>
														<div className="flex items-center space-x-1.5">
															<Phone className="w-3 h-3 text-[#A8A8A8]" />
															<p className="text-xs text-[#A8A8A8]">{result.mphone}</p>
														</div>
														<div className="flex items-center space-x-1.5">
															<Mail className="w-3 h-3 text-[#A8A8A8]" />
															<p className="text-xs text-[#A8A8A8]">{result.email}</p>
														</div>
													</div>
												</div>

												<div className="space-y-2">
													<div>
														<p className="text-[10px] font-medium mb-1">주요 강점</p>
														<div className="flex flex-wrap gap-1">
															{result.highlights.map((highlight) => (
																<span
																	key={highlight}
																	className="flex items-center space-x-1 bg-[#363636] px-1.5 py-0.5 rounded text-[10px]"
																>
																	<span>{highlight}</span>
																</span>
															))}
														</div>
													</div>

													<div>
														<p className="text-[10px] font-medium mb-1">전문성</p>
														<div className="flex flex-wrap gap-1">
															{result.skills.map((skill) => (
																<span
																	key={skill}
																	className="bg-[#363636] px-1.5 py-0.5 rounded text-[10px]"
																>
																	{skill}
																</span>
															))}
														</div>
													</div>

													<div>
														<p className="text-[10px] font-medium mb-1">업무 경험</p>
														<ul className="space-y-0.5 text-[10px] text-[#A8A8A8]">
															{result.projects.map((project) => (
																<li key={project} className="flex items-center space-x-1">
																	<span className="w-0.5 h-0.5 rounded-full bg-[#454545]" />
																	<span>{project}</span>
																</li>
															))}
														</ul>
													</div>
												</div>
											</div>
										</div>
									</div>
								);
						  })}
				</div>
			) : (
				<div className="space-y-2">
					{isLoading
						? [...Array(4)].map((_, i) => (
								<div
									key={i}
									className="bg-[#2A2A2A] border border-[#363636] rounded-xl p-3 animate-pulse"
								>
									{/* 로딩 상태 스켈레톤 UI */}
									<div className="flex items-center space-x-4">
										<div className="w-10 h-10 rounded-full bg-[#363636]" />
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<div className="h-4 bg-[#363636] rounded w-24" />
												<div className="h-4 bg-[#363636] rounded w-16" />
											</div>
											<div className="mt-2 flex gap-2">
												<div className="h-3 bg-[#363636] rounded w-24" />
												<div className="h-3 bg-[#363636] rounded w-24" />
											</div>
											<div className="mt-2 flex gap-1">
												<div className="h-5 bg-[#363636] rounded w-16" />
												<div className="h-5 bg-[#363636] rounded w-16" />
												<div className="h-5 bg-[#363636] rounded w-16" />
											</div>
										</div>
									</div>
								</div>
						  ))
						: sortedResults.map((result) => {
								const imageSrc =
									typeof result.profileImage === "string" && result.profileImage.includes("random")
										? result.profileImage
										: `/images/${result.id}.jpg`;

								return (
									<div
										key={result.id}
										className="group relative bg-[#2A2A2A] border border-[#363636] rounded-xl p-3 
									hover:bg-[#363636] cursor-pointer"
										onClick={() => router.push(`/profile/${result.id}`)}
									>
										<div onClick={(e) => e.stopPropagation()}>
											<FavoriteButton
												userId={result.id}
												name={result.name}
												position={result.position}
												department={result.department}
												imageUrl={imageSrc}
												url="search"
											/>
										</div>
										<div className="flex items-center space-x-4">
											{imageSrc ? (
												<div className="relative w-10 h-10">
													<Image
														src={imageSrc}
														alt={result.name}
														width={40}
														height={40}
														className="rounded-full object-cover w-10 h-10 aspect-square"
													/>
												</div>
											) : (
												<div className="w-10 h-10 rounded-full bg-[#363636] flex items-center justify-center text-sm font-medium">
													{result.name.slice(0, 1)}
												</div>
											)}
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between">
													<div className="flex items-center space-x-2">
														<h3 className="text-sm font-medium">{result.name}</h3>
														<span
															className={`px-1.5 py-0.5 rounded text-[10px] ${
																result.availability === "available"
																	? "bg-green-900/10 text-green-300/90"
																	: result.availability === "busy"
																	? "bg-yellow-900/10 text-yellow-300/90"
																	: "bg-red-900/10 text-red-300/90"
															}`}
														>
															{result.experience}년차
														</span>
													</div>
													<div className="flex items-center space-x-4">
														<div className="flex items-center space-x-1">
															<Phone className="w-3 h-3 text-[#A8A8A8]" />
															<span className="text-xs text-[#A8A8A8]">회사: {result.dphone}</span>
														</div>
														<div className="flex items-center space-x-1">
															<Phone className="w-3 h-3 text-[#A8A8A8]" />
															<span className="text-xs text-[#A8A8A8]">개인: {result.mphone}</span>
														</div>
														<div className="flex items-center space-x-1">
															<Mail className="w-3 h-3 text-[#A8A8A8]" />
															<span className="text-xs text-[#A8A8A8]">{result.email}</span>
														</div>
													</div>
												</div>
												<div className="flex items-center space-x-4 mt-1 text-xs text-[#A8A8A8]">
													<div className="flex items-center space-x-1">
														<Building className="w-3 h-3" />
														<span>{result.department}</span>
													</div>
													<div className="flex items-center space-x-1">
														<Briefcase className="w-3 h-3" />
														<span>{result.position}</span>
													</div>
													<div className="flex items-center space-x-1.5">
														<div
															className={`w-1.5 h-1.5 rounded-full ${
																getAvailabilityInfo(result.availability).dotColor
															}`}
														/>
														<p
															className={`text-xs ${
																getAvailabilityInfo(result.availability).textColor
															}`}
														>
															{getAvailabilityInfo(result.availability).text}
														</p>
													</div>
												</div>
												<div className="mt-2">
													<div className="flex flex-wrap gap-1">
														{result.highlights.slice(0, 3).map((highlight) => (
															<span
																key={highlight}
																className="bg-[#363636] px-1.5 py-0.5 rounded text-[10px]"
															>
																{highlight}
															</span>
														))}
													</div>
												</div>
											</div>
										</div>
									</div>
								);
						  })}
				</div>
			)}
		</div>
	);
}
