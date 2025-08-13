import { useEffect, useState } from "react";
import { PayloadCard } from "@/components/payloadCard";

export default function XSSPage() {
  const [xssAlert, setXssAlert] = useState("");
  const [customAlert, setCustomAlert] = useState("");
  const [xssSwfFuzz, setXssSwfFuzz] = useState("");

  useEffect(() => {
    fetch("/xss/xss_alert.txt")
      .then((res) => res.text())
      .then((text) => setXssAlert(text));

    fetch("/xss/custom_xss.txt")
      .then((res) => res.text())
      .then((text) => setCustomAlert(text));

    fetch("/xss/xss_swf_fuzz.txt")
      .then((res) => res.text())
      .then((text) => setXssSwfFuzz(text));
  }, []);

  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayloadCard title="CUSTOM_XSS()" payload={customAlert} />
        <PayloadCard title="XSS_ALERT()" payload={xssAlert} />
        <PayloadCard title="XSS_SWF_FUZZ()" payload={xssSwfFuzz} />
      </div>
    </div>
  );
}
