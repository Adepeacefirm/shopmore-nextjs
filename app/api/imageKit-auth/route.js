import imagekit from "@/configs/imageKit";

export async function GET() {
  const authParams = imagekit.getAuthenticationParameters();
  return Response.json(authParams);
}
