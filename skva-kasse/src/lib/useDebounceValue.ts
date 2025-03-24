import { useEffect, useState } from "react";

/**
 * Gibt einen verzögerten Wert zurück, der erst nach Ablauf des Delays aktualisiert wird.
 * Ideal für Suchfelder mit API-Aufrufen.
 */
export default function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
