import TurndownService from "turndown";
import { webhookURL } from "./config.js";
import { splitMessage } from "./splitMessage.js";

const service = new TurndownService();
service.addRule("strikethrough", {
    filter: ["del", "s", "strike"],
    replacement: function(content) {
        return `~~${content}~~`;
    },
});
const day = new Date().getDate();
const year = new Date().getFullYear();

const response = await fetch(`https://adventofcode.com/${year}/day/${day}`);
if (!response.ok) {
    console.error("response not okay.");
    process.exit(-1);
}
const text = await response.text();
let html = text.split("article class=\"day-desc\">")[1];
html = html.split("</article")[0];
const title = html.split("</h2>")[0].replace("<h2>", "");
const md = service.turndown(html.split("</h2>")[1]);
console.log(title);
const split = splitMessage(md);
// console.log(split, split.map(a => a.length), "|", split.length);
for (const content of split) {
    await fetch(webhookURL, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: title,
            content,
            avatar_url: "https://adventofcode.com/favicon.png",
        }),
    });
}
