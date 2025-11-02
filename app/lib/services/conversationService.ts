import { z } from "zod";
import { conversationRepository } from "../repositories/conversationRepository";
import {
  NotFoundError,
  ForbiddenError,
} from "../errors";
import { teamRepository } from "../repositories";


export const createConversationSchema = z.object({
    contactId: z.string(),
    teamId: z.string(),
    channel: z.enum(["SMS","WHATSAPP"]),
    assignedToId: z.string().optional(),
  });
  
  export const updateConversationSchema = z.object({
    status: z.string().optional(),
    assignedToId: z.string().optional(),
  });
  
  export const addNoteSchema = z.object({
    content: z.string().min(1, "Note content cannot be empty"),
    isPrivate: z.boolean().default(false),
    mentions: z.array(z.string()).optional(), 
  });

export const conversationService = {
  async getAllByTeam(teamId: string, userId: string) {
    const team = await teamRepository.getTeamById(teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied to this team");

    return conversationRepository.getAllByTeam(teamId);
  },

  async createConversation(userId: string, input: z.infer<typeof createConversationSchema>) {
    const team = await teamRepository.getTeamById(input.teamId);
    if (!team) throw new NotFoundError("Team not found");

    const isMember = team.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("You must be a team member to create a conversation");

    return conversationRepository.create(input);
  },

  async getById(id: string, userId: string) {
    const conversation = await conversationRepository.getById(id);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const team = await teamRepository.getTeamById(conversation.teamId);
    const isMember = team?.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return conversation;
  },

  async updateConversation(id: string, userId: string, input: z.infer<typeof updateConversationSchema>) {
    const conversation = await conversationRepository.getById(id);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const team = await teamRepository.getTeamById(conversation.teamId);
    const member = team?.members.find((m) => m.userId === userId);
    if (!member) throw new ForbiddenError("Access denied");

    return conversationRepository.update(id, input);
  },

  async getMessages(id: string, userId: string) {
    const conversation = await conversationRepository.getById(id);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const team = await teamRepository.getTeamById(conversation.teamId);
    const isMember = team?.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return conversationRepository.getMessages(id);
  },

  async getNotes(id: string, userId: string) {
    const conversation = await conversationRepository.getById(id);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const team = await teamRepository.getTeamById(conversation.teamId);
    const isMember = team?.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return conversationRepository.getNotes(id);
  },

  async addNote(
    conversationId: string,
    userId: string,
    input: z.infer<typeof addNoteSchema>
  ) {
    const conversation = await conversationRepository.getById(conversationId);
    if (!conversation) throw new NotFoundError("Conversation not found");

    const team = await teamRepository.getTeamById(conversation.teamId);
    const isMember = team?.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenError("Access denied");

    return conversationRepository.addNote(
      conversationId,
      userId,
      input.content,
      input.isPrivate,
      input.mentions
    );
  },
};
