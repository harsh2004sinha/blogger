"use client";

import React, { useRef, useState, useEffect } from "react";

type SendState = "idle" | "sending" | "success" | "error";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General");
  const [message, setMessage] = useState("");
  const [subscribe, setSubscribe] = useState(true);
  const [preferred, setPreferred] = useState<"email" | "phone">("email");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendState, setSendState] = useState<SendState>("idle");

  const fileRef = useRef<HTMLInputElement | null>(null);

  // create object URL for preview (if image)
  useEffect(() => {
    if (!attachment) {
      setAttachmentPreview(null);
      return;
    }
    if (attachment.type.startsWith("image/")) {
      const url = URL.createObjectURL(attachment);
      setAttachmentPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAttachmentPreview(null);
    }
  }, [attachment]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required.";
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Please enter a valid email address.";
    if (!message.trim()) e.message = "Message can't be empty.";
    else if (message.trim().length < 10) e.message = "Message must be at least 10 characters.";
    if (phone && !/^[\d+\-\s()]{7,20}$/.test(phone)) e.phone = "Enter a valid phone number.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSubject("General");
    setMessage("");
    setSubscribe(true);
    setPreferred("email");
    setAttachment(null);
    if (fileRef.current) fileRef.current.value = "";
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setAttachment(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // simulate sending
    setSendState("sending");
    try {
      // ---- Replace below with actual API call ----
      // Example:
      // const formData = new FormData();
      // formData.append("name", name); ...
      // if (attachment) formData.append("file", attachment);
      // await fetch("/api/contact", { method: "POST", body: formData });
      await new Promise((res) => setTimeout(res, 900));
      // -------------------------------------------

      setSendState("success");
      resetForm();

      // auto-hide success after 3s
      setTimeout(() => setSendState("idle"), 3000);
    } catch (err) {
      console.error(err);
      setSendState("error");
      setTimeout(() => setSendState("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-gray-700 pt-32 dark:from-gray-900 dark:to-gray-800 py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: FORM */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Contact Us</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
            Have a question or want to collaborate? Send us a message — we’ll get back within 1-2 business days.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-2 rounded-lg border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                    errors.name ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200"
                  }`}
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && <span id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</span>}
              </label>

              {/* Email */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-2 rounded-lg border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                    errors.email ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200"
                  }`}
                  placeholder="you@domain.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && <span id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</span>}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Phone (optional)</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`mt-2 rounded-lg border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                    errors.phone ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200"
                  }`}
                  placeholder="+1 555 555 555"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                />
                {errors.phone && <span id="phone-error" className="text-xs text-red-600 mt-1">{errors.phone}</span>}
              </label>

              {/* Subject */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Subject</span>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2 rounded-lg border px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 border-gray-200 focus:ring-blue-200"
                >
                  <option>General</option>
                  <option>Partnership</option>
                  <option>Technical Support</option>
                  <option>Press</option>
                </select>
              </label>
            </div>

            {/* Message */}
            <label className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Message</span>
                <span className="text-xs text-gray-400">{message.length}/2000</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                rows={6}
                className={`mt-2 rounded-lg border px-3 py-2 resize-y bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 ${
                  errors.message ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200"
                }`}
                placeholder="Tell us what you need help with..."
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
              />
              {errors.message && <span id="message-error" className="text-xs text-red-600 mt-1">{errors.message}</span>}
            </label>

            {/* Attachment + preferences */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Attachment (optional)</label>
                <div className="mt-2 flex items-center gap-3">
                  <input ref={fileRef} type="file" onChange={handleFileChange} className="hidden" accept="image/*,application/pdf" id="file-input"/>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 bg-gray-50 dark:bg-gray-900 text-sm"
                  >
                    Choose file
                  </button>

                  {attachment ? (
                    <div className="flex items-center gap-3">
                      {attachmentPreview ? (
                        <img src={attachmentPreview} alt="attachment-preview" className="h-12 w-12 rounded-md object-cover border" />
                      ) : (
                        <div className="h-12 w-12 rounded-md flex items-center justify-center text-xs bg-gray-100 border">
                          {attachment.name.split(".").pop()?.toUpperCase() || "FILE"}
                        </div>
                      )}
                      <div className="text-sm">
                        <div className="font-medium text-gray-700 dark:text-gray-200">{attachment.name}</div>
                        <div className="text-xs text-gray-400">{(attachment.size / 1024).toFixed(0)} KB</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { setAttachment(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="text-xs text-red-600 px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400">PNG/JPG/PDF, up to 5MB</div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-56 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">Preferences</div>

                <div className="mt-3 flex flex-col gap-2">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={subscribe} onChange={(e) => setSubscribe(e.target.checked)} className="rounded border-gray-300"/>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Subscribe to newsletter</span>
                  </label>

                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Preferred contact</div>
                  <div className="flex gap-2 mt-1">
                    <label className={`px-2 py-1 rounded border text-sm cursor-pointer ${preferred === "email" ? "bg-white dark:bg-gray-800 border-blue-200" : "bg-transparent"}`}>
                      <input type="radio" name="preferred" value="email" checked={preferred === "email"} onChange={() => setPreferred("email")} className="hidden" />
                      Email
                    </label>
                    <label className={`px-2 py-1 rounded border text-sm cursor-pointer ${preferred === "phone" ? "bg-white dark:bg-gray-800 border-blue-200" : "bg-transparent"}`}>
                      <input type="radio" name="preferred" value="phone" checked={preferred === "phone"} onChange={() => setPreferred("phone")} className="hidden" />
                      Phone
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="submit"
                disabled={sendState === "sending"}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white font-medium transition ${
                  sendState === "sending" ? "bg-blue-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {sendState === "sending" ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="3 3 18 18">
                    <path className="opacity-25" d="M12 3v4"></path>
                    <path d="M21 12A9 9 0 1 1 3 12"></path>
                  </svg>
                ) : null}
                Send Message
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg px-4 py-2 border bg-white dark:bg-gray-900"
              >
                Reset
              </button>

              <div className="text-sm text-gray-500 ml-auto">
                {sendState === "success" && <span className="text-green-600">Message sent — thanks!</span>}
                {sendState === "error" && <span className="text-red-600">Failed to send. Try again.</span>}
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: contact info + map */}
        <aside className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Contact Info</h4>
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <div><span className="font-medium">Email:</span> support@example.com</div>
              <div><span className="font-medium">Phone:</span> +1 555 321 987</div>
              <div><span className="font-medium">Office:</span> 123 Baker St, San Francisco, CA</div>
            </div>

            <div className="mt-4">
              <a href="mailto:support@example.com" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm">
                Email Support
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden shadow">
            <div className="h-40 w-full">
              {/* Placeholder map — replace src with your Google Maps embed if needed */}
              <iframe
                className="w-full h-full"
                src="https://maps.google.com/maps?q=San%20Francisco&t=&z=13&ie=UTF8&iwloc=&output=embed"
                title="Office location"
                loading="lazy"
              />
            </div>
            <div className="p-3 text-xs text-gray-500 dark:text-gray-400">
              Our office — drop by during business hours.
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow text-sm text-gray-600 dark:text-gray-300">
            <strong>Working hours:</strong>
            <div className="mt-1">Mon–Fri: 9:00 AM — 6:00 PM</div>
            <div className="mt-2 text-xs">We reply to most messages within 24–48 hours.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
