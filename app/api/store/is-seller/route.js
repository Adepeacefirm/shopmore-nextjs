import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GET = async (req) => {
  try {
    const { userId } = getAuth(req);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "not authorized", error: "not authorized" },
        { status: 401 },
      );
    }
    const storeInfo = await prisma.store.findUnique({
      where: { userId },
    });

    return NextResponse.json({ success: true, isSeller, storeInfo });
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

export { GET };
