import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type RequestBody = {
  prompt: string;
  address: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const body: RequestBody = req.body;

  try {
    const response = await openai.createImage({
      prompt: body.prompt,
      n: 1,
      user: body.address,
      size: "512x512",
      response_format: "b64_json",
    });
    res.status(200).json({
      message: "success",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "error",
      error: "An error occurred while generating the image.",
    });
  }
}
