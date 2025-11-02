import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { channelService } from "@/app/lib/services";
import { isHttpError } from "@/app/lib/errors";

export async function DELETE(req: Request, { params }: { params: { id: string; channelId: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    await channelService.deleteChannel(session.user.id, params.id, params.channelId);
    return NextResponse.json({ success: true, message: "Channel deleted successfully" });
  } catch (error) {
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Unexpected error" }, { status: 500 });
  }
}
