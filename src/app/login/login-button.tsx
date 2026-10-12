"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signIn.social({ provider: "github", callbackURL: "/" });
      }}
    >
      {pending ? "Redirigiendo…" : "Entrar con GitHub"}
    </Button>
  );
}
