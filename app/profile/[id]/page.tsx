import { auth } from "@/app/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, MapPin, Phone, Mail, Award } from "lucide-react";
import { FavoriteButton } from "@/components/favorite-button";
import userData from "./keyman_10samples.json";
import axios from "axios";

interface UserData {
	id: string;
	name: string;
	position: string;
	company: string;
	location: string;
	phone: string;
	email: string;
	department: string;
	education: {
		degree: string;
		major: string;
		graduatedAt: string;
	};
	experience: string;
	projects: Array<{
		name: string;
		period: string;
		description: string;
	}>;
	skills: {
		main: string[];
		technical: string[];
	};
	certifications: string[];
}

interface KeymanData {
	employees: Array<{
		id: string;
		personalInfo: {
			name: string;
			email: string;
			mphone: string;
			dphone: string;
			location: string;
		};
		eduBg: Array<{
			degree: string;
			major: string;
			date_awarded: string;
		}>;
		professionalInfo: {
			degree_last: string;
			academic_major: string;
			company: string;
			department: string;
			position: string;
			yearsOfExperience: number;
			joinDate: string;
			employmentType: string;
		};
		skills: {
			main?: string[];
			technical?: Array<{
				name: string;
				proficiency: string;
			}>;
			soft?: string[];
			certifications?: Array<{
				name: string;
				issueDate: string;
				expiryDate: string;
			}>;
		};
		workExps: Array<{
			name: string;
			duration_from: string;
			duration_to: string;
		}>;
		distinctions: Array<{
			name: string;
			role: string;
			duration_from: string;
			duration_to: string;
			technologies_or_skills: string[];
			achievements: string[];
		}>;
	}>;
}

export default async function ProfilePage({
	params,
	searchParams,
}: {
	params: { id: string };
	searchParams: { [key: string]: string | string[] | undefined };
}) {
	const session = await auth();
	const {query} = await searchParams;
	const {id: profileId} = await params

	if (!session?.user) {
		redirect("/");
	}

	// ID에서 숫자 부분을 추출
	const numericId = parseInt(profileId.replace("KEYMAN", ""), 10);
	// numericId가 5 이상이면 randomuser.me 이미지 사용
	let userImageUrl = `/images/${profileId}.jpg`;
	if (numericId >= 5) {
		userImageUrl = `https://randomuser.me/api/portraits/men/${numericId}.jpg`;
	}

	// Find user data by matching profile ID
	const matchedUserData = (userData as unknown as KeymanData).employees.find(
		(user) => user.id === profileId
	);

	if (!matchedUserData) {
		redirect("/search");
	}

	// 서버에서 explanation 데이터 받아오기
	// 실제 API 엔드포인트로 변경 필요

	const explanationResponse = await axios.post("http://localhost:8000/explain_individual", { query, numericId });
	const explanation = explanationResponse.data?.explanation || "";


	// Transform keyman data to UserData
	const transformedUserData: UserData = {
		id: matchedUserData.id,
		name: matchedUserData.personalInfo.name,
		position: matchedUserData.professionalInfo.position,
		company: matchedUserData.professionalInfo.company,
		location: matchedUserData.personalInfo.location,
		phone: matchedUserData.personalInfo.mphone,
		email: matchedUserData.personalInfo.email,
		department: matchedUserData.professionalInfo.department,
		education: {
			degree: matchedUserData.eduBg[0]?.degree || "",
			major: matchedUserData.eduBg[0]?.major || "",
			graduatedAt: matchedUserData.eduBg[0]?.date_awarded || "",
		},
		experience: `${matchedUserData.professionalInfo.yearsOfExperience}년`,
		projects: matchedUserData.workExps.map((exp) => ({
			name: exp.name,
			period: `${exp.duration_from} - ${exp.duration_to}`,
			description: "",
		})),
		skills: {
			main: matchedUserData.skills.soft || [],
			technical: matchedUserData.skills.technical?.map((tech) => tech.name) || [],
		},
		certifications: matchedUserData.skills.certifications?.map((cert) => cert.name) || [],
	};

	return (
		<div className="min-h-screen bg-[#212121] text-white">
			<nav className="sticky top-0 z-10 bg-[#212121]/90 border-b border-[#2A2A2A] px-3 py-2">
				<div className="max-w-4xl mx-auto flex items-center justify-between">
					<a
						href={`/search?query=${query || ""}`}
						className="flex items-center text-[#A8A8A8] hover:text-white"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-4 h-4 mr-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
						<span className="text-xs">뒤로가기</span>
					</a>
					<FavoriteButton
						userId={profileId}
						name={transformedUserData.name}
						position={transformedUserData.position}
						department={transformedUserData.department}
						imageUrl={userImageUrl}
						url="profile"
					/>
				</div>
			</nav>

			<main className="p-8">
				<div className="max-w-3xl mx-auto">
					{/* Profile Header */}
					<div className="mb-8">
						<div className="flex items-start justify-between">
							<div className="flex gap-6">
								<div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center overflow-hidden">
									{session.user.image ? (
										<Image
											src={userImageUrl}
											alt={transformedUserData.name}
											width={96}
											height={96}
											className="rounded-full"
										/>
									) : (
										<User size={40} className="text-gray-300" />
									)}
								</div>
								<div className="space-y-4">
									<div>
										<h1 className="text-2xl font-bold mb-1">{transformedUserData.name}</h1>
										<p className="text-gray-400">
											{transformedUserData.position} @ {transformedUserData.company}
										</p>
									</div>
									<div className="space-y-2">
										{transformedUserData.location && (
											<div className="flex items-center gap-2 text-sm text-gray-300">
												<MapPin size={16} />
												<span>{transformedUserData.location}</span>
											</div>
										)}
										{transformedUserData.phone && (
											<div className="flex items-center gap-2 text-sm text-gray-300">
												<Phone size={16} />
												<span>{transformedUserData.phone}</span>
											</div>
										)}
										{transformedUserData.email && (
											<div className="flex items-center gap-2 text-sm text-gray-300">
												<Mail size={16} />
												<span>{transformedUserData.email}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<Tabs defaultValue="info" className="w-full">
						<TabsList className="w-full bg-[#2A2A2A] border-b border-[#303030]">
							<TabsTrigger
								value="info"
								className="flex-1 data-[state=active]:bg-[#303030] text-gray-300 data-[state=active]:text-white"
							>
								기본정보
							</TabsTrigger>
							<TabsTrigger
								value="projects"
								className="flex-1 data-[state=active]:bg-[#303030] text-gray-300 data-[state=active]:text-white"
							>
								업무경험
							</TabsTrigger>
							<TabsTrigger
								value="skills"
								className="flex-1 data-[state=active]:bg-[#303030] text-gray-300 data-[state=active]:text-white"
							>
								전문성
							</TabsTrigger>
						</TabsList>

						<TabsContent value="info" className="mt-6">
							<div className="space-y-4">
								{transformedUserData.department && transformedUserData.company && (
									<div className="bg-[#2A2A2A] p-4 rounded-lg">
										<h3 className="text-sm font-medium mb-2">소속</h3>
										<p className="text-gray-400 text-sm">
											{transformedUserData.department} @ {transformedUserData.company}
										</p>
									</div>
								)}
								{transformedUserData.education.degree &&
									transformedUserData.education.major &&
									transformedUserData.education.graduatedAt && (
										<div className="bg-[#2A2A2A] p-4 rounded-lg">
											<h3 className="text-sm font-medium mb-2">학력</h3>
											<div className="flex items-center gap-2 text-gray-400 text-sm">
												<span>{transformedUserData.education.degree}</span>
												<span>•</span>
												<span>{transformedUserData.education.major}</span>
												<span>•</span>
												<span>{transformedUserData.education.graduatedAt} 졸업</span>
											</div>
										</div>
									)}
								{transformedUserData.experience && (
									<div className="bg-[#2A2A2A] p-4 rounded-lg">
										<h3 className="text-sm font-medium mb-2">경력</h3>
										<p className="text-gray-400 text-sm">{transformedUserData.experience}</p>
									</div>
								)}

								{explanation && (
									<div className="bg-[#2A2A2A] p-4 rounded-lg">
										<h3 className="text-sm font-medium mb-2">추천 사유</h3>
										<p className="text-gray-400 text-sm">{explanation}</p>
									</div>
								)}

								
							</div>
						</TabsContent>

						<TabsContent value="projects" className="mt-6">
							{transformedUserData.projects.length > 0 && (
								<div className="space-y-4">
									{transformedUserData.projects.map((project, index) => (
										<div key={index} className="bg-[#2A2A2A] p-4 rounded-lg">
											<div className="flex items-center gap-2">
												<h3 className="text-sm font-medium flex-1">{project.name}</h3>
												<span className="text-gray-400 text-xs">{project.period}</span>
											</div>
											{project.description && (
												<p className="text-gray-300 text-sm mt-2">{project.description}</p>
											)}
										</div>
									))}
								</div>
							)}
						</TabsContent>

						<TabsContent value="skills" className="mt-6">
							<div className="space-y-4">
								{transformedUserData.skills.main.length > 0 && (
									<div className="bg-[#2A2A2A] p-4 rounded-lg">
										<h3 className="text-sm font-medium mb-3">주요 역량</h3>
										<div className="flex flex-wrap gap-2">
											{transformedUserData.skills.main.map((skill, index) => (
												<span key={index} className="px-3 py-1.5 bg-[#303030] rounded-full text-xs">
													{skill}
												</span>
											))}
										</div>
									</div>
								)}

								{transformedUserData.skills.technical.length > 0 && (
									<div className="bg-[#2A2A2A] p-4 rounded-lg">
										<h3 className="text-sm font-medium mb-3">기술 스택</h3>
										<div className="flex flex-wrap gap-2">
											{transformedUserData.skills.technical.map((tech, index) => (
												<span key={index} className="px-3 py-1.5 bg-[#303030] rounded-full text-xs">
													{tech}
												</span>
											))}
										</div>
									</div>
								)}

								{transformedUserData.certifications.length > 0 && (
									<div className="bg-[#2A2A2A] p-4 rounded-lg">
										<h3 className="text-sm font-medium mb-3">자격증</h3>
										<div className="space-y-2">
											{transformedUserData.certifications.map((cert, index) => (
												<div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
													<Award size={16} className="text-gray-400" />
													<span>{cert}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</main>
		</div>
	);
}
