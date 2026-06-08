export const isValidUrl = (url: string): boolean => {
  const value = url.trim();

  if (!value || /\s/.test(value)) {
    return false;
  }

  try {
    const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(value)
      ? value
      : `https://${value}`;
    const parsed = new URL(candidate);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname;
    const domainPattern =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
    const ipv4Pattern =
      /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.|$)){4}$/;

    return (
      hostname === "localhost" ||
      domainPattern.test(hostname) ||
      ipv4Pattern.test(hostname)
    );
  } catch (e) {
    return false;
  }
};
