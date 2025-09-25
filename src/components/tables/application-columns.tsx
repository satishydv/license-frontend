"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
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
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'father_name', header: 'Father Name' },
  { accessorKey: 'contact_no', header: 'Contact No' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'application_no', header: 'Application No' },
  { accessorKey: 'license_no', header: 'License No' },
  { accessorKey: 'issue_date', header: 'Issue Date' },
  { accessorKey: 'expiry_date', header: 'Expiry Date' },
  { accessorKey: 'amount', header: 'Amount' },
  { accessorKey: 'pay_amount', header: 'Pay Amount' },
  { accessorKey: 'mode_of_payment', header: 'Payment Mode' },
  {
    id: "actions",
    enableHiding: false,
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
