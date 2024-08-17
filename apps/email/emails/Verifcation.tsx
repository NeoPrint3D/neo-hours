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

export const VerificatonEmailSchema = z.object({
  type: z.literal("VerificatonEmail"),
  name: z.string(),
  email: z.string(),
  url: z.string(),
});

export const VerificatonEmail: React.FC<
  z.infer<typeof VerificatonEmailSchema>
> = ({
  name = "John Doe",
  email = "john@doe.com",
  url = "https://example.com/verify?token=123",
}) => {
  return (
    <DefaultLayout previewText={"Please verify email address"}>
      <Container className="border-border mx-auto my-[40px] max-w-[465px] rounded-xl border border-solid p-[20px]">
        <Section>
          <Row>
            <Column className="text-center">
              <Heading className="text-2xl font-bold">
                Verify Your Email Address
              </Heading>
              <Text className="text-lg">Leo Hours</Text>
            </Column>
          </Row>
          <Row>
            <Column>
              <Text className="text-lg font-bold">Hi {name},</Text>
              <Text>
                Please click the button below to login and verify {email} as
                your email address.
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
                Verify Email
              </Button>
            </Column>
          </Row>
        </Section>
      </Container>
    </DefaultLayout>
  );
};

export default VerificatonEmail;
