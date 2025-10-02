export type AdPlacement =
	| "banner"
	| "sidebar"
	| "interstitial"
	| "native"
	| "video"
	| "footer"
	| "header";

export type AdStatus =
	| "active"
	| "paused"
	| "deactivated"
	| "pending"
	| "scheduled";

export interface AdSpot {
	id: string;
	title: string;
	imageUrl: string;
	placement: AdPlacement;
	status: AdStatus;
	createdAt: string;
	deactivatedAt?: string | null;
	ttlMinutes?: number | null;
}
