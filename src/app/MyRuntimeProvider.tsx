"use client";

import type { ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";


const BackendUrl = process.env.BACKEND_URL;

const MyModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {

    let result = new Response(JSON.stringify({ text: "BACKEND_URL is not set" }), {
    headers: { "Content-Type": "application/json" }
    });

    if (BackendUrl){
      result = await fetch(BackendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // forward the messages in the chat to the API
      body: JSON.stringify({
        text: messages[messages.length-1].content[0].text, // forward only last message
      }),
      // if the user hits the "cancel" button or escape keyboard key, cancel the request
      signal: abortSignal,
      });
    }
     
    const data = await result.json();
    
    return {
      content: [
        {
          type: "text",
          text: data.text,
        },
      ],
    };
  },
};

export function MyRuntimeProvider({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const runtime = useLocalRuntime(MyModelAdapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}