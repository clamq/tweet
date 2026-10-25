let writtenTweets = [];

function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	writtenTweets = runkeeper_tweets
		.map((tweet, index) => ({
			tweet: new Tweet(tweet.text, tweet.created_at),
			number: index + 1
		}))
		.filter(entry => entry.tweet.written);
	updateSearchResults();
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	document.getElementById('textFilter').addEventListener('input', updateSearchResults);
}

function updateSearchResults() {
	const searchText = document.getElementById('textFilter').value;
	const searchTerm = searchText.trim().toLowerCase();
	const matches = searchTerm.length === 0
		? []
		: writtenTweets.filter(entry => entry.tweet.writtenText.toLowerCase().includes(searchTerm));

	document.getElementById('searchCount').innerText = matches.length;
	document.getElementById('searchText').innerText = searchText;
	document.getElementById('tweetTable').innerHTML = matches
		.map(entry => entry.tweet.getHTMLTableRow(entry.number))
		.join('');
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});
