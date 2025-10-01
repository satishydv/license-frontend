"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Application = {
  id: number
  name: string
  father_name: string
  contact_no: string
  dob: string
  blood_group: string
  state: string
  city: string
  license_type: string
  application_no: string
  license_no: string
  issue_date: string
  expiry_date: string
  cover_class: string
  amount: string
  pay_amount: string | null
  mode_of_payment: string
  license_attachment_path: string | null
  payment_receipt_path: string | null
  created_at: string
  updated_at: string
}

export const createApplicationColumns = (onEdit?: (application: Application) => void, onDelete?: (application: Application) => void, onView?: (application: Application) => void): ColumnDef<Application>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  { accessorKey: 'name', header: 'Name', size: 120 },
  { accessorKey: 'father_name', header: 'Father Name', size: 130 },
  { accessorKey: 'contact_no', header: 'Contact No', size: 120 },
  { accessorKey: 'city', header: 'City', size: 100 },
  { accessorKey: 'application_no', header: 'Application No', size: 130 },
  { accessorKey: 'license_no', header: 'License No', size: 130 },
  { accessorKey: 'issue_date', header: 'Issue Date', size: 110 },
  { accessorKey: 'expiry_date', header: 'Expiry Date', size: 110 },
  { accessorKey: 'amount', header: 'Amount', size: 100 },
  { accessorKey: 'pay_amount', header: 'Pay Amount', size: 110 },
  { accessorKey: 'mode_of_payment', header: 'Payment Mode', size: 120 },
  {
    id: "actions",
    enableHiding: false,
    size: 80,
    cell: ({ row }) => {
      const application = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(application)}>
                View Details
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(application.id.toString())}
            >
              Copy application ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(application)}>
                Edit application
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(application)}
              >
                Delete application
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
