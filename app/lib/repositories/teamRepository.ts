import prisma from "@/app/lib/db/prisma";
import { Role } from "@/app/generated/prisma/enums";

export const teamRepository = {
    async createTeam(name: string, creatorId: string) {
      return prisma.team.create({
        data: {
          name,
          members: {
            create: {
              userId: creatorId,
              role: Role.ADMIN,
            },
          },
        },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      });
    },
  

    async getAllTeams(userId: string) {
        return prisma.team.findMany({
          where: {
            members: {
              some: { userId },
            },
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            contacts: true,
          },
        });
      },
  

    async getTeamById(id: string) {
      return prisma.team.findUnique({
        where: { id },
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
          contacts: true,
        },
      });
    },

    async getTeamByName(name: string) {
        return prisma.team.findUnique({
          where: { name },
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
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

    async addMember(teamId: string, userId: string, role: Role = Role.VIEWER) {
      return prisma.teamMember.create({
        data: {
          teamId,
          userId,
          role,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    },
  

    async removeMember(teamId: string, userId: string) {
      return prisma.teamMember.delete({
        where: {
          teamId_userId: { teamId, userId },
        },
      });
    },
  

    async updateMemberRole(teamId: string, userId: string, role: Role) {
      return prisma.teamMember.update({
        where: { teamId_userId: { teamId, userId } },
        data: { role },
      });
    },
  };