"use client";

import { useState } from "react";
import * as fieldTemplates from "../../data/mock";
import {
  blankLike,
  fieldLabel,
  isLongText,
  itemSummary,
  moveItem,
} from "./adminConfig";
import { buttonClass, Icon, IconButton, inputClass, labelClass } from "./ui";

// Generic editor: builds form fields from the shape of the data
// (text, numbers, lists and nested objects), so every mock section is editable.

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const isComplex = (value) => Array.isArray(value) || isPlainObject(value);

function PrimitiveInput({ id, fieldKey, value, onChange }) {
  if (typeof value === "number") {
    return (
      <input
        id={id}
        type="number"
        step="any"
        value={value}
        onChange={(event) =>
          onChange(event.target.value === "" ? 0 : Number(event.target.value))
        }
        className={inputClass}
      />
    );
  }

  if (typeof value === "boolean") {
    return (
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="size-5 accent-[#24503a]"
      />
    );
  }

  const text = value ?? "";
  if (isLongText(fieldKey, text)) {
    return (
      <textarea
        id={id}
        rows={3}
        value={text}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} min-h-24 resize-y leading-relaxed`}
      />
    );
  }

  return (
    <input
      id={id}
      type="text"
      value={text}
      onChange={(event) => onChange(event.target.value)}
      className={inputClass}
    />
  );
}

function PrimitiveListEditor({ idPrefix, fieldKey, items, template: itemTemplate, onChange }) {
  const template = typeof (items[0] ?? itemTemplate) === "number" ? 0 : "";
  const update = (index, next) =>
    onChange(items.map((item, i) => (i === index ? next : item)));

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <span className="w-6 shrink-0 pr-1 text-right text-xs font-semibold text-[#a4a39b]">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <PrimitiveInput
              id={`${idPrefix}-${index}`}
              fieldKey={fieldKey}
              value={item}
              onChange={(next) => update(index, next)}
            />
          </div>
          <IconButton
            label="Yuxarı daşı"
            icon="up"
            disabled={index === 0}
            onClick={() => onChange(moveItem(items, index, index - 1))}
          />
          <IconButton
            label="Aşağı daşı"
            icon="down"
            disabled={index === items.length - 1}
            onClick={() => onChange(moveItem(items, index, index + 1))}
          />
          <IconButton
            label="Sil"
            icon="trash"
            danger
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, template])}
        className={buttonClass.add}
      >
        <Icon name="plus" /> Sətir əlavə et
      </button>
    </div>
  );
}

function ObjectListEditor({ idPrefix, items, template, onChange }) {
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggle = (index) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const update = (index, next) =>
    onChange(items.map((item, i) => (i === index ? next : item)));

  const duplicate = (index) =>
    onChange([
      ...items.slice(0, index + 1),
      structuredClone(items[index]),
      ...items.slice(index + 1),
    ]);

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {items.map((item, index) => {
          const open = !collapsed.has(index);
          return (
            <li
              key={index}
              className="overflow-hidden rounded-xl border border-[#16201b]/10 bg-[#faf9f6]"
            >
              <div className="flex items-center gap-0.5 py-1.5 pl-1.5 pr-1.5">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggle(index)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-[#16201b]/5"
                >
                  <Icon
                    name="chevron"
                    className={`size-4 shrink-0 text-[#77766f] transition-transform ${
                      open ? "rotate-90" : ""
                    }`}
                  />
                  <span className="shrink-0 text-xs font-semibold text-[#a4a39b]">
                    #{index + 1}
                  </span>
                  <span className="truncate text-sm font-semibold">
                    {itemSummary(item)}
                  </span>
                </button>
                <IconButton
                  label="Yuxarı daşı"
                  icon="up"
                  disabled={index === 0}
                  onClick={() => onChange(moveItem(items, index, index - 1))}
                />
                <IconButton
                  label="Aşağı daşı"
                  icon="down"
                  disabled={index === items.length - 1}
                  onClick={() => onChange(moveItem(items, index, index + 1))}
                />
                <IconButton
                  label="Kopyala"
                  icon="copy"
                  onClick={() => duplicate(index)}
                />
                <IconButton
                  label="Sil"
                  icon="trash"
                  danger
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                />
              </div>

              {open && (
                <div className="border-t border-[#16201b]/10 bg-white px-4 py-4 max-md:px-3">
                  <ObjectFields
                    idPrefix={`${idPrefix}-${index}`}
                    value={item}
                    template={template}
                    onChange={(next) => update(index, next)}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={() => onChange([...items, blankLike(items[0] ?? template ?? {})])}
        className={buttonClass.add}
      >
        <Icon name="plus" /> Element əlavə et
      </button>
    </div>
  );
}

export function ObjectFields({ idPrefix, value, template, onChange }) {
  const entries = Object.entries(value);
  const simple = entries.filter(([, fieldValue]) => !isComplex(fieldValue));
  const complex = entries.filter(([, fieldValue]) => isComplex(fieldValue));
  const set = (key, next) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-5">
      {simple.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {simple.map(([key, fieldValue]) => {
            const id = `${idPrefix}-${key}`;
            const wide =
              typeof fieldValue === "string" && isLongText(key, fieldValue);
            return (
              <div key={key} className={wide ? "sm:col-span-2" : undefined}>
                <label htmlFor={id} className={labelClass}>
                  {fieldLabel(key)}
                </label>
                <PrimitiveInput
                  id={id}
                  fieldKey={key}
                  value={fieldValue}
                  onChange={(next) => set(key, next)}
                />
              </div>
            );
          })}
        </div>
      )}

      {complex.map(([key, fieldValue]) => (
        <fieldset
          key={key}
          className="rounded-xl border border-[#16201b]/10 px-4 pb-4 pt-2 max-md:px-3 max-md:pb-3"
        >
          <legend className="px-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#24503a]">
            {fieldLabel(key)}
          </legend>
          <ValueEditor
            idPrefix={`${idPrefix}-${key}`}
            fieldKey={key}
            value={fieldValue}
            template={template?.[key]}
            onChange={(next) => set(key, next)}
          />
        </fieldset>
      ))}
    </div>
  );
}

export function ValueEditor({ idPrefix, fieldKey, value, template = fieldTemplates[fieldKey], onChange }) {
  if (Array.isArray(value)) {
    const itemTemplate = template?.[0];
    const isObjectList = value.length > 0 ? value.every(isPlainObject) : isPlainObject(itemTemplate);
    return isObjectList ? (
      <ObjectListEditor idPrefix={idPrefix} items={value} template={itemTemplate} onChange={onChange} />
    ) : (
      <PrimitiveListEditor
        idPrefix={idPrefix}
        fieldKey={fieldKey}
        items={value}
        template={itemTemplate}
        onChange={onChange}
      />
    );
  }

  if (isPlainObject(value)) {
    return <ObjectFields idPrefix={idPrefix} value={value} template={template} onChange={onChange} />;
  }

  return (
    <PrimitiveInput
      id={idPrefix}
      fieldKey={fieldKey}
      value={value}
      onChange={onChange}
    />
  );
}
