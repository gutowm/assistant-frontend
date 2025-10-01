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

    // We are expecting only text messages from backend
    const lastMessageContentPart = messages[messages.length - 1].content[0];
    let payloadData: { text: string } | null = null;
    let body: string | null = null;
    if (lastMessageContentPart.type === 'text') {
      // Safely create the payloadData object
      payloadData = {
        text: lastMessageContentPart.text,
      };
    } else {
        payloadData = {
        text: "ERROR: received non-text respose from backend.",
      }
    }
    // Stringify the data and assign it to the 'body' variable
    body = JSON.stringify(payloadData);

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
      body: body,
      
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