import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import { z } from "zod";
import { withZodSchema } from "formik-validator-zod";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ArrowLeft, FileText, Upload, Loader2, Plus, DollarSign, Percent, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceSchema, InvoiceValues, useInvoiceContext } from "./InvoiceProvider";
import { useRouter } from "next/navigation";
import PdfReactPdf from "./PdfViewer";
import { useDropzone } from "react-dropzone";

const dummyValues: InvoiceValues = {
  invoiceId: Date.now().toString(),
  vendor: "ABC Supplies Pvt Ltd",
  vendorAddress: "123 Business Street, Hyderabad, India",
  purchaseOrderNumber: "PO-20250301-001",
  invoiceNumber: "INV-20250301-789",
  invoiceDate: "2025-03-01",
  invoiceDueDate: "2025-03-15",
  glPostDate: "2025-03-02",
  paymentTerms: "Net 15",
  totalAmount: 12500.50,
  invoiceDescription: "Office furniture and equipment purchase",
  expenses: [
    {
      lineAmount: 5000,
      department: "IT",
      account: "Equipment Purchase",
      location: "Hyderabad Office",
      description: "Laptops and accessories"
    },
    {
      lineAmount: 7500.50,
      department: "Operations",
      account: "Furniture",
      location: "Head Office",
      description: "Office chairs and desks"
    }
  ],
  comments: "Urgent processing required",
  status: "draft",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pdfUrl: "/sample-invoice.pdf"
};



const InvoiceForm: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("vendor");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const invoiceContext = useInvoiceContext();

  // Initial form values
  const initialValues: InvoiceValues = {
    invoiceId: Date.now().toString(),
    vendor: "",
    vendorAddress: "",
    purchaseOrderNumber: "",
    invoiceNumber: "",
    invoiceDate: "",
    invoiceDueDate: "",
    glPostDate: "",
    paymentTerms: "",
    totalAmount: 0,
    invoiceDescription: "",
    expenses: [{
      lineAmount: 0,
      department: "",
      account: "",
      location: "",
      description: ""
    }],
    comments: "",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pdfUrl: ""
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const showToast = (title: string, description: string, type: string = "default") => {
    toast({
      title,
      description,
      variant: type as "default" | "destructive",
    })
  }

  const formik = useFormik({
    initialValues,
    validate: withZodSchema(InvoiceSchema),
    onSubmit: (values, { setSubmitting }) => {
      try {
        // Save form data to localStorage
        invoiceContext?.addInvoice({ ...values, status: "pending" });
        showToast("Invoice saved", "Your invoice has been saved successfully.");
        formik.resetForm();
      } catch (error) {
        showToast("Error saving invoice", "There was an error saving your invoice. Please try again.", "destructive");
      } finally {
        setSubmitting(false);
      }
    },
    validateOnChange: true,
    validateOnMount: true,
  });
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      showToast("Invalid file", "Please upload a valid PDF file.", "destructive");
      return;
    }

    const file = acceptedFiles[0];
    formik.setValues({ ...formik.values, pdfUrl: URL.createObjectURL(file) });

    // Convert to base64 and store in localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string | null;
      if (base64) {
        try {
          if (base64.length > 5000000) {
            showToast("File too large", "Try a smaller file.", "destructive");
            return;
          }
          localStorage.setItem("invoicePdfData", base64);
          showToast("PDF uploaded", "Your PDF has been uploaded successfully and stored aas a draft");
        } catch (error) {
          showToast("Storage error", "PDF file is too large for localStorage.", "destructive");
        }
      } else {
        showToast("Upload failed", "Could not read the file.", "destructive");
      }
    };
    reader.readAsDataURL(file);
  };


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
  });

  useEffect(() => {
    const storedInvoice = localStorage.getItem("invoiceData") as string;
    let invoice = { pdfUrl : ""}
    if(storedInvoice){
      invoice = JSON.parse(storedInvoice);
    }
    const storedBase64 = localStorage.getItem("invoicePdfData");
    if(storedBase64){
      invoice.pdfUrl = storedBase64
    }
    formik.setValues(invoice as any);
  },[])
  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      <div className="flex items-center justify-between space-x-2">
        <button className="flex items-center text-gray-600 hover:text-gray-900" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back To Dashboard
        </button>

        <button className="flex items-center text-gray-600 hover:text-gray-900" onClick={() => {
          formik.setValues(dummyValues);
        }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Load Dummy Values
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PDF Upload Section */}
        <div className={`h-[80vh] overflow-auto ${isDragActive ? "bg-primary/10" : "bg-white hover:bg-gray-100"}`}  {...getRootProps()}>

          {formik.values.pdfUrl ? (
            <div className="w-full overflow-auto">
              <PdfReactPdf src={formik.values.pdfUrl as string}>

              </PdfReactPdf>

              {numPages && numPages > 1 && (
                <div className="flex justify-between mt-4">
                  <button
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                    disabled={pageNumber <= 1}
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-500">
                    Page {pageNumber} of {numPages}
                  </div>
                  <button
                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                    onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                    disabled={pageNumber >= numPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="bg-white p-6 h-full flex flex-col border border-dashed border-gray-300 rounded-lg">
                <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                  <div className="rounded-full bg-blue-100 p-6 mb-4">
                    <FileText className="h-12 w-12 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Upload Your Invoice</h2>
                  <p className="text-gray-500 mb-6">To auto-populate fields and save time</p>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-md flex items-center mb-2 hover:bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    // onChange={handleFileChange}
                    accept="application/pdf"
                    className="hidden"
                    {...getInputProps()}
                  />
                  <p className="text-sm text-gray-500">or Drag and drop</p>
                </div>

              </div>
            </>
          )}

        </div>

        {/* Invoice Form Section */}
        <div className="h-[80vh] overflow-auto">
          <div className="bg-white rounded-lg">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div className="border-b border-gray-200">
                <div className="flex space-x-8">
                  <button
                    type="button"
                    className={`py-2 px-1 border-b-2 ${activeTab === "vendor" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}
                    onClick={() => setActiveTab("vendor")}
                  >
                    Vendor Details
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-1 border-b-2 ${activeTab === "invoice" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}
                    onClick={() => setActiveTab("invoice")}
                  >
                    Invoice Details
                  </button>
                  <button
                    type="button"
                    className={`py-2 px-1 border-b-2 ${activeTab === "comments" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500"}`}
                    onClick={() => setActiveTab("comments")}
                  >
                    Comments
                  </button>
                </div>
              </div>

              <div className="pt-4 w-full overflow-auto">
                {activeTab === "vendor" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium flex items-center mb-4">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Vendor Details
                      </h3>

                      <div className="space-y-4">
                        <h4 className="font-medium">Vendor Information</h4>

                        <div className="space-y-2">
                          <label htmlFor="vendor" className="flex items-center text-sm font-medium">
                            Vendor <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            id="vendor"
                            type="text"
                            className={`w-full px-3 py-2 border rounded-md ${formik.touched.vendor && formik.errors.vendor ? "border-red-500" : "border-gray-300"}`}
                            {...formik.getFieldProps("vendor")}
                          />
                          {formik.touched.vendor && formik.errors.vendor && (
                            <div className="text-sm text-red-500">{formik.errors.vendor}</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="vendorAddress" className="block text-sm font-medium">
                            Vendor Address
                          </label>
                          <input
                            id="vendorAddress"
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            {...formik.getFieldProps("vendorAddress")}
                          />
                        </div>

                        {/* <div>
                          <button type="button" className="text-blue-500 text-sm">
                            View Vendor Details
                          </button>
                        </div> */}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium flex items-center mb-4">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        Invoice Details
                      </h3>

                      <div className="space-y-4">
                        <h4 className="font-medium">General Information</h4>

                        <div className="space-y-2">
                          <label htmlFor="purchaseOrderNumber" className="flex items-center text-sm font-medium">
                            Purchase Order Number <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            id="purchaseOrderNumber"
                            type="text"
                            placeholder="Select PO Number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            {...formik.getFieldProps("purchaseOrderNumber")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "invoice" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Invoice Details</h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="invoiceNumber" className="flex items-center text-sm font-medium">
                              Invoice Number <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              id="invoiceNumber"
                              type="text"
                              placeholder="Enter Invoice Number"
                              className={`w-full px-3 py-2 border rounded-md ${formik.touched.invoiceNumber && formik.errors.invoiceNumber ? "border-red-500" : "border-gray-300"}`}
                              {...formik.getFieldProps("invoiceNumber")}
                            />
                            {formik.touched.invoiceNumber && formik.errors.invoiceNumber && (
                              <div className="text-sm text-red-500">{formik.errors.invoiceNumber}</div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="invoiceDate" className="flex items-center text-sm font-medium">
                              Invoice Date <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              id="invoiceDate"
                              type="date"
                              className={`w-full px-3 py-2 border rounded-md ${formik.touched.invoiceDate && formik.errors.invoiceDate ? "border-red-500" : "border-gray-300"}`}
                              {...formik.getFieldProps("invoiceDate")}
                            />
                            {formik.touched.invoiceDate && formik.errors.invoiceDate && (
                              <div className="text-sm text-red-500">{formik.errors.invoiceDate}</div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="totalAmount" className="flex items-center text-sm font-medium">
                              Total Amount <span className="text-red-500 ml-1">*</span>
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                              <input
                                id="totalAmount"
                                type="number"
                                step="0.01"
                                min="0"
                                className={`w-full pl-7 px-3 py-2 border rounded-md ${formik.touched.totalAmount && formik.errors.totalAmount ? "border-red-500" : "border-gray-300"}`}
                                {...formik.getFieldProps("totalAmount")}
                              />
                            </div>
                            {formik.touched.totalAmount && formik.errors.totalAmount && (
                              <div className="text-sm text-red-500">{formik.errors.totalAmount}</div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="paymentTerms" className="flex items-center text-sm font-medium">
                              Payment Terms <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              id="paymentTerms"
                              type="text"
                              placeholder="Select"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              {...formik.getFieldProps("paymentTerms")}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="invoiceDueDate" className="flex items-center text-sm font-medium">
                              Invoice Due Date <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              id="invoiceDueDate"
                              type="date"
                              className={`w-full px-3 py-2 border rounded-md ${formik.touched.invoiceDueDate && formik.errors.invoiceDueDate ? "border-red-500" : "border-gray-300"}`}
                              {...formik.getFieldProps("invoiceDueDate")}
                            />
                            {formik.touched.invoiceDueDate && formik.errors.invoiceDueDate && (
                              <div className="text-sm text-red-500">{formik.errors.invoiceDueDate}</div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="glPostDate" className="flex items-center text-sm font-medium">
                              GL Post Date <span className="text-red-500 ml-1">*</span>
                            </label>
                            <input
                              id="glPostDate"
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              {...formik.getFieldProps("glPostDate")}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="invoiceDescription" className="flex items-center text-sm font-medium">
                            Invoice Description <span className="text-red-500 ml-1">*</span>
                          </label>
                          <textarea
                            id="invoiceDescription"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            {...formik.getFieldProps("invoiceDescription")}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Expense Details</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">$ 0.00 /</span>
                          <span className="text-sm font-medium text-blue-500">$ 0.00</span>
                          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300">
                            <DollarSign className="h-4 w-4" />
                          </button>
                          <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300">
                            <Percent className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {formik.values?.expenses?.map((_, index) => (
                        <div key={index} className="space-y-4 p-4 border border-gray-300 rounded-md mb-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor={`expenses.${index}.lineAmount`} className="flex items-center text-sm font-medium">
                                Line Amount <span className="text-red-500 ml-1">*</span>
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                                <input
                                  id={`expenses.${index}.lineAmount`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md"
                                  {...formik.getFieldProps(`expenses.${index}.lineAmount`)}
                                />
                              </div>
                              {formik.touched.expenses?.[index]?.lineAmount && formik.errors.expenses?.[index]?.lineAmount && (
                                <div className="text-sm text-red-500">{formik.errors.expenses[index]?.lineAmount}</div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label htmlFor={`expenses.${index}.department`} className="flex items-center text-sm font-medium">
                                Department <span className="text-red-500 ml-1">*</span>
                              </label>
                              <input
                                id={`expenses.${index}.department`}
                                type="text"
                                placeholder="Select Department"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                {...formik.getFieldProps(`expenses.${index}.department`)}
                              />
                              {formik.touched.expenses?.[index]?.department && formik.errors.expenses?.[index]?.department && (
                                <div className="text-sm text-red-500">{formik.errors.expenses[index].department}</div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label htmlFor={`expenses.${index}.account`} className="flex items-center text-sm font-medium">
                                Account <span className="text-red-500 ml-1">*</span>
                              </label>
                              <input
                                id={`expenses.${index}.account`}
                                type="text"
                                placeholder="Select Account"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                {...formik.getFieldProps(`expenses.${index}.account`)}
                              />
                              {formik.touched.expenses?.[index]?.account && formik.errors.expenses?.[index]?.account && (
                                <div className="text-sm text-red-500">{formik.errors.expenses[index].account}</div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <label htmlFor={`expenses.${index}.location`} className="flex items-center text-sm font-medium">
                                Location <span className="text-red-500 ml-1">*</span>
                              </label>
                              <input
                                id={`expenses.${index}.location`}
                                type="text"
                                placeholder="Select Location"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                {...formik.getFieldProps(`expenses.${index}.location`)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor={`expenses.${index}.description`} className="flex items-center text-sm font-medium">
                              Description <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                              id={`expenses.${index}.description`}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              {...formik.getFieldProps(`expenses.${index}.description`)}
                            />
                            {formik.touched.expenses?.[index]?.description && formik.errors.expenses?.[index]?.description && (
                              <div className="text-sm text-red-500">{formik.errors.expenses?.[index].description}</div>
                            )}
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        className="w-full py-2 border border-gray-300 rounded-md flex items-center justify-center"
                        onClick={() => {
                          formik.setValues({
                            ...formik.values,
                            expenses: [...formik.values.expenses, {
                              lineAmount: 0,
                              department: "",
                              account: "",
                              location: "",
                              description: ""
                            }]
                          });
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Expense Coding
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center mb-4">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      Comments
                    </h3>

                    <div className="space-y-2">
                      <textarea
                        id="comments"
                        placeholder="Add a comment and use @Name to tag someone"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        {...formik.getFieldProps(`comments`)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md"
                  onClick={()=>{
                    localStorage.setItem("invoiceData", JSON.stringify(formik.values));
                    localStorage.setItem("invoicePdfData", formik?.values?.pdfUrl as string || "");
                    toast({
                      title: "Draft Saved",
                      description: "Your invoice has been saved as a draft. You can continue editing later.",
                      variant: "default", // or "destructive" if you want an error style
                    });
                  }}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={formik.isSubmitting || !formik.isValid || formik?.values?.pdfUrl === ""}
                >
                  {formik.isSubmitting ? (
                    <>
                      <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Submit and New"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;