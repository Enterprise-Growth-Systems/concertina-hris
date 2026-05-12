const { formatInTimeZone } = require("date-fns-tz");

const d = new Date("2026-05-12T22:27:00.000Z"); // UTC time when it was 6:27 AM in Manila
console.log(formatInTimeZone(d, "Asia/Manila", "MMM d, yyyy h:mm a"));
