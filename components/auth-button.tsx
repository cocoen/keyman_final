"use client";

import { LogIn } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginButton() {
	return (
		<button
			onClick={() => signIn("google")}
			type="button"
			className="flex items-center px-2.5 py-2 text-gray-300 hover:bg-[#2A2A2A] rounded-lg transition-all duration-150 group hover:text-white w-full cursor-pointer"
		>
			<LogIn size={16} className="text-gray-400 group-hover:text-white" />
			<span className="ml-2.5 text-xs font-medium">로그인</span>
		</button>
	);
}
