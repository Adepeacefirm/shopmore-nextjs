import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
  try {
    const body = await req.text();
    const sig = req.get("stripe-signature");
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    const handlePaymentIntent = async (paymentIntentId, isPaid) => {
      const session = await stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderIds, userId, appId } = session.data[0].metadata;
      if (appId !== "shopmore") {
        return NextResponse.json({
          success: false,
          received: true,
          message: "invalid app id",
        });
      }
      const orderIdsArray = orderIds.split(",");

      if (isPaid) {
        //mark order as paid

        await Promise.all(
          orderIdsArray.map(async (orderId) => {
            await prisma.order.update({
              where: { id: orderId },
              data: { isPaid: true },
            });
          }),
        );

        //delete cart from user

        await prisma.user.update({
            where: {id: userId},
            data: {cart: {}}
        })
      } else {
        // Delete order from db
        await Promise.all(orderIdsArray.map(async (orderId)=>{
            await prisma.order.delete({
                where: {id: orderId}
            })
        }))
      }
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        handlePaymentIntent(event.data.object.id, true);
        break;
      }
      case "payment_intent.canceled": {
        handlePaymentIntent(event.data.object.id, false);
        break;
      }

      default:
        console.log("Unhandled event type", event.type);

        break;
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
};

export const config = {
    api: {bodyparser: false}
}
