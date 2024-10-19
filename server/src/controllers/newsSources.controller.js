import env from "../utils/env.js";
import Groq from "groq-sdk";

const URL = "https://newsapi.org/v2/everything"
const groq = new Groq({ apiKey: env("GROQ_API_KEY") });

export async function GetNewsSource(req, res, next){

    const { q } = req.query

    const todayDate = new Date()
    const lastMonth = (new Date())
    lastMonth.setMonth(todayDate.getMonth() - 1)

    const todayDateISO = todayDate.toISOString().split("T")[0]
    const lastMonthISO = lastMonth.toISOString().split("T")[0]

    const query = `?q=(${q})%20AND%20(theft%20OR%20roberry%20OR%20assault%20OR%20burglary%20OR%20violence%20OR%drugs)&from=${(todayDateISO)}&to=${(lastMonthISO)}&language=en&pageSize=50`;

    // Get all states / cities

// Add street name to the filter so that we can guarantee that the correct article is given

    let response = await FetchRequest(URL + query)

    let desc = []

    response.articles.forEach((eachSource) => {
        desc.push(eachSource.content)
    })


    // let filteredPosts = await FilterPosts(desc.toString())
    // console.log("FILTERED =============")
    // console.log(filteredPosts)

    // let coordinatesList = await processCrimeData(filteredPosts.posts)
    // console.log("FINAL OUTPUT")
    // console.log(coordinatesList)

    let coordinatesList = [
        {
          coordinates: { lat: 3.13889, lng: 101.6169 },
          instances: 2,
          tags: [ 'drug seizure', 'possession of fake guns' ]
        },
        {
          coordinates: { lat: 3.1087, lng: 101.6648 },
          instances: 1,
          tags: [ 'drug abuse', 'police misconduct' ]
        },
        {
          coordinates: { lat: 1.4923, lng: 103.7639 },
          instances: 1,
          tags: [ 'drug trafficking', 'arrest' ]
        }
      ]

    return res.json(coordinatesList)
}


async function FetchRequest(url){
    return fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          "X-Api-Key": env("NEWS")
        }
      })
        .then(response => {
          if (!response.ok) {
            console.log(response)
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
}

async function FilterPosts(posts){
    const chatCompletion = await groq.chat.completions.create({
    messages: [
        {
            role: "system",
            content: `
            You are a text analyst API capable of filtering out posts that are not crime related. Your job is to filter out the posts into an array of posts that are crime related in the given JSON schema. DO NOT GIVE ANY OTHER TEXT OR OUTPUT APART FROM THE GIVEN JSON SCHEMA: 
        {
            posts: [array of crime related posts]    
        }`,
        },
        {
            role: "user",
            content: `Posts: ${posts}`,
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
    // console.log("Raw AI response:", rawResponse);

    // Attempt to parse the response as JSON
    const coordinates = JSON.parse(rawResponse);
    return coordinates
}


async function PostAnalysis(scrapedData){
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
        const coordsAndTags = await PostAnalysis(location);

        if (coordsAndTags) {
            coordinatesArray.push(coordsAndTags);
        }
    }

    // Create circleObj array
    const circleObjArray = createCircleObj(coordinatesArray);

    return circleObjArray;
}