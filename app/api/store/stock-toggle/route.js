import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json(
        { success: false, error: "missing details: productId" },
        { status: 400 },
      );
    }

    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json(
        { success: false, message: "not authorized", error: "not authorized" },
        { status: 401 },
      );
    }

    // check if product exists

    const product = await prisma.product.findFirst({
      where: { id: productId, storeId },
    });

    if (!productId) {
      return NextResponse.json(
        { success: false, error: "no product found" },
        { status: 404 },
      );
    }

    await prisma.product.update({
      where: { id: productId },
      data: { inStock: !product.inStock },
    });

    return NextResponse.json({
      success: true,
      message: "Product stock updated successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, error: error.code || error.message },
      { status: 500 },
    );
  }
};

export { POST };
