const { formatInTimeZone } = require("date-fns-tz");
const d = new Date("2026-05-12T13:48:29.900Z");
console.log("formatInTimeZone:", formatInTimeZone(d, "Asia/Manila", "MMM d, yyyy h:mm a"));
