export type CountryLocation = {
    country: string;
    cities: string[];
};

export const LOCATION_CATALOG: CountryLocation[] = [
    {
        country: "India",
        cities: [
            "Bengaluru",
            "Chennai",
            "Hyderabad",
            "Pune",
            "Mumbai",
            "Delhi NCR",
            "Noida",
            "Gurugram",
            "Kolkata",
            "Ahmedabad",
            "Kochi",
            "Coimbatore",
            "Jaipur",
            "Chandigarh",
            "Indore",
        ],
    },
    { country: "United Arab Emirates", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
    { country: "Singapore", cities: ["Singapore"] },
    { country: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Edinburgh"] },
    { country: "United States", cities: ["New York", "San Francisco Bay Area", "Seattle", "Austin", "Boston", "Chicago"] },
    { country: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary"] },
    { country: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth"] },
    { country: "Germany", cities: ["Berlin", "Munich", "Frankfurt", "Hamburg"] },
    { country: "Netherlands", cities: ["Amsterdam", "Rotterdam", "Eindhoven"] },
    { country: "Ireland", cities: ["Dublin", "Cork", "Galway"] },
    { country: "Japan", cities: ["Tokyo", "Osaka"] },
];

const INDIA_CITY_SEARCH_NAMES: Record<string, string> = {
    Bengaluru: "Bengaluru, Karnataka, India",
    Chennai: "Chennai, Tamil Nadu, India",
    Hyderabad: "Hyderabad, Telangana, India",
    Pune: "Pune, Maharashtra, India",
    Mumbai: "Mumbai, Maharashtra, India",
    "Delhi NCR": "Delhi, India",
    Noida: "Noida, Uttar Pradesh, India",
    Gurugram: "Gurugram, Haryana, India",
    Kolkata: "Kolkata, West Bengal, India",
    Ahmedabad: "Ahmedabad, Gujarat, India",
    Kochi: "Kochi, Kerala, India",
    Coimbatore: "Coimbatore, Tamil Nadu, India",
    Jaipur: "Jaipur, Rajasthan, India",
    Chandigarh: "Chandigarh, India",
    Indore: "Indore, Madhya Pradesh, India",
};

export function canonicalSearchLocation(city: string, country: string): string {
    if (country === "India" && INDIA_CITY_SEARCH_NAMES[city]) return INDIA_CITY_SEARCH_NAMES[city];
    return [city, country].filter(Boolean).join(", ");
}

export function composePreferredLocation(country: string, cities: string[], customLocation: string): string {
    const locations = [...cities, customLocation.trim()].filter(Boolean);
    if (!country) return locations.join(", ");
    return [...locations, country].filter((value, index, values) => values.indexOf(value) === index).join(", ");
}

export function inferStructuredLocation(location: string): {
    country: string;
    cities: string[];
    customLocation: string;
} {
    const parts = location.split(",").map((part) => part.trim()).filter(Boolean);
    const catalogEntry = LOCATION_CATALOG.find((entry) =>
        parts.some((part) => part.toLowerCase() === entry.country.toLowerCase()),
    );
    if (!catalogEntry) {
        return { country: "", cities: [], customLocation: location.trim() };
    }

    const cities = catalogEntry.cities.filter((city) =>
        parts.some((part) => part.toLowerCase() === city.toLowerCase()),
    );
    const customParts = parts.filter((part) =>
        part.toLowerCase() !== catalogEntry.country.toLowerCase() &&
        !cities.some((city) => city.toLowerCase() === part.toLowerCase()),
    );
    return {
        country: catalogEntry.country,
        cities,
        customLocation: customParts.join(", "),
    };
}