import {
  Body,
  Font,
  Head,
  Html,
  Preview,
  Tailwind,
} from "@react-email/components";
import tailwindConfig from "../../tailwind.config";
import React from "react";
import * as React from "react";

export interface DefaultLayoutProps {
  previewText: string;
  children: React.ReactNode;
}
export const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  previewText = "Leo Hours",
  children,
}) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Tailwind config={tailwindConfig}>
      <Head>
        <Font
          fontFamily="Raleway"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPNyC0ITw.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Raleway"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPNyCIIT5lu.woff2",
            format: "woff2",
          }}
          fontWeight={700}
          fontStyle="bold"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body>{children}</Body>
    </Tailwind>
  </Html>
);
