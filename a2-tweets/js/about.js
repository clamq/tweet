function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//Convert the tweet object into tweet objects.
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	//get completed tweets
	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event');
	//get live events tweets
	const liveCount = tweet_array.filter(tweet => tweet.source === 'live_event').length;
	//get achievements tweets
	const achievementCount = tweet_array.filter(tweet => tweet.source === 'achievement').length;
	const miscellaneousCount = tweet_array.filter(tweet => tweet.source === 'miscellaneous').length;
	const writtenCount = completedTweets.filter(tweet => tweet.written).length;
	const dates = tweet_array.map(tweet => tweet.time).filter(date => !isNaN(date.getTime()));
	//function that formats the date 
	const formatDate = date => date.toLocaleDateString('en-US', {
		weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
	});
	const setText = (selector, value) => {
		document.querySelectorAll(selector).forEach(element => {
			element.innerText = value;
		});
	};
	const percentage = (count, total) => total === 0 ? '0.00%' : `${(count / total * 100).toFixed(2)}%`;

	if (dates.length > 0) {
		document.getElementById('firstDate').innerText = formatDate(new Date(Math.min(...dates.map(date => date.getTime()))));
		document.getElementById('lastDate').innerText = formatDate(new Date(Math.max(...dates.map(date => date.getTime()))));
	}

	setText('.completedEvents', completedTweets.length);
	setText('.completedEventsPct', percentage(completedTweets.length, tweet_array.length));
	setText('.liveEvents', liveCount);
	setText('.liveEventsPct', percentage(liveCount, tweet_array.length));
	setText('.achievements', achievementCount);
	setText('.achievementsPct', percentage(achievementCount, tweet_array.length));
	setText('.miscellaneous', miscellaneousCount);
	setText('.miscellaneousPct', percentage(miscellaneousCount, tweet_array.length));
	setText('.written', writtenCount);
	setText('.writtenPct', percentage(writtenCount, completedTweets.length));
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
