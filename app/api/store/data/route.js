import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username").toLowerCase();
    if (!username) {
      return NextResponse.json(
        { success: false, error: "missing username" },
        { status: 400 },
      );
    }

    const store = await prisma.store.findUnique({
      where: { username, isActive: true },
      include: { Product: { include: { rating: true } } },
    });

    if (!store) {
      return NextResponse.json(
        { success: false, error: "store not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, store });
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

export {GET}