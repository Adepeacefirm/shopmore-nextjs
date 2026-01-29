import prisma from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GET = async (req) => {
  try {
    const { userId } = getAuth(req);
    console.log(userId);
    
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

    const orders = await prisma.order.count();
    const stores = await prisma.store.count();
    const allOrders = await prisma.order.findMany({
      select: {
        createdAt: true,
        total: true,
      },
    });

    let totalRevenue = 0;
    allOrders.forEach((order) => {
      totalRevenue += order.total;
    });

    const revenue = totalRevenue.toFixed(2);
    const products = await prisma.product.count();
    const dashboardData = {
      orders,
      stores,
      products,
      revenue,
      allOrders,
    };

    return NextResponse.json({ success: true, dashboardData });
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
