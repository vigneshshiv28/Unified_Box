import { NextResponse } from "next/server";
import { auth } from "@/app/lib/auth/auth";
import { teamService, createTeamSchema } from "@/app/lib/services";
import { ZodError } from "zod";
import { isHttpError, getErrorStatusCode } from "@/app/lib/errors";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await teamService.getAllTeams(session.user.id);
    return NextResponse.json({ success: true, data: teams }, { status: 200 });
  } catch (error) {
    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createTeamSchema.parse(body);

    const team = await teamService.createTeam(session.user.id, parsed);
    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message ?? "Validation error" },
        { status: 400 }
      );
    }

    if (isHttpError(error)) {
      return NextResponse.json({ success: false, message: error.message }, { status: error.statusCode });
    }

    console.error("Unexpected error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}