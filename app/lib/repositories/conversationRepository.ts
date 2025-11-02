import prisma  from "@/app/lib/db/prisma";
import { Channel } from "@/app/generated/prisma/enums";

export const conversationRepository = {
  async getAllByTeam(teamId: string) {
    return prisma.conversation.findMany({
      where: { teamId },
      include: {
        contact: true,
        assignedTo: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        contact: true,
        assignedTo: true,
        messages: true,
        notes: {
          include: { author: true, mentions: true },
        },
      },
    });
  },

  async create(data: {
    contactId: string;
    teamId: string;
    channel: Channel;
    assignedToId?: string;
  }) {
    return prisma.conversation.create({ data });
  },

  async update(id: string, data: Record<string, any>) {
    return prisma.conversation.update({
      where: { id },
      data,
    });
  },

  async getMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "asc" },
    });
  },

  async getNotes(conversationId: string) {
    return prisma.note.findMany({
      where: { conversationId },
      include: {
        author: true,
        mentions: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async addNote(conversationId: string, authorId: string, content: string, isPrivate: boolean, mentions: string[] = []) {
    const note = await prisma.note.create({
      data: {
        conversationId,
        authorId,
        content,
        isPrivate,
        mentions: {
          create: mentions.map((mentionedId) => ({ mentionedId })),
        },
      },
      include: { mentions: true },
    });
    return note;
  },
};
