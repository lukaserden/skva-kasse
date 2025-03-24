import React, { useEffect, useState } from "react";

interface DelayedSkeletonProps {
  delay?: number;
  children: React.ReactNode;
}

export default function DelayedSkeleton({
  delay = 150,
  children,
}: DelayedSkeletonProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return show ? <>{children}</> : null;
}