import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type EntityType = "property" | "unit" | "guest";

export function extractFilePath(url: string, entity: EntityType): string {

    const splitterMap: Record<EntityType, string> = {
        property: "/property_images/",
        unit: "/unit_images/",
        guest: "/guest-documents/",
    };

    const splitter = splitterMap[entity]

    const parts = url.split(splitter);
    if (parts.length < 2) {
        throw new Error(`Could not extract file path from URL: ${url}`);
    }

    const filename = parts[1].split("?")[0];
    const folder = splitter.slice(1, -1);
    return `${folder}/${filename}`;
}

