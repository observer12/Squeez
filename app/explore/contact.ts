export function businessPhone(value?: string) {
  return value?.split(/[;,]/).map(part => part.trim()).find(part =>
    /^\+?[\d().\s-]+$/.test(part) && /^\+?\d{7,15}$/.test(part.replace(/[^\d+]/g, ""))
  );
}

export function businessEmail(value?: string) {
  return value?.split(/[;,]/).map(part => part.trim()).find(part =>
    /^[^\s@?&#:]+@[^\s@?&#:]+\.[^\s@?&#:]+$/.test(part)
  );
}

export function hasBusinessContact(location: { phone?: string; email?: string }) {
  return Boolean(businessPhone(location.phone) && businessEmail(location.email));
}

export function phoneHref(value: string) {
  return `tel:${value.replace(/[^\d+]/g, "")}`;
}
