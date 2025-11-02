import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { conversationService } from "@/app/lib/services/conversationService";
import { updateConversationSchema } from "@/app/lib/services/conversationService";
import { ZodError } from "zod";
import { isHttpError } from "@/app/lib/errors";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const conversation = await conversationService.getById(params.id, session.user.id);
    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateConversationSchema.parse(body);
    const updated = await conversationService.updateConversation(params.id, session.user.id, parsed);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}
