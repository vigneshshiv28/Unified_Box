import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { conversationService } from "@/app/lib/services/conversationService";
import { createConversationSchema } from "@/app/lib/services/conversationService";
import { ZodError } from "zod";
import { isHttpError } from "@/app/lib/errors";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  const teamId = new URL(req.url).searchParams.get("teamId");
  if (!teamId)
    return NextResponse.json({ success: false, message: "Missing teamId" }, { status: 400 });

  try {
    const conversations = await conversationService.getAllByTeam(teamId, session.user.id);
    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createConversationSchema.parse(body);
    const conversation = await conversationService.createConversation(session.user.id, parsed);
    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ success: false, message: error.issues[0]?.message }, { status: 400 });

    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}
