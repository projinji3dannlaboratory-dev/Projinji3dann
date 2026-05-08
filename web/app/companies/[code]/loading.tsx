import { Card } from "@/components/ui/card";

export default function CompanyLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
      <Card className="h-48 animate-pulse" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-[280px] animate-pulse" />
        <Card className="h-[440px] animate-pulse" />
      </div>
    </div>
  );
}
