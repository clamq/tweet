"use strict";
class Tweet {
    text;
    time;
    constructor(tweet_text, tweet_time) {
        this.text = tweet_text;
        this.time = new Date(tweet_time); //, "ddd MMM D HH:mm:ss Z YYYY"
    }
    //returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source() {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const normalized = this.text.toLowerCase();
        if (/\bwatch my\b.*\bright now\b|\bcurrently\b/.test(normalized) || /#rklive\b/i.test(this.text)) {
            return "live_event";
        }
        if (/\bachieved\b|\bpersonal record\b|\bnew (?:personal )?record\b|\bgoal\b/.test(normalized)) {
            return "achievement";
        }
        if (/^\s*just (?:completed|posted)\b/i.test(this.text)) {
            return "completed_event";
        }
        return "miscellaneous";
    }
    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written() {
        //TODO: identify whether the tweet is written
        return this.writtenText.length > 0;
    }
    get writtenText() {
        //TODO: parse the written text from the tweet
        // Remove the generated activity URL and RunKeeper hashtag before
        // looking for anything the user added to the default message.
        let remainder = this.text
            .replace(/https?:\/\/\S+/gi, " ")
            .replace(/#runkeeper\b/gi, " ")
            .replace(/#rklive\b/gi, " ")
            .replace(/#fitnessalerts\b/gi, " ")
            .trim();
        // Remove common RunKeeper generated wording, leaving personal notes.
        remainder = remainder
            .replace(/^just completed a\s+\d+(?:\.\d+)?\s*(?:km|mi|miles?)\s+[a-z][a-z-]*(?:\s+workout)?/i, " ")
            .replace(/^just posted a\s+\d+(?:\.\d+)?\s*(?:km|mi|miles?)\s+[a-z][a-z-]*(?:\s+workout)?/i, " ")
            .replace(/^just completed a\s+\d+(?:\.\d+)?\s*(?:km|mi|miles?)\s+.+?\s+(?:with @runkeeper\.\s*check it out!?|check it out!?)/i, " ")
            .replace(/^just completed a\s+\d+(?:\.\d+)?\s*(?:km|mi|miles?)\s+.+?\s+with @runkeeper\b/i, " ")
            .replace(/^just posted a\s+.+?\s+workout\s+in\s+\d+:\d+(?::\d+)?\s*/i, " ")
            .replace(/^watch my\s+.+?\s+right now with @runkeeper live/i, " ")
            .replace(/^achieved a new personal record with:\s*/i, " ")
            .replace(/^distance\.\.\.\s*/i, " ")
            .replace(/^new pb on this route\b/i, " ")
            .replace(/^with @runkeeper\.\s*check it out!?/i, " ")
            .replace(/^check it out!?/i, " ")
            .replace(/^[-–—:,.]+\s*/, " ")
            .replace(/\s+/g, " ")
            .trim();
        return remainder;
    }
    get activityType() {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        //TODO: parse the activity type from the text of the tweet
        let match = this.text.match(/^just (?:completed|posted) (?:a|an)\s+\d+(?:\.\d+)?\s*(?:km|mi)\s+(.+?)(?=\s+with @runkeeper|\s+-\s+|\s+https?:\/\/|$)/i);
        if (!match) {
            match = this.text.match(/^just posted (?:a|an)\s+(.+?)\s+in\s+\d+:\d+(?::\d+)?/i);
        }
        if (!match) {
            return "unknown";
        }
        return match[1]
            .replace(/\s+workout$/i, "")
            .replace(/\s+practice$/i, "")
            .replace(/\s+session$/i, "")
            .replace(/®/g, "")
            .trim()
            .toLowerCase();
    }
    get distance() {
        if (this.source != 'completed_event') {
            return 0;
        }
        //TODO: prase the distance from the text of the tweet
        const match = this.text.match(/\b(\d+(?:\.\d+)?)\s*(km|mi)\b/i);
        if (!match) {
            return 0;
        }
        const distance = Number(match[1]);
        return match[2].toLowerCase() === "km" ? distance / 1.609 : distance;
    }
    getHTMLTableRow(rowNumber) {
        //TODO: return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const escapeHTML = (value) => value.replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            };
            return entities[character];
        });
        const safeTweet = escapeHTML(this.text).replace(/https?:\/\/[^\s<]+/gi, url => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
        return `<tr><th scope="row">${rowNumber}</th><td>${escapeHTML(this.activityType)}</td><td>${safeTweet}</td></tr>`;
    }
}
