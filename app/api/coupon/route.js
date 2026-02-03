import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const POST = async (req) => {
  try {
    const { userId, has } = getAuth(req);
    const { code } = await req.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase(), expiresAt: { gt: new Date() } },
    });

    if (!coupon) {
      return NextResponse.json(
        { success: false, message: "Coupon not found" },
        { status: 404 },
      );
    }

    if (coupon.forNewUser) {
      const userOrders = await prisma.order.findMany({
        where: { userId },
      });
      if (userOrders.length > 0) {
        return NextResponse.json(
          { success: false, message: "coupon only valid for new users" },
          { status: 403 },
        );
      }
    }

    if (coupon.forMember) {
      const hasPlusPlan = has({ plan: "plus" });
      if (!hasPlusPlan) {
        return NextResponse.json(
          {
            success: false,
            message: "Coupon valid for returning members only",
          },
          { status: 403 },
        );
      }
    }

    return NextResponse.json({ success: true, coupon });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};

export { POST };
