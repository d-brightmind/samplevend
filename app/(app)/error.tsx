"use client";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="error">Something went wrong while loading this workspace.</Alert>
        <Button onClick={reset} className="w-full">Try again</Button>
      </div>
    </main>
  );
}
