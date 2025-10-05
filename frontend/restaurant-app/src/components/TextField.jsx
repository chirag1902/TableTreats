export default function TextField({ label, ...props }) {
  return (
    <label className="block mb-4">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <input
        className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        {...props}
      />
    </label>
  );
}