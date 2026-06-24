import Link from "next/link";

export function AuthLayout({
  children,
  eyebrow
}: {
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.16),transparent_34rem)] px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between py-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">VB</span>
            <span>VendoBird</span>
          </Link>
          {eyebrow ? <span className="text-sm text-muted-foreground">{eyebrow}</span> : null}
        </header>
        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[1fr_30rem]">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">AI-powered operations</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal text-foreground sm:text-5xl">
              One secure account layer for every service workflow.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Business teams, providers, dispatchers, resources, and clients get the right
              workspace the moment they sign in.
            </p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
