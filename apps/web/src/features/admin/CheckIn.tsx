import { Card, PageHeader } from "./ui";

/** Placeholder until the print desk and scanner (build step 10) produce the scans this page will summarise. */
export function CheckIn() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Check-in & meals" />
      <Card className="max-w-[560px] p-8">
        <h2 className="text-lg font-bold text-ink-900">Opens with the scanner</h2>
        <p className="mt-2 text-[15px] leading-[1.5] text-ink-500">
          Gate, hall, meal and merchandise scans will be counted here once the print desk and scanner are in use. Nothing has been scanned
          yet.
        </p>
      </Card>
    </div>
  );
}
