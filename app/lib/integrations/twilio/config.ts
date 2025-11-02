import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_ACCOUNT_SECRET

if(!accountSid || !authToken){
    console.log("Empty credentials for twilio")
}

export const twilioClient = twilio(accountSid, authToken);

export function validateWebhook(
    signature: string,
    url: string,
    params: Record<string, any>
  ): boolean {
    return twilio.validateRequest(
      authToken!,
      signature,
      url,
      params
    );
  }