import { Card } from "@/components/ui/card";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <div className="h-32 rounded-2xl bg-gradient-to-br from-amber-500/5 via-pink-500/5 to-sky-500/5 animate-pulse" />
      <Card className="my-6 h-32 animate-pulse" />
      <Card className="h-[60vh] animate-pulse" />
    </div>
  );
}
