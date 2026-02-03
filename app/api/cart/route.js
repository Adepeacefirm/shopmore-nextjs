import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const POST = async (req) => {
  try {
    const { userId } = getAuth(req);
    const { cart } = await req.json();

    //save the cart to the user object

    await prisma.user.update({
      where: { id: userId },
      data: { cart },
    });

    return NextResponse.json({ success: true, message: "cart updated" });
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, cart: user.cart });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};

export { POST, GET };
