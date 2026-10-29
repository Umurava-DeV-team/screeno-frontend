import { Search } from "lucide-react";
import LocationSelect from "./LocationSelect";
export default function HeroSearch({
  query = "",
  location = "",
}: {
  query?: string;
  location?: string;
}) {
  return (
    <form
      action="/opportunities"
      method="GET"
      role="search"
      aria-label="Find an opportunity"
      className="ts-hero-search"
    >
      <button
        type="submit"
        aria-label="Search opportunities"
        className="ts-hero-search-button"
      >
        <Search size={18} strokeWidth={2.4} />
      </button>
      <label className="ts-hero-query">
        <span className="sr-only">Job title or keyword</span>
        <input
          key={query}
          name="q"
          type="search"
          defaultValue={query}
          placeholder="Job title or keyword"
          maxLength={120}
        />
      </label>
      <LocationSelect key={location} initialValue={location} />
    </form>
  );
}
