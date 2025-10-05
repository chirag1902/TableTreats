import { useState } from "react";
export default function PasswordField({ label, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <label className="block mb-4">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="relative mt-1">
        <input
          type={show ? "text" : "password"}
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-2 text-xs text-orange-600"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}