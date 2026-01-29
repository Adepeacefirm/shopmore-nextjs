import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "not authorized",
        },
        { status: 401 },
      );
    }

    const { storeId } = await req.json();
    if (!storeId) {
      return NextResponse.json(
        {
          success: false,
          message: "missing store I",
        },
        { status: 400 },
      );
    }

    // find the store

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json(
        {
          success: false,
          message: "store not found",
        },
        { status: 400 },
      );
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: !store.isActive },
    });

    return NextResponse.json({
      success: true,
      message: "Store updated successfully",
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

export { POST };
