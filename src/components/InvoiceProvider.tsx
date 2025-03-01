'use client'

import React, { useState, useEffect, useContext } from "react";
import { z } from "zod";
import { useAuth } from "./AuthProvider";

export const ExpenseSchema = z.object({
  lineAmount: z.number().positive(),
  department: z.string().min(1),
  account: z.string().min(1),
  location: z.string(),
  description: z.string().min(1)
});

export const InvoiceSchema = z.object({
  invoiceId: z.string(),
  vendor: z.string().min(1),
  vendorAddress: z.string(),
  purchaseOrderNumber: z.string(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().min(1),
  invoiceDueDate: z.string().min(1),
  glPostDate: z.string(),
  paymentTerms: z.string(),
  totalAmount: z.number().positive(),
  invoiceDescription: z.string(),
  expenses: z.array(ExpenseSchema).min(1),
  comments: z.string()
});

export type InvoiceValues = z.infer<typeof InvoiceSchema>;

type InvoiceContextType = {
  invoices: InvoiceValues[];
  addInvoice: (data: InvoiceValues) => void;
  updateInvoice: (invoiceId: string, updatedData: Partial<InvoiceValues>) => void;
  deleteInvoice: (invoiceId: string) => void;
};

export const InvoiceContext = React.createContext<InvoiceContextType | undefined>(undefined);

const InvoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();
  const userEmail = auth?.email;
  const storageKey = `invoices_${userEmail}`;
  
  const [invoices, setInvoices] = useState<InvoiceValues[]>(() => {
    if (userEmail) {
      const storedInvoices = localStorage.getItem(storageKey);
      return storedInvoices ? JSON.parse(storedInvoices) : [];
    }
    return [];
  });

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(storageKey, JSON.stringify(invoices));
    }
  }, [invoices, userEmail]);

  const addInvoice = (data: InvoiceValues) => {
    setInvoices((prev) => [...prev, data]);
  };

  const updateInvoice = (invoiceId: string, updatedData: Partial<InvoiceValues>) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.invoiceNumber === invoiceId ? { ...invoice, ...updatedData } : invoice
      )
    );
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((invoice) => invoice.invoiceNumber !== invoiceId));
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoiceContext = () => {
  return useContext(InvoiceContext);
}

export default InvoiceProvider;
