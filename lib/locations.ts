export const opportunityLocations = [
  {
    value: "",
    label: "Any location",
    detail: "Keep your options open",
    remote: false,
  },
  {
    value: "Remote",
    label: "Remote",
    detail: "Work from anywhere",
    remote: true,
  },
  { value: "Kigali", label: "Kigali", detail: "Rwanda", remote: false },
  { value: "Nairobi", label: "Nairobi", detail: "Kenya", remote: false },
  {
    value: "Cape Town",
    label: "Cape Town",
    detail: "South Africa",
    remote: false,
  },
  { value: "Accra", label: "Accra", detail: "Ghana", remote: false },
] as const;
export function locationOptionIndex(value: string) {
  const index = opportunityLocations.findIndex(
    (option) => option.value === value,
  );
  return index < 0 ? 0 : index;
}
export function moveLocationOption(index: number, key: string) {
  const last = opportunityLocations.length - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (key === "ArrowDown") return (index + 1) % (last + 1);
  if (key === "ArrowUp") return (index + last) % (last + 1);
  return index;
}
