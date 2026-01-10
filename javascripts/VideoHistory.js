
function loadVideos(Database) {
    let tn = Database.transaction("Videos_Viewed", "readonly");
    let videos = tn.objectStore("Videos_Viewed");
    // Check if database has no videos
    let countReq = videos.count();
    countReq.onsuccess = () => {
        if (countReq.result < 1) {
            const emptyList = document.querySelector("ul")
            const tempText = document.createElement("p");
            tempText.innerText = "No videos have been watched yet";
            emptyList.appendChild(tempText);
        } else { // If database has videos, list them
            listVideos(videos);
        }
    };
    countReq.onerror = () => {
        const emptyList = document.querySelector("ul")
        const tempText = document.createElement("p");
        tempText.innerText = "The viewing history could not be loaded. Try again later";
        emptyList.appendChild(tempText);
    }
}

function listVideos(videos) {
    // List the videos in the database
    let cursorRequest = videos.openCursor();
    cursorRequest.onsuccess = (event) => {
        let cursor = event.target.result;
        if (cursor) {
            // Create the HTML element
            const list = document.querySelector("ul");
            const listedVideo = document.createElement("li");
            const videoImage = document.createElement("img");
            const videoTextInfo = document.createElement("div");
            const videoTitle = document.createElement("p");
            const videoChannel = document.createElement("p");
            //const videoViews = document.createElement("p");
            const deleteVideo = document.createElement("button");
            const videoID = cursor.value["id"];
            listedVideo.id = videoID;
            deleteVideo.className = "deleteButton";
            videoTextInfo.className = "videoTextInfo";
            videoTitle.className = "videoTitle";
            videoChannel.className = "videoChannel";
            // Populate the element with the data
            videoImage.src = cursor.value["snippet"]["thumbnails"]["default"]["url"];
            videoTitle.innerText = cursor.value["snippet"]["title"];
            videoChannel.innerText = cursor.value["snippet"]["channelTitle"];
            //videoViews.innerText = cursor.value["statistics"]["viewCount"] + " views";
            deleteVideo.innerText = "X";
            deleteVideo.onclick = () => removeVideo(videoID);
            // Display the element
            videoTextInfo.appendChild(videoTitle);
            videoTextInfo.appendChild(videoChannel);
            //videoTextInfo.appendChild(videoViews);
            listedVideo.appendChild(videoImage);
            listedVideo.appendChild(videoTextInfo);
            //listedVideo.appendChild(videoTitle);
            //listedVideo.appendChild(videoChannel);
            //listedVideo.appendChild(videoViews);
            listedVideo.appendChild(deleteVideo);
            list.appendChild(listedVideo);
            // console.log(cursor.value);
            cursor.continue(); // Move cursor to next object until it's null
        } else {
            console.log("All videos retrieved");
        }
    };
}

// Delete the current video when X is pressed
function removeVideo(videoID) {
    //console.log("Print video ID: " + videoID); // Print video ID
    let db;
    const DBname = "Watched_Videos_DB";
    const openRequest = indexedDB.open(DBname);
    openRequest.onsuccess = (event) => {
        db = event.target.result;
        let tn = db.transaction("Videos_Viewed", "readwrite");
        let videos = tn.objectStore("Videos_Viewed");
        let index = videos.index("id");
        const deleteRequest = index.getKey(videoID);
        deleteRequest.onsuccess = (event) => {
            //console.log(event.target.result);
            videos.delete(event.target.result).onsuccess = () => {
                let videoElement = document.getElementById(videoID);
                videoElement.remove(); // Delete the element from the webpage as well
            };

        };
    };
}

/*
 * Collect the tags of watched videos into a map
 * The map's key is the tag
 * The map's value is the number of times a tag is found
 * The goal is to find the most popular tags from the video history
 * Not all videos have tags though
 * The function returns an array of the most popular tags
 */
function collectTags(Database) {
    let tn = Database.transaction("Videos_Viewed", "readonly");
    let videos = tn.objectStore("Videos_Viewed");
    let tagMap = new Map();
    let tagArray = [];
    let dataRequest = videos.getAll();
    dataRequest.onsuccess = (event) => {
        let videoCollection = event.target.result;
        for (let video = 0; video < videoCollection.length; video++) {
            let tags = videoCollection[video]["snippet"]["tags"];
            if (typeof tags !== "undefined") {
                for (let tag of tags) {
                    let count = tagMap.get(tag) || 0; // get() returns false if tag isn't found
                    tagMap.set(tag, count + 1);
                }
            }
        }
    }
    tn.oncomplete = () => {
        tagArray = sortTags(tagMap);
        displayPopularTags(tagArray);
    }
    return tagArray;
}

/*
 * Sort tag map by value
 * Input: Map of (tag, tag count)
 * Output: Array of tags, sorted from the most common tag to the least common tag
 * For more info on sorting: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
function sortTags(tagMap) {
    if (tagMap.size < 1) return "";
    let mapAsArray = Array.from(tagMap);
    mapAsArray.sort((tag1, tag2) => (tag2[1] - tag1[1]));
    let tagArray = [];
    for (let tag of mapAsArray) {
        tagArray.push(tag[0]);
    }
    return tagArray;
}

/*
 * Display the sorted tags in order on the history webpage
 * Input: Sorted tags array
 * Output: Tags as HTML elements on the webpage
 */
function displayPopularTags(tags) {
    if (tags.length < 1) return;
    const MAX_TAGS = 9;
    let counter = 1;
    const tagArea = document.getElementById("ShowTagsHere");
    const tagAreaTitle = document.createElement("h2");
    tagAreaTitle.innerText = "Most Popular Tags";
    tagArea.appendChild(tagAreaTitle);
    for (let tag of tags) {
        if (counter > MAX_TAGS) break;
        let tagElement = document.createElement("p");
        tagElement.innerText = tag;
        tagArea.appendChild(tagElement);
        counter += 1;
    }
}

// Export the user's video history as a JSON file
function exportHistoryToJSON(Database) {
    let tn = Database.transaction("Videos_Viewed", "readonly");
    let videos = tn.objectStore("Videos_Viewed");
    let dataRequest = videos.getAll();
    let textFile = "";
    dataRequest.onsuccess = (event) => {
        let videoCollection = event.target.result;
        textFile += "[";
        for (let video = 0; video < videoCollection.length; video++) {
            //console.log(videoCollection[video]);
            //console.log(JSON.stringify(videoCollection[video]));
            textFile += JSON.stringify(videoCollection[video]);
            if (video < videoCollection.length - 1) textFile += ",";
            textFile += "\n";

        }
        textFile += "]";
    }
    let blobFile;
    tn.oncomplete = () => {
        const LinkToJSON = document.querySelector("#LinkToJSON");
        //console.log(textFile);
        blobFile = new Blob([textFile], { type: "application/json" });
        LinkToJSON.href = URL.createObjectURL(blobFile);
    }
    return textFile;
}

// Export the user's video history as a CSV file
function exportHistoryToCSV(Database) {
    let textFile = "video_id,video_title,video_description,video_thumbnail,date_published,channel_id," +
        "channel_title,video_tags,video_duration,video_views,video_language\n";
    let tn = Database.transaction("Videos_Viewed", "readonly");
    let videos = tn.objectStore("Videos_Viewed");
    let dataRequest = videos.getAll();
    dataRequest.onsuccess = (event) => {
        let videoCollection = event.target.result;
        for (let video = 0; video < videoCollection.length; video++) {
            let currentVideo = videoCollection[video];
            textFile += JSON.stringify(currentVideo["id"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["title"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["description"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["thumbnails"]["standard"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["publishedAt"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["channelId"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["channelTitle"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["tags"]) + ",";
            textFile += JSON.stringify(currentVideo["snippet"]["duration"]) + ","; // It's formatted as PT##M##S which is minutes seconds
            textFile += JSON.stringify(currentVideo["statistics"]["viewCount"]);
            textFile += JSON.stringify(currentVideo["snippet"]["defaultLanguage"]) + ",";
            textFile += "\n";

        }
    }
    let blobFile;
    tn.oncomplete = () => {
        const LinkToCSV = document.querySelector("#LinkToCSV");
        //console.log(textFile);
        blobFile = new Blob([textFile], { type: "text/csv" });
        LinkToCSV.href = URL.createObjectURL(blobFile);
    }
    return textFile;
}

function showExportOptions() {
    let options = document.getElementById("Export_Options");
    //if (options.)
    if (options.classList.contains("hidden")) {
        options.classList.toggle("show");
    } else {
        options.classList.toggle("hidden");
    }
}

window.onload = () => {
    // Open the database
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
            let objStore = db.createObjectStore("Videos_Viewed", { autoIncrement: true });
            // Create an index to find videos based on their ID
            objStore.createIndex("id", "id", {unique: true});
        }
    };
    // When the database exists and has been opened
    openRequest.onsuccess = (event) => {
        db = event.target.result;
        loadVideos(db);
        collectTags(db);
        exportHistoryToCSV(db);
        exportHistoryToJSON(db);
    };
    document.getElementById("Export_Options").addEventListener("click", showExportOptions);
}