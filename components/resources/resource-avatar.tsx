import { UserRound } from "lucide-react";

export function ResourceAvatar({ name, photoUrl }: { name: string; photoUrl?: string | null }) {
  if (photoUrl) {
    return (
      // Resource photos can come from customer storage, Supabase, or provider imports.
      <img
        src={photoUrl}
        alt=""
        className="h-14 w-14 rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="grid h-14 w-14 place-items-center rounded-lg bg-secondary text-secondary-foreground">
      <UserRound className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only">{name}</span>
    </div>
  );
}
