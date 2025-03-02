import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { InvoiceValues, useInvoiceContext } from "./InvoiceProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShowPDFDialog } from "./ShowDialogPDF";


const sampleInvoices: InvoiceValues[] = [
  {
    invoiceId: "inv-001",
    vendor: "A-1 Exterminators",
    vendorAddress: "550 Main St., Lynn",
    purchaseOrderNumber: "PO-2025-001",
    invoiceNumber: "INV-2025-001",
    invoiceDate: "2025-05-15",
    invoiceDueDate: "2025-06-15",
    glPostDate: "2025-05-16",
    paymentTerms: "Net 30",
    totalAmount: 1250.00,
    invoiceDescription: "Monthly pest control services for headquarters",
    expenses: [
      {
        lineAmount: 1250.00,
        department: "Operations",
        account: "Maintenance",
        location: "Headquarters",
        description: "Pest control services - May 2025"
      }
    ],
    comments: "Approved by facilities manager",
    status: "approved",
    createdAt: "2025-05-15T10:30:00Z",
    updatedAt: "2025-05-16T14:20:00Z"
  },
  {
    invoiceId: "inv-002",
    vendor: "Office Supplies Co.",
    vendorAddress: "123 Business Ave., Boston",
    purchaseOrderNumber: "PO-2025-002",
    invoiceNumber: "INV-2025-002",
    invoiceDate: "2025-05-18",
    invoiceDueDate: "2025-06-18",
    glPostDate: "2025-05-19",
    paymentTerms: "Net 30",
    totalAmount: 458.75,
    invoiceDescription: "Office supplies for marketing department",
    expenses: [
      {
        lineAmount: 458.75,
        department: "Marketing",
        account: "Office Supplies",
        location: "Headquarters",
        description: "Paper, pens, notebooks, and printer ink"
      }
    ],
    comments: "Rush order for new marketing campaign",
    status: "pending",
    createdAt: "2025-05-18T09:15:00Z",
    updatedAt: "2025-05-18T09:15:00Z"
  },
  {
    invoiceId: "inv-003",
    vendor: "Tech Solutions Inc.",
    vendorAddress: "456 Innovation Blvd., Cambridge",
    purchaseOrderNumber: "PO-2025-003",
    invoiceNumber: "INV-2025-003",
    invoiceDate: "2025-05-20",
    invoiceDueDate: "2025-06-20",
    glPostDate: "2025-05-21",
    paymentTerms: "Net 30",
    totalAmount: 3750.00,
    invoiceDescription: "IT consulting services - May 2025",
    expenses: [
      {
        lineAmount: 3750.00,
        department: "IT",
        account: "Professional Services",
        location: "Headquarters",
        description: "Network security audit and recommendations"
      }
    ],
    comments: "Approved by IT Director",
    status: "approved",
    createdAt: "2025-05-20T11:45:00Z",
    updatedAt: "2025-05-22T16:30:00Z"
  },
  {
    invoiceId: "inv-004",
    vendor: "Catering Delights",
    vendorAddress: "789 Culinary Lane, Brookline",
    purchaseOrderNumber: "PO-2025-004",
    invoiceNumber: "INV-2025-004",
    invoiceDate: "2025-05-22",
    invoiceDueDate: "2025-06-22",
    glPostDate: "2025-05-23",
    paymentTerms: "Net 30",
    totalAmount: 875.50,
    invoiceDescription: "Catering for quarterly board meeting",
    expenses: [
      {
        lineAmount: 875.50,
        department: "Administration",
        account: "Meetings",
        location: "Headquarters",
        description: "Breakfast and lunch for 25 people"
      }
    ],
    comments: "Special dietary requirements noted",
    status: "draft",
    createdAt: "2025-05-22T14:00:00Z",
    updatedAt: "2025-05-22T14:00:00Z"
  },
  {
    invoiceId: "inv-005",
    vendor: "Clean & Green Janitorial",
    vendorAddress: "321 Service Road, Quincy",
    purchaseOrderNumber: "PO-2025-005",
    invoiceNumber: "INV-2025-005",
    invoiceDate: "2025-05-25",
    invoiceDueDate: "2025-06-25",
    glPostDate: "2025-05-26",
    paymentTerms: "Net 30",
    totalAmount: 2100.00,
    invoiceDescription: "Monthly janitorial services - May 2025",
    expenses: [
      {
        lineAmount: 2100.00,
        department: "Facilities",
        account: "Maintenance",
        location: "Headquarters",
        description: "Regular cleaning services plus carpet cleaning"
      }
    ],
    comments: "Additional charge for carpet cleaning approved",
    status: "rejected",
    createdAt: "2025-05-25T10:00:00Z",
    updatedAt: "2025-05-27T09:30:00Z"
  }
];

interface InvoiceDashboardProps {
  onCreateNew: () => void;
  onEditInvoice: (invoiceId: string) => void;
}

const InvoiceDashboard: React.FC<InvoiceDashboardProps> = ({
  onCreateNew,
  onEditInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [sortField, setSortField] = useState<keyof InvoiceValues>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const invoiceContext = useInvoiceContext();

  const invoices = invoiceContext?.invoices || [];

  const router = useRouter();

  // Filter invoices based on search term and current tab
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.invoiceDescription.toLowerCase().includes(searchTerm.toLowerCase());

    if (currentTab === "all") return matchesSearch;
    return matchesSearch && invoice.status === currentTab;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle numeric values
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle string values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Toggle sort direction and field
  const handleSort = (field: keyof InvoiceValues) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge
  const getStatusBadge = (status: InvoiceValues['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <AlertCircle className="h-3 w-3 mr-1" /> Rejected
        </Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
          Draft
        </Badge>;
      default:
        return null;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-7xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">InvoiceValues Dashboard</h1>
        <Link href={"/invoice"}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Invoice
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Invoices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.status === 'draft').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div> */}
      </div>

      <Tabs defaultValue="all" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('invoiceNumber')}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        InvoiceValues #
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('vendor')}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Vendor
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('invoiceDate')}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Date
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('totalAmount')}
                        className="flex items-center p-0 h-auto font-medium"
                      >
                        Amount
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.vendor}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <ShowPDFDialog invoice={invoice}>
                                  View PDF
                                </ShowPDFDialog>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => invoiceContext?.handleAction("approve", invoice.invoiceId)}>Approve</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => invoiceContext?.handleAction("reject", invoice.invoiceId)}>Reject</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => invoiceContext?.handleAction("delete", invoice.invoiceId)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">InvoiceValues #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.vendor}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEditInvoice(invoice.invoiceId)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>View PDF</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Approve</DropdownMenuItem>
                              <DropdownMenuItem>Reject</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No pending invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">InvoiceValues #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.vendor}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEditInvoice(invoice.invoiceId)}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem>View PDF</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No approved invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="rejected" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">InvoiceValues #</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <TableRow key={invoice.invoiceId}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.vendor}</TableCell>
                        <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onEditInvoice(invoice.invoiceId)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>View PDF</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Resubmit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No rejected invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceDashboard;