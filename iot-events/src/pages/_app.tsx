import { uuid } from "uuidv4";
import type { AppProps } from "next/app";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [userUid] = useState<string>(uuid());
  return <Component {...pageProps} userUid={userUid} />;
}
