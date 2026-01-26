import imagekit from "@/configs/imageKit";
import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "not authorized", error: "not authorized" },
        { status: 401 },
      );
    }

    // Get the data from the form

    const formData = await req.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const mrp = Number(formData.get("mrp"));
    const price = Number(formData.get("price"));
    const catgeory = formData.get("category");
    const images = formData.getAll("images");

    if (!name || !description || !mrp || !price || !catgeory || !image) {
      return NextResponse.json(
        {
          success: false,
          error: "missing product details",
        },
        { status: 500 },
      );
    }

    //Uploading Images to ImageKit

    const imagesUrl = await Promise.all(
      images.map(async (image) => {
        const buffer = Buffer.from(await image.arrayBuffer());
        const response = await imagekit.upload({
          file: buffer,
          fileName: image.name,
          folder: "products",
        });
        const url = imagekit.url({
          path: response.filePath,
          transformation: [
            { quality: "auto" },
            { format: "webp" },
            { width: "1024" },
          ],
        });
        return url;
      }),
    );

    await prisma.product.create({
      data: {
        name,
        description,
        mrp,
        price,
        category,
        images: imagesUrl,
        storeId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        error: error.code || error.message,
      },
      { status: 500 },
    );
  }
};

// Get all products from a seller

const GET = async (req) => {
  try {
    const { userId } = getAuth(req);
    const storeId = await authSeller(userId);
    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "not authorized", error: "not authorized" },
        { status: 401 },
      );
    }

    const products = await prisma.product.findMany({
        where: {storeId}
    })

    return NextResponse.json({ success: true, products})
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.code || error.message,
      },
      { status: 500 },
    );
  }
};

export { POST, GET };
