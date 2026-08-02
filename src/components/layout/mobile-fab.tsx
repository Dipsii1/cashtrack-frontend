"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/features/transactions/transaction-form";
import { WalletForm } from "@/features/wallets/wallet-form";

export function MobileFAB() {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<"transaction" | "wallet">("transaction");

  return (
    <div className="fixed bottom-5 right-5 z-40 lg:hidden">
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Sheet open={open} onOpenChange={setOpen}>
          <Button
            size="icon"
            onClick={() => {
              setForm("transaction");
              setOpen(true);
            }}
            className="h-14 w-14 rounded-2xl shadow-xl shadow-primary/30"
            aria-label="Tambah"
          >
            <Plus className="h-6 w-6" />
          </Button>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetTitle className="text-lg">
              {form === "transaction" ? "Tambah Transaksi" : "Tambah Dompet"}
            </SheetTitle>
            {form === "transaction" ? (
              <TransactionForm onSuccess={() => setOpen(false)} />
            ) : (
              <WalletForm onSuccess={() => setOpen(false)} />
            )}
          </SheetContent>
        </Sheet>
      </motion.div>
    </div>
  );
}