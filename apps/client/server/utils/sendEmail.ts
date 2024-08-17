interface BrevoSettings {
  to: string;
  subject: string;
  html: string;
}
interface BrevoResponse {
  event: string;
  email: string;
  id: number;
  date: string;
  ts: number;
  "message-id": string;
  ts_event: number;
  subject: string;
  tag: string;
  sending_ip: string;
  ts_epoch: number;
  tags: string[];
}

const config = useRuntimeConfig();

export async function sendEmail({ to, subject, html }: BrevoSettings): Promise<{
  data: BrevoResponse | null;
  message: string;
  success: boolean;
}> {
  try {
    const body = {
      sender: {
        name: "Leo Club Hours",
        email: config.brevo.senderEmail,
      },
      to: [
        {
          name: `${to.split("@")[0]} ${to.split("@")[1]}`,
          email: to,
        },
      ],
      subject,
      htmlContent: html,
    };
    const res = await $fetch<BrevoResponse>(
      "https://api.brevo.com/v3/smtp/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": config.brevo.apiKey,
          accept: "application/json",
        },
        body,
      }
    );
    return {
      success: true,
      data: res,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      data: null,
      message: "An error occurred",
    };
  }
}
