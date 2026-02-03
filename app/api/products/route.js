import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const GET = async (req) => {
  try {
    let products = await prisma.product.findMany({
      where: { inStock: true },
      include: {
        rating: {
          select: {
            createdAt: true,
            rating: true,
            review: true,
            user: { select: { name: true, image: true } },
          },
        },
        store: true,
      },
      orderBy: { createdAt: "desc" },
    });

    //remove products with inactive staff

    products = products.filter(product => product.store.isActive);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "An internal server error occured",
      },
      { status: 500 },
    );
  }
};

export { GET };
