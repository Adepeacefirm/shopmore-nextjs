import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GET = async (req) => {
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

    const stores = await prisma.store.findMany({
      where: { status: "approved" },
      include: { user: true },
    });

    return NextResponse.json({ success: true, stores });
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
