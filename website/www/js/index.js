// import Algolia app-id and api-key and initiliaze index with all records
import { getAppID, getAPIKey } from "./config.js";
const client = algoliasearch(getAppID(), getAPIKey());
const index = client.initIndex("all_rounds");


// initialize document elements
var title = document.getElementById("h1-title");
var titleLink = document.getElementById("title-link");
var inputQuery = document.getElementById("input-search-bar");

var previewsWrapper = document.getElementById("div-results");
var searchBar = document.getElementById("div-search-bar");

var resultsWrapper = document.getElementById("results-wrapper");
var currentResultWrapper = document.getElementById("current-result");

var addButton = document.getElementById("add-button");

var devInfo = document.getElementById("dev-info");

var page = 1;

// On page load
window.addEventListener("load", onPageLoad);

// To reload page on title click
titleLink.addEventListener("click", reload);

// Track user input in search bar for previews
inputQuery.addEventListener("input", function() {
    if(this.value) {
        searchDisplayPreviews(this.value);
    } else {
        resetSearchBar(true);
    }
}, false);

addButton.addEventListener("click", function() {
    openAddCard();
});

// Generate and display result cards when pressed Enter in search bar
inputQuery.addEventListener("keypress", function(e) {
    if(e.key == "Enter") {
        page = 1;
        displayGenResults();
    }
});

// Box shadow on focus for search bar
inputQuery.addEventListener("focus", function () {
    searchBar.style["box-shadow"] = "rgba(0, 0, 0, 0.24) 1px 1px 8px";
});

inputQuery.addEventListener("focusout", function () {
    searchBar.style["box-shadow"] = "rgba(99, 99, 99, 0.2) 0px 0px 8px 0px";
});

$(window).scroll(function() {
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
        displayGenResults(undefined, page);
        page++;
    }
})

/**
 * Resets results, generates random 10 cards and displays results
 */
function onPageLoad() {
    resultsWrapper.innerHTML = "";

    index.search("", {
    }).then(({nbHits}) => {
        let pageNum = Math.floor(Math.random() * (nbHits/10));
        index.search("", {
            page: pageNum,
            hitsPerPage: 10,
        }).then(({hits}) => {
            generateResultCards(hits, resultsWrapper);
        });
    });
    
    resetSearchBar();

}

/**
 * Reloads page to original state
 */
function reload() {
    window.open("index.html", "_self");
    page = 1;
}

/**
 * Creates a preview element using search query hit. When clicked, element 
 * displays all search query results and opens the specific requested result.
 * 
 * @param {Object} hit Hit from search query
 * @returns A preview element with title and link
 */
function generatePreview(hit) {
    let result = createPreview(hit["title"], hit["link"]);
    result.style["cursor"] = "pointer";
    result.style["text-decoration"] = "underline";

    // when clicked, open all results for this hit, open specific result card
    result.addEventListener("click", function() {
        displayGenResults();
        openResult(hit);
    });

    // gray mouseover styling
    result.addEventListener("mouseover", function() {
        result.style["background-color"] = "#eeeeee";
    });
    result.addEventListener("mouseout", function() {
        result.style["background-color"] = "#f9f7f7";
    });

    return result;
}

/**
 * Searches index for value and displays 3 preview searches below search bar.
 * 
 * @param {string} value Current search query
 */
function searchDisplayPreviews(value) {
    index.search(value, {
        // TODO: pagination
        hitsPerPage: 50
    }).then(({hits}) => {
        resetSearchBar(true);

        for(let i = 0; i < Math.min(hits.length, 3); i++) {
            let result = generatePreview(hits[i]);
            previewsWrapper.appendChild(result);
        }

        // Padding changes to normalize spacing difference
        inputQuery.style["padding-bottom"] = "1vh";
        previewsWrapper.lastChild.style["padding-bottom"] = "2vh";
    }).catch(function() {
        resetSearchBar(true);
    });
}

/**
 * Resets results and generates new results based on query
 * 
 * @param {string} value Current search query
 */
function displayGenResults(value=inputQuery.value, page=0) {
    if(!page) {
        resultsWrapper.innerHTML = "";
    }
    index.search(value, {
        hitsPerPage: 10,
        page: page
    }).then(({hits}) => {
        generateResultCards(hits, resultsWrapper);
    });
    resetSearchBar();
}

/**
 * Generates result cards and adds them to given wrapper based on query
 * 
 * @param {Object} hits Hits from search query 
 * @param {Object} wrapper Wrapper to add result cards to
 */
function generateResultCards(hits, wrapper) {
    let locations = ["left", "right"];
    for(let i = 0; i < Math.min(hits.length, 10); i++) {
        let result = createResultCard(hits[i], locations[i % 2]);
        result.addEventListener("click", function() {openResult(hits[i])});
        wrapper.appendChild(result);
    }
}

/**
 * Resets current result and replaces with given hit
 * @param {string} hit Hit from search query
 */
function openResult(hit) {
    currentResultWrapper.innerHTML = "";

    let result = createResultCard(hit, "", true);
    resultsWrapper.style["padding-top"] = "0vh";
    result.style["margin-bottom"] = "2%";
    currentResultWrapper.appendChild(result);
    currentResultWrapper.scrollIntoView({behavior: "smooth"});
}

function openAddCard() {
    function allFilled() {
        for(let i = 0; i < addCard.children.length; i++) {
            if(addCard.children[i].nodeName == "DIV" && 
                addCard.children[i].lastChild.value == '') {
                return false;
            }
        }
        return true;
    }
    currentResultWrapper.innerHTML = "";

    let addTitle = createPreview("Add a Round Recording", "");
    addTitle.classList.add("card-title");
    addTitle.style["padding-bottom"] = "0vh";

    let addCard = document.createElement("div");
    addCard.classList.add("card");
    addCard.appendChild(addTitle);
    currentResultWrapper.appendChild(addCard);

    let addLabels = {
        "Round title": "Finals - Cal MR vs Rice AL",
        "Link": "dropbox link, youtube link, etc.",
        "Resolution": "The USFG should.",
        "Aff": "topical (war, econ)",
        "Neg": "2-off (framework-t, orientalism)",
        "Tags": "#topicality, #mlm",
        "Decision": "3-0 Aff",
        "Year": "2020-21",
        "Tournament": "NPDA",
    };

    let roundInfo = {
        "title": "",
        "link": "",
        "resolution": "",
        "aff": "",
        "neg": "",
        "_tags": [],
        "decision": "",
        "year": "",
        "tournament": "",
    }

    for(const [key, value] of Object.entries(addLabels)) {
        let labelDiv = document.createElement("div");
        labelDiv.classList.add("add-div");

        let label = document.createElement("p");
        label.appendChild(document.createTextNode(key + ":"));
        label.classList.add("card-p", "body-text", "add-label");

        let input = document.createElement("input");
        input.classList.add("search-bar", "body-text", "add-input");
        input.addEventListener("keyup", function() {
            if(allFilled()) {
                addSubmit.classList = ["button"];
                addSubmit.classList.add("body-text");
                addSubmit.addEventListener("click", addSubmitClick);
            } else {
                addSubmit.classList = ["button-off"];
                addSubmit.classList.add("body-text");
                addSubmit.removeEventListener("click", addSubmitClick);
            }
        });
        input.placeholder = value;

        labelDiv.appendChild(label);
        labelDiv.appendChild(input);
        addCard.appendChild(labelDiv);
    }

    addCard.lastChild.lastChild.style["margin-bottom"] = "0em";

    let addSubmit = document.createElement("p");
    addSubmit.appendChild(document.createTextNode("add round"));
    addSubmit.classList.add("button-off");
    addSubmit.classList.add("body-text");
    addSubmit.id = "add-submit";

    let roundIndex = 0;

    addCard.appendChild(addSubmit);

    currentResultWrapper.scrollIntoView({behavior: "smooth"});

    function addSubmitClick() {
        for(let i = 0; i < addCard.children.length; i++) {
            if(addCard.children[i].nodeName == "DIV") {
                let currentKey = Object.keys(roundInfo)[roundIndex];
                let currentValue = addCard.children[i].lastChild.value;
                if(Array.isArray(roundInfo[currentKey])) {
                    roundInfo[currentKey] = currentValue.split(',').map(s => s.trim());
                } else if(currentKey == "link") {
                    roundInfo[currentKey] = standardizeLink(currentValue);
                } else {
                    roundInfo[currentKey] = currentValue;
                }
                roundIndex++;
            }
        }
        index.saveObject(roundInfo, {autoGenerateObjectIDIfNotExist:true});
        openResult(roundInfo);
    }
}

function standardizeLink(link) {
    // Dropbox
    let dropboxIdx = link.indexOf("dropbox");
    if(link.includes("dropbox")) {
        console.log("here");
        return "https://dl." + link.substring(dropboxIdx);
    }
    return link;
}



/**
 * Resets search bar to 0 results
 * 
 * @param {boolean} keepCurrentResult Whether to keep current result visible
 */
function resetSearchBar(keepCurrentResult=false) {
    previewsWrapper.innerHTML = "";
    if(!keepCurrentResult) {
        currentResultWrapper.innerHTML = "";
    }
    resultsWrapper.style["padding-top"] = "5vh";
    inputQuery.style["padding-bottom"] = "2vh";
}

/**
 * Creates preview (i.e. title element w/ or w/o link)
 * 
 * @param {string} text Text for preview
 * @param {string} href Link for preview
 * @param {boolean} embed Whether to add a link to the title
 * @returns h1 element with text and potentially link
 */
function createPreview(text, href, embed=false) {
	var result = document.createElement("h1");
    var h1A = document.createElement("a");
	var h1Text = document.createTextNode(text);

    h1A.setAttribute("href", "https://www" + href.substring(href.indexOf(".")));

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

/**
 * Creates description and adds it to an existing result card.
 * 
 * @param {Object} card resultCard to add description pieces to
 * @param {string} key Key from description
 * @param {string} value Value of description
 */
function createResultDescription(card, key, value) {
    if(key != "title" && key != "link" && key != "_tags" && key != "objectID" && typeof value == "string") {
        let resultPiece = document.createElement("p");
        resultPiece.appendChild(document.createTextNode(capFirstLetter(key) + ": " + value));
        resultPiece.classList.add("card-p", "body-text");
        card.appendChild(resultPiece);
    }
}

/**
 * Create a full result card with location and/or embedded audio
 * @param {string} hit Hit from search query
 * @param {string} location Class (left/right) to add to div
 * @param {boolean} embed Whether to embed an audio portion
 * @returns Result card
 */
function createResultCard(hit, location="", embed=false) {
    let resultTitle = createPreview(hit["title"], hit["link"], embed);
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
        let media = null;
        if(hit["link"].includes("dropbox")) {
            media = document.createElement("audio");
            media.setAttribute("src", hit["link"]);
            media.setAttribute("controls", "controls");
            media.classList.add("media");
        } else if(ytVidId(hit["link"])) {
            media = document.createElement("iframe");
            media.src = "https://www.youtube.com/embed/" + ytVidId(hit["link"]);
        }
        resultCard.appendChild(media);
        media.addEventListener("error", function() {
            resultCard.removeChild(media);
        });
    }

    for(const [key, value] of Object.entries(hit)) {
        createResultDescription(resultCard, key, value);
    }

    let tags = document.createElement("p");
    if(hit["_tags"]) {
        tags.appendChild(document.createTextNode("Tags: " + hit["_tags"].join(', ')));
    } else {
        tags.appendChild(document.createTextNode("Tags: "));
    }
    tags.classList.add("card-p", "body-text");
    resultCard.appendChild(tags);

    return resultCard;
}

function ytVidId(url) {
  var p = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return (url.match(p)) ? RegExp.$1 : false;
}

/**
 * Capitalizes first letter of given string
 * @param {string} string String to capitalize
 * @returns Capitalized string
 */
function capFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}