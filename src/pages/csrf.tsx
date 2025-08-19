import { useState, useEffect } from "react";
import { PayloadCard } from "../components/payloadCard";

export default function CSRFPage() {
  const [csrfForms, setCsrfForms] = useState("");
  const [csrfScript, setCsrfScript] = useState("");
  const [csrfIframe, setCsrfIframe] = useState("");

  useEffect(() => {
    fetch("/csrf/csrf_forms.txt")
      .then((res) => res.text())
      .then((text) => setCsrfForms(text));

    fetch("/csrf/csrf_script.txt")
      .then((res) => res.text())
      .then((text) => setCsrfScript(text));

    fetch("/csrf/csrf_iframe.txt")
      .then((res) => res.text())
      .then((text) => setCsrfIframe(text));
  }, []);

  return (
    <div className="p-6 space-y-6 w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PayloadCard title="CSRF_FORMS()" payload={csrfForms} />
        <PayloadCard title="CSRF_SCRIPT()" payload={csrfScript} />
        <PayloadCard title="CSRF_Iframe()" payload={csrfIframe} />
      </div>
    </div>
  );
}
