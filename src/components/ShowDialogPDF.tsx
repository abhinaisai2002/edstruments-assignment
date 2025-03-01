import { Copy } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { InvoiceValues } from "./InvoiceProvider"
import PdfReactPdf from "./PdfViewer"

export function ShowPDFDialog({
	children,
	invoice
}: {
	children: React.ReactNode
	invoice: InvoiceValues
}) {

	const [open, setOpen] = useState(false)

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<button onClick={(e) => {
				e.preventDefault();
				setOpen(true);
			}}>View PDF</button>
			<DialogContent className="max-w-7xl h-[80vh]">
				<DialogHeader>
					<DialogTitle>Invoice PDF</DialogTitle>
				</DialogHeader>
				<PdfReactPdf src={invoice.pdfUrl as string} />
				<DialogFooter className="justify-end">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
