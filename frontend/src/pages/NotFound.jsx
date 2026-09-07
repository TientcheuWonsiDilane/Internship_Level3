import React from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import Footer from "../components/Footer";

const NotFound = () => (
  <>
  <PageShell title="Page not found" subtitle="That route does not exist in Matrix.">
    <Link
      to="/dashboard"
      className="inline-flex px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold">
      Back to Dashboard
    </Link>
  </PageShell>
  <Footer />
  </>
);

export default NotFound;

