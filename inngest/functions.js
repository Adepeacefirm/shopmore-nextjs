import prisma from "@/lib/prisma";
import { inngest } from "./client";

// Inngest Function to save user data to a database

const syncUserCreation = inngest.createFunction(
  { id: "sync-user-create" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.create({
      data: {
        id: data.id,
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });
  },
);

// ingngest function to update user data in database

const syncUserUpdate = inngest.createFunction(
  {
    id: "sync-user-update",
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
    });
  },
);

// inngest function to delete user from database

const syncUserDelete = inngest.createFunction(
  {
    id: "sync-user-delete",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;
    await prisma.user.delete({
      where: { id: data.id },
    });
  },
);

export { syncUserCreation, syncUserUpdate, syncUserDelete };
