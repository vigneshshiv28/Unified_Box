import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { ZodError } from "zod";
import { channelService, createChannelSchema } from "@/app/lib/services";
import { isHttpError } from "@/app/lib/errors";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const channels = await channelService.getChannels(session.user.id, params.id);
    return NextResponse.json({ success: true, data: channels });
  } catch (error) {
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = createChannelSchema.parse(body);
    const channel = await channelService.createChannel(session.user.id, params.id, data);
    return NextResponse.json({ success: true, data: channel }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}
