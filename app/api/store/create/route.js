import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import ImageKit from "@imagekit/nodejs";
import { NextResponse } from "next/server";
import fs from "fs-extra";

const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const formData = await req.formData();
    const name = formData.get("name");
    const username = formData.get("username").toLowerCase();
    const description = formData.get("description");
    const email = formData.get("email");
    const contact = formData.get("contact");
    const address = formData.get("address");
    const image = formData.get("image");

    if (
      !name ||
      !username ||
      !description ||
      !email ||
      !contact ||
      !address ||
      !image
    ) {
      return NextResponse.json(
        { success: false, message: "Missing store info" },
        { status: 400 },
      );
    }

    // const storeExists = await prisma.store.findFirst({
    //   where: { username },
    // });

    // if (storeExists) {
    //   return NextResponse.json({
    //     success: false,
    //     message: "store already exists",
    //     status: storeExists.status,
    //   });
    // }

    const storeExists = await prisma.store.findFirst({
      where: { userId },
    });

    if (storeExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Store already exists",
          status: storeExists.status,
        },
        { status: 400 },
      );
    }

    const usernameExists = await prisma.store.findFirst({
      where: { username: username.toLowerCase() },
    });

    if (usernameExists) {
      return NextResponse.json(
        {
          success: false,
          message: "Username already exists",
        },

        { status: 400 },
      );
    }

    //Image upload to imageKit

    const buffer = Buffer.from(await image.arrayBuffer());
    const base64File = buffer.toString("base64");

    const client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    });

    const response = await client.files.upload({
      file: base64File,
      fileName: `${username}-logo`,
      folder: "logos",
    });

    console.log(response);

    const optimizedImage = client.helper.buildSrc({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "512" },
      ],
    });

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        username: username.toLowerCase(),
        email,
        contact,
        address,
        logo: optimizedImage,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Applied, awaiting approval",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
};

// check if user already has a store

const GET = async (req) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const storeExists = await prisma.store.findFirst({
      where: { userId },
    });

    if (storeExists) {
      return NextResponse.json({
        success: false,
        message: "store already exists",
        status: storeExists.status,
      });
    }

    return NextResponse.json({
      success: false,
      message: "User has no stores",
      status: "not registered",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};
export { POST, GET };
