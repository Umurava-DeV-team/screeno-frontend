"use client";
import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Globe2, ChevronDown, Check, ArrowUpRight } from "lucide-react";
import {
  locationOptionIndex,
  moveLocationOption,
  opportunityLocations,
} from "@/lib/locations";
export default function LocationSelect({
  initialValue = "",
}: {
  initialValue?: string;
}) {
  const [selected, setSelected] = useState(locationOptionIndex(initialValue));
  const [active, setActive] = useState(selected);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const id = useId();
  const current = opportunityLocations[selected];
  useEffect(() => {
    if (!open) return;
    list.current?.focus();
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  useEffect(() => {
    if (open)
      list.current?.children.item(active)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);
  function choose(index: number) {
    setSelected(index);
    setActive(index);
    setOpen(false);
    trigger.current?.focus();
  }
  return (
    <div
      ref={root}
      className="ts-location-control"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <input type="hidden" name="location" value={current.value} />
      <button
        ref={trigger}
        type="button"
        aria-haspopup="listbox"
        aria-controls={id}
        aria-expanded={open}
        aria-label={"Preferred location: " + current.label}
        className="ts-location-trigger"
        onClick={() => {
          setActive(selected);
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setActive(selected);
            setOpen(true);
          }
        }}
      >
        {current.remote ? (
          <Globe2 size={16} aria-hidden="true" />
        ) : (
          <MapPin size={16} aria-hidden="true" />
        )}
        <span>{current.label}</span>
        <ChevronDown
          size={13}
          className={open ? "rotate-180" : ""}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="ts-location-menu">
          <div className="ts-location-menu-heading">
            <div>
              <p>Find your place.</p>
              <span>A city, a team, a new beginning.</span>
            </div>
            <ArrowUpRight size={18} />
          </div>
          <ul
            id={id}
            ref={list}
            role="listbox"
            tabIndex={-1}
            aria-label="Preferred location"
            aria-activedescendant={id + "-" + active}
            className="ts-location-options"
            onKeyDown={(event) => {
              if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                setActive(moveLocationOption(active, event.key));
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                choose(active);
              } else if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                trigger.current?.focus();
              } else if (event.key === "Tab") setOpen(false);
            }}
          >
            {opportunityLocations.map((option, index) => (
              <li
                key={option.value}
                id={id + "-" + index}
                role="option"
                aria-selected={index === selected}
                className={
                  "ts-location-option " + (index === active ? "is-active" : "")
                }
                onPointerMove={() => setActive(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(index)}
              >
                <span className="ts-location-option-icon">
                  {option.remote ? <Globe2 size={16} /> : <MapPin size={16} />}
                </span>
                <span className="ts-location-option-copy">
                  <strong>{option.label}</strong>
                  <small>{option.detail}</small>
                </span>
                {index === selected && (
                  <Check size={16} className="text-brand" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
          <p className="ts-location-menu-footer">
            Choose the place that works for you.
          </p>
        </div>
      )}
    </div>
  );
}
