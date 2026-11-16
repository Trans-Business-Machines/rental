import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

// Shared helpers for the .xlsx exports (bookings, guests)

export const EXPORT_TIMEZONE = "Africa/Nairobi";
export const EXPORT_MAX_ROWS = 10_000;
export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const PDF_MIME = "application/pdf";

// Builds a { gte, lte } filter where each yyyy-MM-dd bound covers the whole day in EAT
export function eatDayRange(from?: string, to?: string) {
	if (!from && !to) return undefined;
	return {
		...(from && { gte: fromZonedTime(`${from}T00:00:00.000`, EXPORT_TIMEZONE) }),
		...(to && { lte: fromZonedTime(`${to}T23:59:59.999`, EXPORT_TIMEZONE) }),
	};
}

// Excel dates carry no timezone, so shift the instant so the cell shows EAT wall-clock time
export function toExcelEAT(date: Date | null | undefined) {
	if (!date || Number.isNaN(date.getTime())) return null;
	return new Date(`${formatInTimeZone(date, EXPORT_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss")}Z`);
}

// Today's date in EAT, for export filenames
export function exportDateStamp() {
	return formatInTimeZone(new Date(), EXPORT_TIMEZONE, "yyyy-MM-dd");
}

// Client-side: decode a base64 file returned by a server action and trigger a download
export function downloadBase64File(base64: string, filename: string, mime: string = XLSX_MIME) {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

	const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}
