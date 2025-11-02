import { ForbiddenError, NotFoundError, ConflictError } from "../errors";
import { z } from "zod";
import { channelRepository, teamRepository } from "../repositories";

export const createChannelSchema = z.object({
  type: z.enum(["SMS", "WHATSAPP", "EMAIL"]),
  value: z.string().min(3),
  isPrimary: z.boolean().optional(),
});

export const channelService = {
  async createChannel(userId: string, teamId: string, input: z.infer<typeof createChannelSchema>) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const member = team.members.find((m) => m.userId === userId);
    if (!member || member.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can add channels");
    }

    const existing = await channelRepository.getChannelByValue(input.value);
    if (existing) throw new ConflictError("This channel value is already in use");

    return channelRepository.createChannel(teamId, input);
  },

  async getChannels(userId: string, teamId: string) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return channelRepository.getChannelsByTeamId(teamId);
  },

  async deleteChannel(userId: string, teamId: string, channelId: string) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const member = team.members.find((m) => m.userId === userId);
    if (!member || member.role !== "ADMIN") {
      throw new ForbiddenError("Only admins can delete channels");
    }

    return channelRepository.deleteChannel(channelId);
  },
};
