import { useState, useEffect } from 'react';
import { PayloadCard } from "@/components/payloadCard";

export default function ClickJackingPage() {
  const [jacking1, setJacking1] = useState("");
  const [jacking2, setJacking2] = useState("");
  const [jacking3, setJacking3] = useState("");
  const [jacking4, setJacking4] = useState("");

  useEffect(() => {
    fetch("/clickjacking/click_jacking1.txt")
      .then((res) => res.text())
      .then((text) => setJacking1(text));

    fetch("/clickjacking/click_jacking2.txt")
      .then((res) => res.text())
      .then((text) => setJacking2(text));

    fetch("/clickjacking/click_jacking3.txt")
      .then((res) => res.text())
      .then((text) => setJacking3(text));

    fetch("/clickjacking/click_jacking_fullscreen.txt")
      .then((res) => res.text())
      .then((text) => setJacking4(text));
  }, []);

  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayloadCard title="Click_Jacking_1()" payload={jacking1} />
        <PayloadCard title="Click_Jacking_2()" payload={jacking2} />
        <PayloadCard title="Click_Jacking_3()" payload={jacking3} />
        <PayloadCard title="Click_Jacking_FullScreen()" payload={jacking4} />
      </div>
    </div>
  );
}