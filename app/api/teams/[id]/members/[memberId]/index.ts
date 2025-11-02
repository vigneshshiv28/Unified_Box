import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { teamService, updateMemberSchema } from "@/app/lib/services";
import { ZodError } from "zod";
import { isHttpError } from "@/app/lib/errors";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateMemberSchema.parse(body);
    const updated = await teamService.updateMember(params.id, session.user.id, {
      userId: params.memberId,
      role: parsed.role,
    });

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }

    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; memberId: string } }
) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await teamService.removeMember(params.id, session.user.id, params.memberId);
    return NextResponse.json({ success: true, message: "Member removed successfully" }, { status: 200 });
  } catch (error) {
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Failed to remove member" }, { status: 500 });
  }
}
