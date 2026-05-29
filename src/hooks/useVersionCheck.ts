
import { useEffect, useState } from "react";

export default function useVersionCheck(intervalMs = 60 * 1000) {
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);

  useEffect(() => {
    let latestVersion: string | null = null;
    let isMounted = true;

    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();
        const nextVersion = data?.version;

        if (!nextVersion) {
          return;
        }

        if (!latestVersion) {
          latestVersion = nextVersion;
          return;
        }

        if (nextVersion !== latestVersion && isMounted) {
          setUpdateAvailable(true);
        }
      } catch (error) {
        console.log("Version check failed", error);
      }
    };

    checkVersion();
    const intervalId = setInterval(checkVersion, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [intervalMs]);

  return { updateAvailable };
}
