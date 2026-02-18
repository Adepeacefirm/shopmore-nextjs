import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

const main = async (base64Image, mimeType) => {
  const messages = [
    {
      role: "system",
      content: `You are an assistant for an e-commerce platform called ShopMore. Your task is to analyze the content of the image of the product provided by the user and provide a structured data of what is in the image. 
        
        Respond ONLY with raw JSON (no explanations, no markdown, no code blocks). The JSON should strictly follow this schema:

        {
        "name": "string", // Short name of the product
        "description": "string", // Market-friendly description of the product
        }
        `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze the image and provide the product name and description.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages,
  });

  const raw = response.choices[0].message.content;

  // remove json or wrappers if present

  const cleaned = raw.replace(/```json|``/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    throw new Error("Invalid response format from OpenAI");
  }

  return parsed;
};

export const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized",
        },
        { status: 401 },
      );
    }
    const { base64Image, mimeType } = await req.json();
    const result = await main(base64Image, mimeType);
    return NextResponse.json(
      {
        success: true,
        ...result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process request",
      },
      { status: 500 },
    );
  }
};
