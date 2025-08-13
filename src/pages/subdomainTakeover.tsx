import { useState, useEffect } from "react";
import { PayloadCard } from "@/components/payloadCard";

export default function SubdomainTakeoverPage() {
  const [takeover, setTakeover] = useState("");

  useEffect(() => {
    fetch("/subdomain-takeover/takeover1.txt")
      .then((res) => res.text())
      .then((text) => setTakeover(text));
  }, []);

  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayloadCard title="SUBS_TAKEOVER()" payload={takeover} />
      </div>
    </div>
  );
}
