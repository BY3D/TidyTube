# The TidyTube Project
## Preface

This project was originally developed to serve as a *healthy* version of YouTube for a university seminar course. That course was on the ethics of artificial intelligence & social media. The course's goal was to incorporate healthy mechanisms and design into a social media platform, YouTube in this case, followed by an analysis on the effectiveness of the implementations. While it was originally going to be a large group project, it ended up being a sole project of mine. I still have much to learn about Javascript, asynchronous algorithms, and CSS. Thus, the development of this project is still ongoing.

I have two additional sub goals for this project. The first is to write it only with standard HTML, CSS, and Javascript so that it is computationally lean and independent from constantly updating frameworks. The second is to analyse the sort of videos YouTube recommends to understand how potentially unhealthy they can be.

> [!NOTE]
> The seminar course was a continuation of the work done by the Professor and a student on analysing YouTube's recommendation system. To learn more about their work: [Analysis of the Impact of Algorithms on Siloing Users: Special Focus on YouTube](https://doi.org/10.1201/9781003261247-6)

## Introduction

TidyTube is an alternative interface for watching YouTube videos. Currently, there are six categories of videos you can watch: Domestic News, International News, Wildlife, Pets, Recipes, and Food Experiences. By default, YouTube will try to search for videos from the United States in American English.

Each category offers 10 videos to watch. Videos are showcased on a dedicated webpage with their relevant information and related videos. Videos watched are saved to the web browser's local database (IndexedDB) where you can examine your viewing history. You can download your viewing history as a CSV or JSON file. The viewing history page also showcases the most popular tags of the saved videos.


## Requirements to make TidyTube Function

Before TidyTube can be used, you must generate an API key for YouTube's search functionality to work. Visit Google's webpage on the YouTube Data API v3 to get an API key, it's currently free to obtain one: [Getting Started with YouTube Data API](https://developers.google.com/youtube/v3/getting-started)

Once you obtained an API key, visit the `javascripts` folder to copy and paste it into the files `YouTubeAPISearch.js` and `YouTubeVideoPlayer.js`.

Look for the variable `const the_key` to associate the API key to, or search for the comment `// YouTube API Key` in the files.

Once done, access `index.html` via a host. This can be on a local host or an online server. YouTube's API requests do not work outside of a server context. To host TidyTube locally, [Jetbrains WebStorm](https://www.jetbrains.com/webstorm/) is a suitable option for that.

## Future Plans

- Add a search box on the homepage to let the user search for any videos
- Let the user change the search language and search region
- Create a dark mode toggle for the website
- Improve the CSS styling of TidyTube
- Internally reorganise the Javascript files to standardise their structures
- Potentially allow the user to log into his or her YouTube channel to save videos watched from TidyTube
- Host TidyTube online
