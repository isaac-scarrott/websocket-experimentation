import { uuid } from "uuidv4";
import type { AppProps } from "next/app";
import { useState } from "react";
import Connector from "@/context/Connection";

export default function App({ Component, pageProps }: AppProps) {
  const [userUid] = useState<string>(uuid());
  return (
    <Connector>
      <Component {...pageProps} userUid={userUid} />
    </Connector>
  );
}
