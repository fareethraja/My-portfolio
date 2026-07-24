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
            "Bhubaneswar",
            "Thiruvananthapuram",
            "Mysuru",
            "Mangaluru",
            "Madurai",
            "Tiruchirappalli",
            "Salem",
            "Tiruppur",
            "Hosur",
            "Visakhapatnam",
            "Vijayawada",
            "Warangal",
            "Nagpur",
            "Nashik",
            "Surat",
            "Vadodara",
            "Rajkot",
            "Lucknow",
            "Kanpur",
            "Patna",
            "Ranchi",
            "Guwahati",
            "Dehradun",
            "Bhopal",
            "Raipur",
            "Ludhiana",
            "Mohali",
            "Panaji",
            "Kozhikode",
            "Thrissur",
        ],
    },
    { country: "United Arab Emirates", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah"] },
    { country: "Singapore", cities: ["Singapore"] },
    { country: "United Kingdom", cities: ["London", "Manchester", "Birmingham", "Edinburgh", "Glasgow", "Leeds", "Bristol", "Cambridge"] },
    { country: "United States", cities: ["New York", "San Francisco Bay Area", "Seattle", "Austin", "Boston", "Chicago", "Los Angeles", "San Diego", "Denver", "Atlanta", "Dallas", "Washington DC"] },
    { country: "Canada", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Waterloo", "Edmonton"] },
    { country: "Australia", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"] },
    { country: "Germany", cities: ["Berlin", "Munich", "Frankfurt", "Hamburg", "Cologne", "Stuttgart", "Dusseldorf"] },
    { country: "Netherlands", cities: ["Amsterdam", "Rotterdam", "Eindhoven", "Utrecht", "The Hague"] },
    { country: "Ireland", cities: ["Dublin", "Cork", "Galway", "Limerick"] },
    { country: "Japan", cities: ["Tokyo", "Osaka", "Yokohama", "Kyoto", "Fukuoka"] },
    { country: "Malaysia", cities: ["Kuala Lumpur", "Penang", "Johor Bahru"] },
    { country: "New Zealand", cities: ["Auckland", "Wellington", "Christchurch"] },
    { country: "France", cities: ["Paris", "Lyon", "Toulouse", "Lille"] },
    { country: "Switzerland", cities: ["Zurich", "Geneva", "Basel", "Lausanne"] },
    { country: "Sweden", cities: ["Stockholm", "Gothenburg", "Malmo"] },
    { country: "Poland", cities: ["Warsaw", "Krakow", "Wroclaw", "Gdansk"] },
    { country: "Saudi Arabia", cities: ["Riyadh", "Jeddah", "Dammam"] },
    { country: "Qatar", cities: ["Doha"] },
    { country: "South Africa", cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria"] },
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
    Bhubaneswar: "Bhubaneswar, Odisha, India",
    Thiruvananthapuram: "Thiruvananthapuram, Kerala, India",
    Mysuru: "Mysuru, Karnataka, India",
    Mangaluru: "Mangaluru, Karnataka, India",
    Madurai: "Madurai, Tamil Nadu, India",
    Tiruchirappalli: "Tiruchirappalli, Tamil Nadu, India",
    Visakhapatnam: "Visakhapatnam, Andhra Pradesh, India",
    Vijayawada: "Vijayawada, Andhra Pradesh, India",
    Nagpur: "Nagpur, Maharashtra, India",
    Surat: "Surat, Gujarat, India",
    Lucknow: "Lucknow, Uttar Pradesh, India",
    Patna: "Patna, Bihar, India",
    Ranchi: "Ranchi, Jharkhand, India",
    Guwahati: "Guwahati, Assam, India",
    Bhopal: "Bhopal, Madhya Pradesh, India",
    Raipur: "Raipur, Chhattisgarh, India",
    Mohali: "Mohali, Punjab, India",
    Panaji: "Panaji, Goa, India",
    Kozhikode: "Kozhikode, Kerala, India",
    Thrissur: "Thrissur, Kerala, India",
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