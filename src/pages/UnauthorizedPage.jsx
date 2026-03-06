import React from "react";
import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="mb-6">You do not have permission to view this page.</p>
        <Link
          to="/projects"
          className="text-indigo-600 hover:underline font-semibold"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
