import {
  Button,
  Column,
  Container,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { DefaultLayout } from "../src/layouts/default";
import { z } from "zod";

export const ReminderEmailSchema = z.object({
  type: z.literal("ReminderEmail"),
  memberName: z.string(),
  title: z.string(),
  description: z.string(),
  scheduledDate: z.string(),
  scheduledStartTime: z.string(),
  scheduledEndTime: z.string().optional(),
  url: z.string(),
});

export const ReminderEmail: React.FC<z.infer<typeof ReminderEmailSchema>> = ({
  memberName = "John Doe",
  title = "Neo Hours",
  description = "This is a reminder for your upcoming event.",
  scheduledDate = "2022-01-01",
  scheduledStartTime = "12:00 PM",
  scheduledEndTime = "1:00 PM",
  url = "https://example.com",
}) => {
  return (
    <DefaultLayout previewText={"Reminder: Upcoming Event"}>
      <Container className="border-border mx-auto my-[40px] max-w-[465px] rounded-xl border border-solid p-[20px]">
        <Section>
          <Row>
            <Column className="text-center">
              <Heading className="text-2xl font-bold">
                Reminder: Upcoming Event
              </Heading>
              <Text className="text-lg">Neo Hours</Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text className="text-lg font-bold">Hi {memberName},</Text>
              <Text>
                This is a reminder for the upcoming {title} event. Please see
                the details below.
              </Text>
            </Column>
          </Row>
        </Section>
        <Section>
          <Row>
            <Column>
              <Text className="text-lg font-bold">Event Details</Text>
              <Text>
                <b>Title:</b> {title}
              </Text>
              <Text>
                <b>Description:</b> {description}
              </Text>
              <Text>
                <b>Date:</b> {scheduledDate}
              </Text>
              <Text>
                <b>Time:</b>{" "}
                {scheduledEndTime
                  ? `${scheduledStartTime} - ${scheduledEndTime}`
                  : scheduledStartTime}
              </Text>
            </Column>
          </Row>
        </Section>
        <Section>
          <Row>
            <Column>
              <Button
                className="bg-button text-primary-foreground outline-border rounded-xl p-[10px] outline outline-1"
                href={url}
              >
                View Event
              </Button>
            </Column>
          </Row>
        </Section>
      </Container>
    </DefaultLayout>
  );
};

export default ReminderEmail;
