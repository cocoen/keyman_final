// TalentSearchPanel.tsx (Server Component)
import { redirect } from "next/navigation";
import { auth } from "./lib/auth";
import SearchInput from "@/components/search-input";

// 서버 액션
async function searchTalents(formData: FormData) {
	"use server";
	const query = formData.get("query")?.toString();
	if (!query?.trim()) return;
	redirect(`/search?query=${encodeURIComponent(query)}`);
}

export default async function TalentSearchPanel() {
	const session = await auth();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-[#212121] text-white p-8">
			<h1 className="text-2xl mb-5 font-bold">당신의 KEYMAN 을 찾아드립니다</h1>
			<SearchInput onSubmit={searchTalents} session={session} />
			<p className="text-[#9A9A9A] text-[11px] text-center fixed bottom-3">
				검색 결과를 모델을 훈련하는 데 사용하지 않습니다. Keyman은 테스트 버전으로 실수를 할 수
				있습니다.
			</p>
		</div>
	);
}
