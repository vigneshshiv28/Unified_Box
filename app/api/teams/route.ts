import { auth } from '@/app/lib/auth/auth';
import { NextResponse } from "next/server";
import { teamService, createTeamSchema } from "@/app/lib/service";

export async function POST(req: Request) {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const body = await req.json();
      const data = createTeamSchema.parse(body);
      const team = await teamService.createTeam(data);
      return NextResponse.json(team, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }
  
  export async function GET(req: Request) {

    
    const teams = await teamService.getAllTeams();
    return NextResponse.json(teams);
  } 