import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { conversationService } from "@/app/lib/services/conversationService";
import { isHttpError } from "@/app/lib/errors";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const messages = await conversationService.getMessages(params.id, session.user.id);
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}
