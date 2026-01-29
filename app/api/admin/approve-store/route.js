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

    const { storeId, status } = await req.json();

    if (status === "approved") {
      await prisma.store.update({
        where: { id: storeId },
        data: { status: "approved", isActive: true },
      });
    } else if (status === "rejected") {
      await prisma.store.update({
        where: { id: { storeId } },
        data: { status: "rejected" },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: status + "successfully",
      },
      { status: 200 },
    );
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
      where: { status: { in: ["pending", "rejected"] } },
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

export { POST, GET };
