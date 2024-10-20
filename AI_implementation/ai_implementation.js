import Groq from "groq-sdk";
import dotenv from "dotenv";
import axios from "axios"; // Axios for making HTTP requests to the Google Geocoding API
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Dummy data for scraped info (normally scraped from news or social media)
const scrapedData = [
    `A suspected phone snatcher was arrested seconds after a phone was stolen thanks to help from members of the public and a nearby police patrol.

The theft is part of a growing trend of phone snatching that impacted an estimated 78,000 people last year, an increase of more than 150% to the previous 12 months. The issue has gained increased interest in both the media and the government in recent months with a crackdown promised by the home office earlier this year.

CCTV footage shows the moment the suspect steals a phone from a woman in London after riding up Ludgate Hill towards St Paul's on an electric bike with another man. The pair are encountered by police officers, with the first evading officers by riding off on the pavement at high speed.`,
    `Phone snatcher arrested after help from passers-by
A man suspected of snatching mobile phones from members of the public has been arrested seconds after a phone was stolen, thanks to members of the public and a nearby police patrol unit.

City of London Police said two men on electric bikes were spotted on CCTV riding up Ludgate Hill towards St Paul’s Cathedral late on Tuesday.

The first suspect was captured stealing a phone from a woman, but managed to evade officers.

The second suspect turned back in the direction of where the phone was stolen. Members of the public, who witnessed the phone snatching, slowed him down allowing officers to arrest him.`,                     
    `NIBONG TEBAL: Police believe they have resolved at least 13 cable theft cases across two districts following the arrest of three men on Sunday.

State police chief Datuk Hamzah Ahmad said that at about 4.25a, officers from the Nibong Tebal police station intercepted a Mitsubishi Triton at Jalan Bukit Panchor.

"The police team approached the vehicle and instructed the driver to stop for a check. During the inspection, we discovered various items believed to be used for cable theft," he said.

The three suspects, aged between 31 and 33, were found to have previous criminal and drug records.`,              
    `MENTAKAB: A woman, believed to be a victim of a snatch theft, was found dead inside a drain at a housing area here on Sunday.

A video of the victim being lifted out of the drain has been circulating on social media, drawing public anger towards the culprits.

The video showed a group of people assisting policemen to lift the victim's body from the drain to the kerb, was posted together with a photo of the deceased lying inside a monsoon drain, with her hair band by the side of the drain.

The woman was found unconscious and bleeding from the forehead inside a drain believed to be located in a housing area in Mentakab.`,        // Simulate coordinates (3.1390° N, 101.6299° E)
];

// Dummy AI function to get coordinates and tags from location text
// (replace this with an API call to AI in real implementation)
export async function getCoordinatesAndTags(scrapedData) {
    try {
        // API call to AI
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a text analyst API capable of analyzing the text crime reports given to you. You will extract two things from the text: 
                    1. The exact location (example: city, district, road) where the crime took place and convert it into latitude and longitude coordinates using Google's Geocoding API.
                    2. Extract the relevant crime tags (e.g., "theft", "robbery", "sexual harassment", etc.) based on the context of the crime mentioned in the text.
                    You respond only in JSON and nothing else (meaning no extra text outside of the JSON object)
                    The JSON schema should include:
                    {
                        "lat": "number (latitude of the location)",
                        "lng": "number (longitude of the location)",
                        "tags": ["array of strings representing crime tags"]
                    }`,
                },
                {
                    role: "user",
                    content: `"Text: ${scrapedData}"`,
                },
            ],
            model: "llama-3.2-90b-vision-preview",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false,
            response_format: { "type": "json_object" }
        });

        // Log the raw response to see what AI returned
        const rawResponse = chatCompletion.choices[0]?.message?.content || "";
        console.log("Raw AI response:", rawResponse);

        // Attempt to parse the response as JSON
        const data = JSON.parse(rawResponse);

        // Log the parsed JSON to ensure it's correct
        console.log("Parsed response:", data);

        // Check if the parsed response contains valid lat, lng, and tags
        if (typeof data.lat === 'number' && typeof data.lng === 'number' && Array.isArray(data.tags)) {
            console.log("Valid data:", data);
            return data; // Return the coordinates and tags
        } else {
            console.error("Invalid format. Ensure lat/lng are numbers and tags is an array.");
            return null;
        }

    } catch (error) {
        // Log any errors (parsing errors or API call errors)
        console.error("Error processing AI response:", error);
        return null; // Return null in case of an error
    }
}

// Haversine formula to calculate distance between two coordinates
function haversineDistance(coord1, coord2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.lat)) *
            Math.cos(toRad(coord2.lat)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

// Function to group coordinates into circleObj based on 5km radius
function createCircleObj(coordsArray) {
    let circleObjs = [];

    for (let i = 0; i < coordsArray.length; i++) {
        let currentCoord = coordsArray[i];
        let found = false;

        for (let j = 0; j < circleObjs.length; j++) {
            let existingCoord = circleObjs[j].coordinates;
            let distance = haversineDistance(currentCoord, existingCoord);

            if (distance <= 5) {
                circleObjs[j].instances += 1;
                // Merge tags without duplicates
                circleObjs[j].tags = Array.from(new Set([...circleObjs[j].tags, ...currentCoord.tags]));
                found = true;
                break;
            }
        }

        if (!found) {
            // Create new circleObj if no nearby coordinate is found within 5km
            circleObjs.push({ coordinates: { lat: currentCoord.lat, lng: currentCoord.lng }, instances: 1, tags: currentCoord.tags });
        }
    }

    return circleObjs;
}

// Main function
async function processCrimeData(scrapedData) {
    let coordinatesArray = [];

    // Get coordinates and tags for each scraped location
    for (let i = 0; i < scrapedData.length; i++) {
        const location = scrapedData[i];
        const coordsAndTags = await getCoordinatesAndTags(location);

        if (coordsAndTags) {
            coordinatesArray.push(coordsAndTags);
        }
    }

    // Create circleObj array
    const circleObjArray = createCircleObj(coordinatesArray);

    return circleObjArray;
}

// Run the process with the dummy scraped data
const result = await processCrimeData(scrapedData);
console.log(result);

