import { auth } from "@/app/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { redirect } from "next/navigation";
import Image from "next/image";
import { User, MapPin, Phone, Mail, Award } from "lucide-react";
import SignOutButton from "@/components/sign-out-button";

export default async function ProfilePage() {
	const session = await auth();

	if (!session?.user) {
		redirect("/");
	}

	// Example data for Lee Hyemin
	const userData = {
		name: "이혜민",
		email: "lhmin@posco-inc.com",
		phone: "054-222-6752",
		mobile: "010-4557-3292",
		location: "포항 미래기술연구원 본원",
		company: "포스코홀딩스",
		department: "AI로봇융합연구소",
		position: "수석연구원",
		experience: "10년",
		education: {
			degree: "박사",
			major: "컴퓨터공학",
			graduatedAt: "2023.02",
		},
		certifications: [
			"TensorFlow Developer Certificate",
			"AWS Certified Machine Learning Specialist",
			"Robot Operating System (ROS) Expert Certification",
		],
		skills: {
			main: ["AI 모델링", "데이터 분석", "협업"],
			technical: ["Python", "TensorFlow", "PyTorch", "ROS", "AWS"],
		},
		projects: [
			{
				name: "포스코그룹 WX 해커톤 - 키맨 프로젝트",
				period: "2024.11 - 2024.12",
				description: "포스코 그룹 인텔리전트 임직원 검색 솔루션 개발",
			},
			{
				name: "자율주행 기관차 플랫폼 구축",
				period: "2023.02 - 2024.12",
				description: "23년 임원포상 수상 프로젝트",
			},
			{
				name: "자율주행 TLC 플랫폼 구축",
				period: "2024.03 - 2024.12",
				description: "자율주행 TLC 시스템 설계 및 구현",
			},
		],
	};

	return (
		<main className="min-h-screen bg-[#212121] text-white p-8">
			<div className="max-w-3xl mx-auto">
				{/* Navigation Bar */}
				<nav className="sticky top-0 z-10 bg-[#212121] px-3 py-2 border-b border-[#2A2A2A]">
					<div className="max-w-4xl mx-auto flex items-center justify-between">
						<h1 className="text-lg font-bold text-white">My Profile</h1>
					</div>
				</nav>
				{/* Profile Header */}
				<div className="mb-8">
					<div className="flex items-start justify-between">
						<div className="flex gap-6">
							<div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center overflow-hidden">
								{session.user.image ? (
									<Image
										//src={session.user.image}
										src="/images/KEYMAN002.jpg"
										alt={userData.name}
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
									<h1 className="text-2xl font-bold mb-1">{userData.name}</h1>
									<p className="text-gray-400">
										{userData.position} @ {userData.company}
									</p>
								</div>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<MapPin size={16} />
										<span>{userData.location}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<Phone size={16} />
										<span>{userData.phone}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-300">
										<Mail size={16} />
										<span>{userData.email}</span>
									</div>
								</div>
							</div>
						</div>
						<SignOutButton />
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
							<div className="bg-[#2A2A2A] p-4 rounded-lg">
								<h3 className="text-sm font-medium mb-2">소속</h3>
								<p className="text-gray-400 text-sm">
									{userData.department} @ {userData.company}
								</p>
							</div>
							<div className="bg-[#2A2A2A] p-4 rounded-lg">
								<h3 className="text-sm font-medium mb-2">학력</h3>
								<div className="flex items-center gap-2 text-gray-400 text-sm">
									<span>{userData.education.degree}</span>
									<span>•</span>
									<span>{userData.education.major}</span>
									<span>•</span>
									<span>{userData.education.graduatedAt} 졸업</span>
								</div>
							</div>
							<div className="bg-[#2A2A2A] p-4 rounded-lg">
								<h3 className="text-sm font-medium mb-2">경력</h3>
								<p className="text-gray-400 text-sm">{userData.experience}</p>
							</div>
						</div>
					</TabsContent>

					<TabsContent value="projects" className="mt-6">
						<div className="space-y-4">
							{userData.projects.map((project, index) => (
								<div key={index} className="bg-[#2A2A2A] p-4 rounded-lg">
									<div className="flex items-center gap-2">
										<h3 className="text-sm font-medium flex-1">{project.name}</h3>
										<span className="text-gray-400 text-xs">{project.period}</span>
									</div>
									<p className="text-gray-300 text-sm mt-2">{project.description}</p>
								</div>
							))}
						</div>
					</TabsContent>

					<TabsContent value="skills" className="mt-6">
						<div className="space-y-4">
							<div className="bg-[#2A2A2A] p-4 rounded-lg">
								<h3 className="text-sm font-medium mb-3">주요 역량</h3>
								<div className="flex flex-wrap gap-2">
									{userData.skills.main.map((skill, index) => (
										<span key={index} className="px-3 py-1.5 bg-[#303030] rounded-full text-xs">
											{skill}
										</span>
									))}
								</div>
							</div>

							<div className="bg-[#2A2A2A] p-4 rounded-lg">
								<h3 className="text-sm font-medium mb-3">기술 스택</h3>
								<div className="flex flex-wrap gap-2">
									{userData.skills.technical.map((tech, index) => (
										<span key={index} className="px-3 py-1.5 bg-[#303030] rounded-full text-xs">
											{tech}
										</span>
									))}
								</div>
							</div>

							<div className="bg-[#2A2A2A] p-4 rounded-lg">
								<h3 className="text-sm font-medium mb-3">자격증</h3>
								<div className="space-y-2">
									{userData.certifications.map((cert, index) => (
										<div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
											<Award size={16} className="text-gray-400" />
											<span>{cert}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</main>
	);
}
