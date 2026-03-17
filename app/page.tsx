"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("gpt-5.4");

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar 
        selectedModelId={selectedModel} 
        onSelectModel={setSelectedModel} 
      />
      <ChatArea selectedModelId={selectedModel} />
    </main>
  );
}
