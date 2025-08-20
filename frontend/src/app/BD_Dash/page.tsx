"use client";
import { useSearchParams } from "next/navigation"; // ✅ Import it
import Sidebar from "./sidebar";

export default function Dashboard_Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email"); // ✅ get email from URL

  return (
    <div className="flex-1 p-4 bg-gray-100 h-screen">
      <Sidebar />
      <p>Welcome, {email}</p>
    </div>
  );
}
