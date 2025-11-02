import { z } from "zod";
import { teamRepository } from "../repositories";



export const createTeamSchema = z.object({
    name: z.string().min(2, "Team name must be at least 2 characters"),
  });
  
  export const updateTeamSchema = z.object({
    name: z.string().min(2).optional(),
  });
  
  export const addMemberSchema = z.object({
    userId: z.string(),
  });

export const teamService = {
    async createTeam(input: z.infer<typeof createTeamSchema>) {
      return teamRepository.createTeam(input.name);
    },
  
    async getAllTeams() {
      return teamRepository.getAllTeams();
    },
  
    async getTeamById(id: string) {
      return teamRepository.getTeamById(id);
    },
  
    async updateTeam(id: string, input: z.infer<typeof updateTeamSchema>) {
      return teamRepository.updateTeam(id, input);
    },
  
    async deleteTeam(id: string) {
      return teamRepository.deleteTeam(id);
    },
  
    async addMember(teamId: string, input: z.infer<typeof addMemberSchema>) {
      return teamRepository.addMember(teamId, input.userId);
    },
  
    async removeMember(userId: string) {
      return teamRepository.removeMember(userId);
    },
  };