//Auth Admin

import authAdmin from "@/middlewares/authAdmin";
import { auth, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const GET = async (req) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No session found" },
        { status: 401 },
      );
    }

    const isAdmin = await authAdmin(userId);

    console.log("isadmin", isAdmin);

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "not authorized",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin,
    });
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
