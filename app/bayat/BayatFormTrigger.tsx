"use client";

import { useState } from "react";
import BayatModal from "@/components/BayatModal";

export default function BayatFormTrigger() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-muted-gold py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gold-hover sm:w-auto sm:px-8"
      >
        Perform Bayat
      </button>
      {open && <BayatModal onClose={() => setOpen(false)} />}
    </>
  );
}
