import type { NextApiRequest, NextApiResponse } from "next";
import { Configuration, OpenAIApi } from "openai";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

type RequestBody = {
  auth: string;
  data: any;
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
    const filename = `/tmp/${uuidv4()}.json`;

    // Write JSON data to a temporary file
    fs.writeFileSync(filename, JSON.stringify(body.data));

    // Create a new FormData instance
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filename), {
      filename: filename,
      contentType: "application/json",
    });

    const response = await axios.post(
      "https://api.thetaedgestore.com/api/v2/data",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-theta-edgestore-auth": body.auth,
        },
      }
    );

    // Delete the temporary file
    fs.rmSync(filename);
    
    res.status(200).json({
      message: "success",
      data: response.data,
    });
  } catch (error) {
    console.log("Error uploading file:", error);
    res.status(500).json({
      message: "error",
      error: "An error occurred while generating the image.",
    });
  }
}

export const config = { api: { bodyParser: { sizeLimit: "25mb" } } };
