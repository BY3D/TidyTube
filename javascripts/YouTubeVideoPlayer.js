
function getVideoID() {
    const current_url = window.location.href;
    return current_url.split("=")[1];
}

function makeIFrame() {
    const videoObject = document.querySelector("#current_video");
    const videoID = getVideoID();
    const videoFrame = document.createElement("iframe");
    videoFrame.width = 800;
    videoFrame.height = 450;
    videoFrame.src = "https://www.youtube-nocookie.com/embed/" + videoID;
    videoFrame.title = "YouTube video player";
    videoFrame.allow = "clipboard-write; encrypted-media; web-share"
    videoFrame.allowFullscreen = true;
    videoObject.appendChild(videoFrame);
}

function getVideoInfo(rawVideoInfo) {
    // Create the HTML elements
    const videoObject = document.querySelector("#current_video");
    const videoDetails = document.createElement("div");
    const videoTitle = document.createElement("h3");
    const videoChannel = document.createElement("h4");
    const videoDate = document.createElement("p");
    const videoLength = document.createElement("p");
    const videoViews = document.createElement("p");
    const videoDescription = document.createElement("p");
    // Parse the YouTube API query
    let videoInfo = JSON.parse(JSON.stringify(rawVideoInfo));
    videoInfo = JSON.parse(videoInfo["body"]);
    videoInfo = videoInfo["items"][0];

    console.log(videoInfo); // To understand how the API request looks like
    addVideoToDB(videoInfo);

    // Assign the API query to the HTML elements
    videoTitle.textContent = videoInfo["snippet"]["title"]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    document.title = videoTitle.textContent;
    videoDate.textContent = "Published on " + videoInfo["snippet"]["publishedAt"].split("T")[0];
    videoDescription.textContent = videoInfo["snippet"]["description"];
    videoChannel.textContent = "By " + videoInfo["snippet"]["channelTitle"];
    const videoTags = videoInfo["snippet"]["tags"];
    videoLength.textContent = videoInfo["contentDetails"]["duration"];
    videoViews.textContent = videoInfo["statistics"]["viewCount"] + " views";
    //const videoLikes = videoInfo["statistics"]["likeCount"];
    // Display the video's data
    videoObject.appendChild(videoTitle);
    videoObject.appendChild(videoChannel);
    videoObject.appendChild(videoDate);
    videoObject.appendChild(videoViews);
    videoObject.appendChild(videoDescription);
}

// Add the current video to the database of watched videos
// Open the database. If it doesn't exist, then create it.
// Then create a transaction. Add the video.
// Close the connection to the database when transaction is complete.
function addVideoToDB(videoInfo) {
    let db;
    const DBname = "Watched_Videos_DB";
    const openRequest = indexedDB.open(DBname);
    // If the database cannot be opened
    openRequest.onerror = (event) => {
        console.error("Error opening database -> " + event.target.error?.message);
    };
    // If the database does not exist
    openRequest.onupgradeneeded = (event) => {
        db = event.target.result;
        // To keep videos sorted by latest watched, they will have a unique position value (1, 2, 3, ...)
        if (!db.objectStoreNames.contains("Videos_Viewed")) {
            let objStore = db.createObjectStore("Videos_Viewed", {autoIncrement: true});
            // Create an index to find videos based on their ID
            objStore.createIndex("id", "id", {unique: true});
        }
    };
    // When the database exists and has been opened
    openRequest.onsuccess = (event) => {
        db = event.target.result;
        let tn = db.transaction("Videos_Viewed", "readwrite");
        let videos = tn.objectStore("Videos_Viewed");
        let req = videos.add(videoInfo);
        req.onsuccess = function() { // (4)
            console.log("Viewed video successfully added to database", req.result);
        };
        req.onerror = function() {
            console.log("Failure adding viewed video to database", req.error);
        };
        // I think I should add a tn.oncomplete()
        db.close();
    };
}

// YouTube API Key
const the_key = "PUT KEY HERE FIRST";

function loadYouTubeAPI() {
    gapi.client.setApiKey(the_key);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function() { console.log("Google's API client has loaded"); },
            function(err) { console.error("Error loading Google's API client", err); });
}

// Make sure the client is loaded before calling this method.
function getCurrentVideoInfo() {
    const videoID = getVideoID();
    return gapi.client.youtube.videos.list({
        "part": [
            "snippet,contentDetails,statistics"
        ],
        "id": [
            videoID
        ]
    })
        .then(function(response) {
                // Handle the results here (response.result has the parsed body).
                return getVideoInfo(response);
            },
            function(err) { console.error("Execution error", err); });
}

function getRelatedVideos() {
    return gapi.client.youtube.search.list({
        "part": [
            "snippet"
        ],
        "maxResults": 5,
        "q": sessionStorage.getItem("search_query") + " -\"" + getVideoID() + "\"",
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

gapi.load("client");
window.onload = (event) => {
    makeIFrame();
    loadYouTubeAPI().then(getCurrentVideoInfo).then(getRelatedVideos);
    console.log("page is fully loaded");
};
