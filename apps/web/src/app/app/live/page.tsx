import { Radio } from "lucide-react";

export const metadata = { title: "Live — Jan. Conf 2027" };

// Placeholder until the live player and radio ship (build step 8).
export default function Page() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pt-[60px] text-center">
      <span className="flex size-14 items-center justify-center rounded-[22px] bg-cobalt-50 text-cobalt-700">
        <Radio size={28} />
      </span>
      <h1 className="text-[23px] font-bold text-cobalt-900">Live opens with the conference</h1>
      <p className="max-w-xs text-[15px] text-ink-500">Video and radio will appear here when the first session starts on 19 January.</p>
    </div>
  );
}
