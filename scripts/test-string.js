const { formatInTimeZone } = require("date-fns-tz");
const dateStr = "2026-05-12T13:48:29.900Z";
console.log("String:", formatInTimeZone(dateStr, "Asia/Manila", "MMM d, yyyy h:mm a"));
