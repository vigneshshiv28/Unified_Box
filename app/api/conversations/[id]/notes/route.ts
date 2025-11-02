import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { conversationService } from "@/app/lib/services/conversationService";
import { addNoteSchema } from "@/app/lib/services/conversationService";
import { ZodError } from "zod";
import { isHttpError } from "@/app/lib/errors";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const notes = await conversationService.getNotes(params.id, session.user.id);
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = addNoteSchema.parse(body);
    const note = await conversationService.addNote(params.id, session.user.id, parsed);
    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError)
      return NextResponse.json({ success: false, message: error.issues[0]?.message }, { status: 400 });

    const status = isHttpError(error) ? error.statusCode : 500;
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status });
  }
}
