import prisma from "@/app/lib/db/prisma";

export const teamRepository = {
    async createTeam(name: string) {
      return prisma.team.create({
        data: { name },
      });
    },
  
    async getAllTeams() {
      return prisma.team.findMany({
        include: { users: true, contacts: true },
      });
    },
  
    async getTeamById(id: string) {
      return prisma.team.findUnique({
        where: { id },
        include: {
          users: { select: { id: true, name: true, email: true, role: true } },
          contacts: true,
        },
      });
    },
  
    async updateTeam(id: string, data: { name?: string }) {
      return prisma.team.update({
        where: { id },
        data,
      });
    },
  
    async deleteTeam(id: string) {
      return prisma.team.delete({
        where: { id },
      });
    },
  
    async addMember(teamId: string, userId: string) {
      return prisma.user.update({
        where: { id: userId },
        data: { teamId },
      });
    },
  
    async removeMember(userId: string) {
      return prisma.user.update({
        where: { id: userId },
        data: { teamId: null },
      });
    },
  };