import prisma  from "@/app/lib/db/prisma";

export const channelRepository = {
  async createChannel(teamId: string, data: { type: string; value: string; isPrimary?: boolean }) {
    return prisma.teamChannel.create({
      data: {
        teamId,
        type: data.type as any,
        value: data.value,
      },
    });
  },

  async getChannelsByTeamId(teamId: string) {
    return prisma.teamChannel.findMany({ where: { teamId } });
  },

  async getChannelByValue(value: string) {
    return prisma.teamChannel.findUnique({ where: { value } });
  },

  async deleteChannel(channelId: string) {
    return prisma.teamChannel.delete({ where: { id: channelId } });
  },
};
