import { z } from "zod";
import { teamRepository } from "../repositories";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";



export const createTeamSchema = z.object({
    name: z.string().min(2, "Team name must be at least 2 characters"),
  });
  
export const updateTeamSchema = z.object({
    name: z.string().min(2).optional(),
});
  
export const addMemberSchema = z.object({
    userId: z.string(),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"]).default("VIEWER"),
});

export const updateMemberSchema = z.object({
    userId: z.string(),
    role: z.enum(["ADMIN", "EDITOR", "VIEWER"]),
  });
  
export const teamService = {
  async createTeam(userId: string, input: z.infer<typeof createTeamSchema>) {
    const existingTeam = await teamRepository.getTeamByName(input.name);
    if (existingTeam) throw new ConflictError("Team name already exists");

    const team = await teamRepository.createTeam(input.name, userId);
    return team;
  },

  async getAllTeams(userId: string) {
    const teams = await teamRepository.getAllTeams(userId);
  
    if (!teams || teams.length === 0) {
      throw new NotFoundError("No teams found for this user");
    }
  
    return teams;
  },

  async getTeamById(id: string, userId: string) {
    const team = await teamRepository.getTeamById(id);
    if (!team) throw new NotFoundError("Team not found");

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return team;
  },

  async updateTeam(id: string, userId: string, input: z.infer<typeof updateTeamSchema>) {
    const team = await teamRepository.getTeamById(id);
    if (!team) throw new NotFoundError("Team not found");

    const member = team.members.find((m) => m.userId === userId);
    if (!member || member.role !== "ADMIN") {
      throw new ForbiddenError("Only team admins can update the team");
    }

    return teamRepository.updateTeam(id, input);
  },

  async deleteTeam(id: string, userId: string) {
    const team = await teamRepository.getTeamById(id);
    if (!team) throw new NotFoundError("Team not found");

    const member = team.members.find((m) => m.userId === userId);
    if (!member || member.role !== "ADMIN") {
      throw new ForbiddenError("Only team admins can delete the team");
    }

    return teamRepository.deleteTeam(id);
  },

  async addMember(teamId: string, userId: string, input: z.infer<typeof addMemberSchema>) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const requester = team.members.find((m) => m.userId === userId);
    if (!requester || requester.role !== "ADMIN") {
      throw new ForbiddenError("Only team admins can add members");
    }

    const alreadyMember = team.members.find((m) => m.userId === input.userId);
    if (alreadyMember) throw new ConflictError("User is already a member of this team");

    return teamRepository.addMember(teamId, input.userId, input.role);
  },

  async updateMember(teamId: string, userId: string, input: z.infer<typeof updateMemberSchema>) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const requester = team.members.find((m) => m.userId === userId);
    if (!requester || requester.role !== "ADMIN") {
      throw new ForbiddenError("Only team admins can update member roles");
    }

    const member = team.members.find((m) => m.userId === input.userId);
    if (!member) throw new NotFoundError("Member not found in this team");

    if (member.role === input.role) {
      throw new ConflictError("Member already has this role");
    }

    return teamRepository.updateMemberRole(teamId, input.userId, input.role);
  },

  async removeMember(teamId: string, userId: string, memberId: string) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const requester = team.members.find((m) => m.userId === userId);
    if (!requester || requester.role !== "ADMIN") {
      throw new ForbiddenError("Only team admins can remove members");
    }

    const member = team.members.find((m) => m.userId === memberId);
    if (!member) throw new NotFoundError("Member not found in this team");

    return teamRepository.removeMember(teamId, memberId);
  },
};
  