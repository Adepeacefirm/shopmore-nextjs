import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextResponse } from "next/server";

const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const { orderId, productId, rating, review } = await req.json();
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "order not found" },
        { status: 404 },
      );
    }

    const isAlreadyRated = await prisma.rating.findFirst({
      where: { productId, orderId },
    });

    if (isAlreadyRated) {
      return NextResponse.json(
        { success: true, message: "Product is already rated" },
        { status: 400 },
      );
    }

    const response = await prisma.rating.create({
      data: { userId, productId, rating, review, orderId },
    });

    return NextResponse.json({
      success: true,
      message: "Rating added successfully",
      rating: response,
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
        const {userId} = getAuth(req);
        if (!userId) {
            return NextResponse.json({success: false, message: "unathorized"}, {status: 401});
        }

        const ratings = await prisma.rating.findMany({
            where: {userId}
        })

        return NextResponse.json({success: true, ratings})
    } catch (error) {
        console.log(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
    }
}

export { POST, GET };
