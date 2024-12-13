import { type Message } from "ai";

export interface SearchResult extends Record<string, any> {
	id: string;
	title: string;
	createdAt: Date;
	userId: string;
	path: string;
	messages: {
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
	}[];
	sharePath?: string;
}

export type ServerActionResult<Result> = Promise<
	| Result
	| {
			error: string;
	  }
>;
