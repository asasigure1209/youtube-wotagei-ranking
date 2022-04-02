"use strict";

module.exports.hello = async (event) => {
  const { got } = await import("got");

  const response = await got("https://www.googleapis.com/youtube/v3/search", {
    searchParams: {
      key: process.env.YOUTUBE_DATA_API_KEY,
      part: "snippet",
      q: "ヲタ芸",
    },
  }).json();

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
