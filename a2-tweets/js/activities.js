function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	const completedTweets = tweet_array.filter(tweet => tweet.source === 'completed_event' && tweet.activityType !== 'unknown');
	const activityCounts = new Map();
	completedTweets.forEach(tweet => {
		activityCounts.set(tweet.activityType, (activityCounts.get(tweet.activityType) || 0) + 1);
	});
	const activityCountData = Array.from(activityCounts, ([activityType, count]) => ({ activityType, count }));
	activityCountData.sort((a, b) => b.count - a.count);
	const topActivities = activityCountData.slice(0, 3).map(activity => activity.activityType);
	const distanceData = completedTweets
		.filter(tweet => topActivities.includes(tweet.activityType) && tweet.distance > 0)
		.map(tweet => ({
			activityType: tweet.activityType,
			distance: tweet.distance,
			day: tweet.time.toLocaleDateString('en-US', { weekday: 'long' }),
			dayNumber: tweet.time.getDay(),
			dayGroup: tweet.time.getDay() === 0 || tweet.time.getDay() === 6 ? 'weekend' : 'weekday'
		}));
	const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const setText = (id, value) => {
		document.getElementById(id).innerText = value;
	};
	const distanceMeans = topActivities.map(activityType => {
		const distances = distanceData.filter(row => row.activityType === activityType).map(row => row.distance);
		return {
			activityType,
			mean: distances.length ? distances.reduce((sum, distance) => sum + distance, 0) / distances.length : 0
		};
	}).sort((a, b) => b.mean - a.mean);
	const weekdayDistances = distanceData.filter(row => row.dayGroup === 'weekday').map(row => row.distance);
	const weekendDistances = distanceData.filter(row => row.dayGroup === 'weekend').map(row => row.distance);
	const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

	setText('numberActivities', activityCountData.length);
	setText('firstMost', topActivities[0] || 'none');
	setText('secondMost', topActivities[1] || 'none');
	setText('thirdMost', topActivities[2] || 'none');
	setText('longestActivityType', distanceMeans[0]?.activityType || 'none');
	setText('shortestActivityType', distanceMeans[distanceMeans.length - 1]?.activityType || 'none');
	const weekdayMean = mean(weekdayDistances);
	const weekendMean = mean(weekendDistances);
	setText('weekdayOrWeekendLonger', weekdayMean === weekendMean ? 'the same distance on weekdays and weekends' : weekdayMean > weekendMean ? 'weekdays' : 'weekends');

	const activity_vis_spec = {
	  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  "description": "A graph of the number of Tweets containing each type of activity.",
	  "data": {
	    "values": activityCountData
	  },
	  //TODO: Add mark and encoding
	  "mark": "bar",
	  "encoding": {
	    "x": { "field": "activityType", "type": "nominal", "sort": "-y", "axis": { "title": "Activity type", "labelAngle": -45 } },
	    "y": { "field": "count", "type": "quantitative", "axis": { "title": "Number of tweets" } },
	    "tooltip": [
	      { "field": "activityType", "type": "nominal", "title": "Activity" },
	      { "field": "count", "type": "quantitative", "title": "Tweets" }
	    ]
	  }
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	const distanceVisSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Distances by day for the three most popular activities.",
		"data": { "values": distanceData },
		"mark": { "type": "point", "filled": true, "opacity": 0.45 },
		"encoding": {
			"x": { "field": "day", "type": "ordinal", "sort": dayOrder, "axis": { "title": "Day of week" } },
			"y": { "field": "distance", "type": "quantitative", "axis": { "title": "Distance (miles)" } },
			"color": { "field": "activityType", "type": "nominal", "title": "Activity" },
			"tooltip": [
				{ "field": "activityType", "type": "nominal", "title": "Activity" },
				{ "field": "day", "type": "ordinal", "title": "Day" },
				{ "field": "distance", "type": "quantitative", "title": "Miles", "format": ".2f" }
			]
		}
	};
	vegaEmbed('#distanceVis', distanceVisSpec, { actions: false });

	const aggregateVisSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "Mean distances by day for the three most popular activities.",
		"data": { "values": distanceData },
		"mark": { "type": "line", "point": true },
		"encoding": {
			"x": { "field": "day", "type": "ordinal", "sort": dayOrder, "axis": { "title": "Day of week" } },
			"y": { "field": "distance", "aggregate": "mean", "type": "quantitative", "axis": { "title": "Mean distance (miles)" } },
			"color": { "field": "activityType", "type": "nominal", "title": "Activity" },
			"tooltip": [
				{ "field": "activityType", "type": "nominal", "title": "Activity" },
				{ "field": "day", "type": "ordinal", "title": "Day" },
				{ "field": "distance", "aggregate": "mean", "type": "quantitative", "title": "Mean miles", "format": ".2f" }
			]
		}
	};
	vegaEmbed('#distanceVisAggregated', aggregateVisSpec, { actions: false });

	const distanceVis = document.getElementById('distanceVis');
	const distanceVisAggregated = document.getElementById('distanceVisAggregated');
	const aggregateButton = document.getElementById('aggregate');
	distanceVis.style.display = 'none';
	aggregateButton.addEventListener('click', function () {
		const showingAllActivities = distanceVis.style.display === 'none';
		distanceVis.style.display = showingAllActivities ? 'block' : 'none';
		distanceVisAggregated.style.display = showingAllActivities ? 'none' : 'block';
		aggregateButton.innerText = showingAllActivities ? 'Show means' : 'Show all activities';
	});
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});
