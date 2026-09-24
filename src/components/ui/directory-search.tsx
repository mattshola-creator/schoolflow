import { Search } from "lucide-react";
import { fieldClass } from "@/components/auth-card";
import { Button } from "./button";

type DirectorySearchProps = {
  defaultValue: string;
  id: string;
  label: string;
  placeholder: string;
};

export function DirectorySearch({
  defaultValue,
  id,
  label,
  placeholder,
}: DirectorySearchProps) {
  return (
    <form
      className="mt-7 grid max-w-xl gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
      role="search"
    >
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={`${fieldClass} mt-0`}
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
      <Button type="submit" variant="secondary">
        <Search aria-hidden="true" className="size-4" /> Search
      </Button>
    </form>
  );
}
