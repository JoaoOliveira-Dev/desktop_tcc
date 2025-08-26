import { useState, useEffect } from "react";
import { PayloadCard } from "../components/payloadCard";

export default function ForbidenBypassPage() {
  const [forbiden, setForbiden] = useState("");

  useEffect(() => {
    fetch("/bypass/forbiden_bypass.txt")
      .then((res) => res.text())
      .then((text) => setForbiden(text));

  }, []);

  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayloadCard title="403_BYPASS()" payload={forbiden} />
      </div>
    </div>
  );
}
