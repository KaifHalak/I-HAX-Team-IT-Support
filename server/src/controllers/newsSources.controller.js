import env from "../utils/env.js";
import Groq from "groq-sdk";

const URL = "https://newsapi.org/v2/everything"

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


    let filteredPosts = await AI(desc.toString())
    console.log("FILTERED =============")
    console.log(filteredPosts)

    return res.send("Success")
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

async function AI(posts){
    const groq = new Groq({ apiKey: env("GROQ_API_KEY") });

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