const { formatInTimeZone } = require("date-fns-tz");
const { format } = require("date-fns");
const d = new Date("2026-05-12T22:27:29.532Z");
console.log("formatInTimeZone:", formatInTimeZone(d, "Asia/Manila", "MMM d, yyyy h:mm a"));
console.log("format:", format(d, "MMM d, yyyy h:mm a"));
