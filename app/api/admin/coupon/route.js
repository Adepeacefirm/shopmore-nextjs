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
        { success: false, message: "not authorized" },
        { status: 401 },
      );
    }

    const { coupon } = await req.json();
    coupon.code = coupon.code.toUpperCase();

    await prisma.coupon.create({ data: coupon });

    return NextResponse.json({
      success: true,
      message: "coupon added successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};

const DELETE = async (req) => {
  try {
    const { userId } = getAuth(req);
    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "not authorized" },
        { status: 401 },
      );
    }

    const { searchParams } = req.nexturl;
    const code = searchParams.get("code");

    await prisma.coupon.delete({ where: { code } });

    return NextResponse.json({
      success: true,
      message: "coupon deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
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
        { success: false, error: "not authorized" },
        { status: 401 },
      );
    }

    const coupons = await prisma.coupon.findMany({});

    return NextResponse.json({ success: true, coupons });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};

export { POST, DELETE, GET };
