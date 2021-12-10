# Holo Audience

This repository contains the source code for [(link added later)](), minus a few private things.

## Description

This project is meant to visualize the amount of common viewers between different virtual streamers from [Hololive Production](https://en.hololive.tv/member)'s English branch. As of now, users are able to select streamers' individual livestreams to display viewer overlap within a 14-day interval (7 days before and 7 days after).

---

## Dependencies and Libraries

### Back-end
* Node.js (14.17.5)
    * Axios (0.21.4)
    * EJS (3.1.6)
    * Express (4.17.1)
    * Mongoose (6.0.8)
    * [python-shell](https://www.npmjs.com/package/python-shell) (3.0.0)
* Python (3.9.6)
    * Beautiful Soup (4.10.0)
    * [chat-downloader](https://github.com/xenova/chat-downloader) (0.1.10)
* MongoDB (4.4.10)

### Front-end
* [Chart.js](https://www.chartjs.org/) (3.5.1)
* [Bootstrap](https://getbootstrap.com/) (5.1.3)
* [jQuery](https://jquery.com/) (3.6.0)

## Acknowledgments

Coming from a background more focused on theory and less "practical" development knowledge, this project was mainly created in order for me to learn and get some practice with Node.js, Express.js, and MongoDB (*the "MEN stack"*). Without much experience with front-end development, I tried to keep it relatively simple with plain JavaScript and Bootstrap for a CSS framework. If anyone feels like that I did something poorly or wrong, I would love to hear about it so I can improve on this and future projects.

* [Twitch Community Overlap](https://stats.roki.sh/) by [@snoww](https://github.com/snoww) - The main inspiration this website was created from, with some details excluded, due to the fact that the amount of streamers is much smaller.