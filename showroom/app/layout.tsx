import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../src/features/showroom/showroom.css";

export const metadata: Metadata = {
  title: "SchoolFlow — A school day, beautifully connected",
  description:
    "Explore twelve SchoolFlow dashboard designs, original decorative collections and interactive school-management visualizations. Fictional demonstration data only.",
  robots: { index: false, follow: false },
};

export default function ShowroomLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-NG">
      <body>{children}</body>
    </html>
  );
}
