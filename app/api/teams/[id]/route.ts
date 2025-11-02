import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { teamService, updateTeamSchema } from "@/app/lib/services";
import { ZodError } from "zod";
import { isHttpError } from "@/app/lib/errors";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const team = await teamService.getTeamById(params.id, session.user.id);
    return NextResponse.json({ success: true, data: team }, { status: 200 });
  } catch (error) {
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }
    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch team" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateTeamSchema.parse(body);
    const updated = await teamService.updateTeam(params.id, session.user.id, parsed);

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Validation error" }, { status: 400 });
    }
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    await teamService.deleteTeam(params.id, session.user.id);
    return NextResponse.json({ success: true, message: "Team deleted successfully" }, { status: 200 });
  } catch (error) {
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete team" }, { status: 500 });
  }
}
