import { getAppID, getAPIKey } from "./config.js";
const client = algoliasearch(getAppID(), getAPIKey());
const index = client.initIndex("all_rounds");

var titleLink = document.getElementById("title-link");
var title = document.getElementById("h1-title");
var inputQuery = document.getElementById("input-search-bar");


var previewsWrapper = document.getElementById("div-results");
var searchBar = document.getElementById("div-search-bar");

var resultsWrapper = document.getElementById("results-wrapper");
var currentResultWrapper = document.getElementById("current-result");

var currentSearchResults;

window.addEventListener("load", function() {
    resultsWrapper.innerHTML = "";
    let pageNum = Math.floor(Math.random() * 50);

    index.search("", {
        page: pageNum,
        hitsPerPage: 10
    }).then(({hits}) => {
        generateResultCards(hits, resultsWrapper);
    });
    resetSearchBar();
});

titleLink.addEventListener("click", function() {
    window.open("index.html", "_self");
});

inputQuery.addEventListener("input", function() {
    if(this.value) {
        index.search(this.value, {
            hitsPerPage: 50
        }).then(({hits}) => {
            resetSearchBar(true);
            for(let i = 0; i < Math.min(hits.length, 3); i++) {
                let result = createResult(hits[i]["title"], hits[i]["link"]);
                result.style["cursor"] = "pointer";
                result.style["text-decoration"] = "underline";
                result.addEventListener("click", function() {
                    console.log("pressed");
                    inputQuery.dispatchEvent(new KeyboardEvent("keypress", {'key':'Enter'}));
                    openResult(hits[i]);
                })
                previewsWrapper.appendChild(result);
            }
            inputQuery.style["padding-bottom"] = "1vh";
            previewsWrapper.lastChild.style["padding-bottom"] = "2vh";
        }).catch(function() {
            console.log("no results");
            resetSearchBar(true);
        });
    } else {
        resetSearchBar(true);
    }
}, false);

inputQuery.addEventListener("keypress", function(e) {
    if(e.key == "Enter") {
        resultsWrapper.innerHTML = "";
        sessionStorage.query = inputQuery.value;
        //title.style["font-size"] = "5em";

        index.search(inputQuery.value, {
            hitsPerPage: 10
        }).then(({hits}) => {
            generateResultCards(hits, resultsWrapper);
        });
        resetSearchBar();
    }
});

function generateResultCards(hits, wrapper) {
    let locations = ["left", "right"];
    for(let i = 0; i < Math.min(hits.length, 10); i++) {
        let result = createResultCard(hits[i], locations[i % 2]);
        result.addEventListener("click", function() {openResult(hits[i])});
        wrapper.appendChild(result);
    }
}

function openResult(hit) {
    console.log("results");
    currentResultWrapper.innerHTML = "";

    let result = createResultCard(hit, "", true);
    resultsWrapper.style["padding-top"] = "0vh";
    result.style["margin-bottom"] = "2%";
    currentResultWrapper.appendChild(result);
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function resetSearchBar(currentResult=false) {
    previewsWrapper.innerHTML = "";
    if(!currentResult) {
        currentResultWrapper.innerHTML = "";
    }
    resultsWrapper.style["padding-top"] = "5vh";
    inputQuery.style["padding-bottom"] = "2vh";
}

/**
 * Creates h1 element with given text.
 * @param {string} text Text in h1
 * @returns HTML h1 element with given text embedded
 */
function createResult(text, href, embed=false) {
	var result = document.createElement("h1");
    var h1A = document.createElement("a");
	var h1Text = document.createTextNode(text);

    h1A.setAttribute("href", "https://www" + href.substring(10));

    h1A.appendChild(h1Text);
    h1A.className = "body-text";
    h1A.setAttribute("target", "_blank");

    if(embed) {
        h1A.appendChild(h1Text);
        result.appendChild(h1A);
    } else {
        result.appendChild(h1Text);
    }
    result.className = "search-bar-text";
    result.style["padding-top"] = "2vh";
    result.style["padding-bottom"] = "2vh";
	return result;
}

function createResultCard(hit, location="", embed=false) {
    let resultTitle = createResult(hit["title"], hit["link"], embed);
    resultTitle.classList.add("card-title");
    resultTitle.style["padding-bottom"] = "0vh";

    let resultCard = document.createElement("div");
    if(location != "") {
        resultCard.classList.add("card", location);
    } else {
        resultCard.classList.add("card");
    }
    resultCard.appendChild(resultTitle);

    if(embed) {
        let media = document.createElement("audio");
        media.setAttribute("src", hit["link"]);
        media.setAttribute("controls", "controls");
        media.classList.add("media");
        resultCard.appendChild(media);
        media.addEventListener("error", function() {
            resultCard.removeChild(media);
        })
    }

    for(const [key, value] of Object.entries(hit)) {
        if(key != "title" && key != "link" && key != "objectID" && typeof value == "string") {
            let resultPiece = document.createElement("p");
            resultPiece.appendChild(document.createTextNode(capFirstLetter(key) + ": " + value));
            resultPiece.classList.add("card-p", "body-text");
            resultCard.appendChild(resultPiece);
        }
    }

    let tags = document.createElement("p");
    tags.appendChild(document.createTextNode("Tags: " + hit["_tags"].join(', ')));
    tags.classList.add("card-p", "body-text");
    resultCard.appendChild(tags);

    return resultCard;
}

function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

inputQuery.addEventListener("focus", function () {
    searchBar.style["box-shadow"] = "rgba(0, 0, 0, 0.24) 1px 1px 8px";
});

inputQuery.addEventListener("focusout", function () {
    searchBar.style["box-shadow"] = "rgba(99, 99, 99, 0.2) 0px 0px 8px 0px";
});

function checkValidURL(link) {
    function checkForError() {
        var video = document.createElement("audio");
        video.setAttribute("src", link);
        video.addEventListener("error", function() {
            return video.error.message;
        });
    }
    /*console.log(await checkForError());
    if(await checkForError()) {
        return "https://www" + link.substring(10);
    } else {
        return link;
    }*/
    return checkForError();
}

//checkValidURL("https://dl.dropbox.com/s/1cni12e0tt35zfl/Texas%20Two-Step%20Swing%202%20Semifinals%20-%20McKendree%20DP%20vs%20William%20Jewell%20HU.m4a?dl=0")
//console.log(checkValidURL("https://dl.dropbox.com/s/1cni12e0tt35zfl/Texas%20Two-Step%20Swing%202%20Semifinals%20-%20McKendree%20DP%20vs%20William%20Jewell%20HU.m4a?dl=0"));