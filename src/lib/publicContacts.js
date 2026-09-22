import { isValidInternationalPhone } from "./phone.js";

// The sales phone and WhatsApp number are edited in the admin panel. Only the sample placeholder
// number from src/data/mock.js and malformed links are hidden, so a fresh install never advertises
// a number that reaches nobody.
const SAMPLE_NUMBER = "994500000000";

function usableTel(href) {
  if (!/^tel:/i.test(href ?? "")) return false;
  const number = href.slice(4).replace(/[\s()-]/g, "");
  return isValidInternationalPhone(number) && number !== `+${SAMPLE_NUMBER}`;
}

function usableWhatsApp(href) {
  const match = /^https?:\/\/(?:wa\.me|(?:api\.)?whatsapp\.com)\/(?:send\?phone=)?\+?(\d+)/i.exec(href ?? "");
  return Boolean(match) && match[1] !== SAMPLE_NUMBER && isValidInternationalPhone(`+${match[1]}`);
}

const keepLink = (link) => {
  if (/^tel:/i.test(link.href)) return usableTel(link.href);
  if (/wa\.me|whatsapp\.com/i.test(link.href)) return usableWhatsApp(link.href);
  return true;
};

export function withPublicContacts(content) {
  const office = content.contactPage.office;
  const phoneHref = usableTel(office.phoneHref) ? office.phoneHref : "";
  const whatsappHref = usableWhatsApp(office.whatsappHref) ? office.whatsappHref : "";
  const details = office.details.filter((detail) => {
    if (/whats\s*app/i.test(detail.label)) return Boolean(whatsappHref);
    if (/telefon|phone|телефон/i.test(detail.label) || /^\+?994/.test(detail.value)) return Boolean(phoneHref);
    return true;
  });
  const footer = { ...content.footer, links: content.footer.links.filter(keepLink) };
  if (Array.isArray(content.footer.actions)) footer.actions = content.footer.actions.filter(keepLink);
  return {
    ...content,
    contactPage: { ...content.contactPage, office: { ...office, phoneHref, whatsappHref, details } },
    footer,
  };
}
