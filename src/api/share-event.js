// api/share-event.js

import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

const db = admin.firestore();

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function escapeHtml(text = "") {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).send("Missing event slug.");
  }

  try {
    const doc = await db.collection("events").doc(slug).get();

    if (!doc.exists) {
      return res.status(404).send("Event not found.");
    }

    const event = doc.data();

    const title = escapeHtml(event.name || "Airticks Event");

    const description = escapeHtml(
      stripHtml(event.description || "Discover and book amazing events on Airticks.")
        .substring(0, 200)
    );

    const image =
      event.photo ||
      "https://www.airticks.com/default-event-image.jpg"; // Replace with your default image

    const eventUrl = `https://www.airticks.com/event/${slug}`;

    res.setHeader("Content-Type", "text/html");

    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8" />

<title>${title}</title>

<meta name="description" content="${description}" />

<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:url" content="${eventUrl}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Airticks" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />

<meta http-equiv="refresh" content="0;url=${eventUrl}" />

</head>

<body>
Redirecting...
</body>
</html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}