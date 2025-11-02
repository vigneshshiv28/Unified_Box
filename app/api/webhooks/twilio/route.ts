import { NextRequest, NextResponse } from "next/server";
import { validateWebhook } from "@/app/lib/integrations/twilio/config";
import prisma from "@/app/lib/db/prisma";
import { Channel, MessageDirection } from "@/app/generated/prisma/enums";
import { z } from "zod";

const TwilioMessageSchema = z.object({
  MessageSid: z.string(),
  From: z.string(),
  To: z.string(),
  Body: z.string().optional(),
  NumMedia: z.string().optional(),
  MediaUrl0: z.string().optional(),
  MediaContentType0: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params = Object.fromEntries(formData);

    const signature = request.headers.get("x-twilio-signature") || "";
    const url = request.url;

    if (!validateWebhook(signature, url, params)) {
      console.error("Invalid Twilio signature");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = TwilioMessageSchema.parse(params);
    const { MessageSid, From, To, Body, NumMedia, MediaUrl0, MediaContentType0 } = parsed;

    const channel: Channel = From.startsWith("whatsapp:") ? "WHATSAPP" : "SMS";

    const fromNumber = From.replace("whatsapp:", "").trim();
    const toNumber = To.replace("whatsapp:", "").trim();

    
    const teamChannel = await prisma.teamChannel.findFirst({
      where: {
        value: toNumber,
        type: channel,
      },
      include: { team: true },
    });

    if (!teamChannel) {
      console.warn("No registered channel for:", toNumber);
      return NextResponse.json({ error: "Unknown team channel" }, { status: 404 });
    }

    const teamId = teamChannel.teamId;


    let contact = await prisma.contact.findFirst({
      where: {
        teamId,
        phone: fromNumber,
      },
    });

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          teamId,
          phone: fromNumber,
          name: fromNumber, 
        },
      });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        teamId,
        contactId: contact.id,
        channel,
        status: "OPEN",
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          teamId,
          contactId: contact.id,
          channel,
          status: "OPEN",
        },
      });
    }


    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: MessageDirection.INBOUND,
        channel,
        body: Body || "",
        mediaUrl: NumMedia && parseInt(NumMedia) > 0 ? MediaUrl0 : null,
      },
    });

    console.log("Message saved from", fromNumber, "to", toNumber);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
