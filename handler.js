import got from "got";
import AWS from "aws-sdk";

export const hello = async (event) => {
  const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

  const searchResponse = await got(
    "https://www.googleapis.com/youtube/v3/search",
    {
      searchParams: {
        key: process.env.YOUTUBE_DATA_API_KEY,
        part: "snippet",
        order: "viewCount",
        type: "video",
        maxResults: 3,
        publishedAfter: "2022-03-20T00:00:00Z",
        publishedBefore: "2022-03-26T23:59:59Z",
        q: "ヲタ芸",
      },
    }
  ).json();

  const videoIds = searchResponse.items.map(({ id }) => id.videoId);

  const statisticsResponse = await got(
    "https://www.googleapis.com/youtube/v3/videos",
    {
      searchParams: {
        part: "statistics",
        id: videoIds.join(","),
        key: process.env.YOUTUBE_DATA_API_KEY,
      },
    }
  ).json();

  searchResponse.items.map(async ({ id, snippet }, index) => {
    const item = {
      week: 220310220326,
      views: Number(statisticsResponse.items[index].statistics.viewCount),
      title: snippet.title,
      thumbnail: snippet.thumbnails.high.url,
      videoId: id.videoId,
    };

    const params = {
      TableName: process.env.TABLE_NAME,
      Item: item,
    };

    await dynamoDbClient.put(params).promise();
  });

  return {
    statusCode: 200,
    body: "OK",
  };
};
