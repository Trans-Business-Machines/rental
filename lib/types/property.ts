export interface Unit {
	id?: number;
	name: string;
	type: string;
	rent: number;
	status: string;
	bedrooms?: number;
}

export interface Property {
	id: number;
	name: string;
	address: string;
	type: string;
	totalUnits: number | null;
	occupied: number;
	rent: number;
	status: string;
	description: string;
	image: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PropertyFormData {
	name: string;
	address: string;
	type: string;
	totalUnits: string;
	rent: string;
	description: string;
	image: string;
}
