// YouTube API Key
const the_key = "PUT KEY HERE FIRST";

// Get current search topic
function getQuery() {
    const current_url = window.location.href;
    let query = current_url.split("?")[1];
    query = query.split("=")[1];
    query = query.replaceAll(/_/g, " ");
    // Save search topic into session storage
    sessionStorage.setItem("search_query", query);
    return query;
}

// Loads the Google API client into the website
function loadClient() {
    gapi.client.setApiKey(the_key);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(function() { console.log("Google's API client has loaded"); },
    function(err) { console.error("Error loading in Google's API", err); });
}

/*
 * Returns the JSON info of a YouTube search result
 * Parameters:
 * 1) maxResults = must be greater than 0
 * 2) q = the string to search for
 * Make sure the client is loaded before calling this method
 */
function execute() {
    let query_string = getQuery();
    return gapi.client.youtube.search.list({
    "part": [
    "snippet"
    ],
    "maxResults": 10,
    "q": query_string,
    "type": [
        "video"
    ]
})
    .then(function(response) {
            // Handle the results here (response.result has the parsed body).;
            // console.log("Response", response);
            makeVideo(response);
},
    function(err) { console.error("Execute error", err); });
}

// Go through the JSON info to create video search result previews
function makeVideo(rawSearchResults) {
    // Create an HTML element where each video result will be displayed in
    const videoObject = document.querySelector("section");
    const searchResults = JSON.parse(JSON.stringify(rawSearchResults));
    const videos = searchResults["result"]["items"];
    for (const video of videos) {
        // console.log("info", video["snippet"]);
        const searchedVideo = document.createElement("div");
        const videoLink = document.createElement("a");
        // const videoInfo = document.createElement("div");
        const videoTitle = document.createElement("h3");
        const videoChannel = document.createElement("h4");
        const videoDate = document.createElement("p");
        const videoImage = document.createElement("img");
        // const videoDesc = document.createElement("p");
        searchedVideo.classList.add("video_preview"); // Give a class name to each video object
        videoLink.classList.add("video_link");
        // videoInfo.classList.add("preview_text");
        videoTitle.classList.add("preview_text");
        videoChannel.classList.add("preview_text");
        videoDate.classList.add("preview_text");

        videoLink.href = "video_player.html?videoId=" + video["id"]["videoId"];
        videoTitle.textContent = video["snippet"]["title"]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
        // YouTube sends special characters as their HTML counterparts
        videoChannel.textContent = video["snippet"]["channelTitle"];
        videoDate.textContent = video["snippet"]["publishedAt"].split("T")[0];
        videoImage.src = video["snippet"]["thumbnails"]["medium"]["url"];
        // videoDesc.textContent = video["snippet"]["description"];
        searchedVideo.appendChild(videoImage);
        searchedVideo.appendChild(videoTitle);
        searchedVideo.appendChild(videoChannel);
        searchedVideo.appendChild(videoDate);
        // searchedVideo.appendChild(videoDesc);
        videoLink.appendChild(searchedVideo);
        videoObject.appendChild(videoLink);
    }
    // console.log(videos["results"]);
    // console.log(JSON.parse(JSON.stringify(videos)));
}

// Save each created video into IndexedDB. Then show these saved videos as recommended on video player page
//

gapi.load("client");
window.onload = (event) => {
    loadClient().then(execute);
    console.log("page has loaded");
};


