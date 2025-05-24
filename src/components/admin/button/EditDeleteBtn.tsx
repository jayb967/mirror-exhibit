"use client";

import Link from "next/link";
import Swal from "sweetalert2";
import React, { useState } from "react";
import { Edit, Delete } from "../svg";
import DeleteTooltip from "../tooltip/DeleteTooltip";
import EditTooltip from "../tooltip/EditTooltip";

interface EditDeleteBtnProps {
  id: string;
  onDelete?: (id: string) => Promise<void>;
  editUrl?: string;
}

const EditDeleteBtn = ({ 
  id, 
  onDelete,
  editUrl = `/admin/edit-product/${id}` 
}: EditDeleteBtnProps) => {
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showDelete, setShowDelete] = useState<boolean>(false);

  const handleDelete = async (productId: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete this item?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (onDelete) {
            await onDelete(productId);
            Swal.fire("Deleted!", `Item has been deleted.`, "success");
          } else {
            // Mock delete if no onDelete function is provided
            Swal.fire("Delete functionality not implemented", "", "info");
          }
        } catch (error) {
          Swal.fire("Error", "An error occurred while deleting", "error");
        }
      }
    });
  };

  return (
    <>
      <div className="tw-relative">
        <Link href={editUrl}>
          <button
            onMouseEnter={() => setShowEdit(true)}
            onMouseLeave={() => setShowEdit(false)}
            className="tw-w-10 tw-h-10 tw-leading-10 tw-text-tiny tw-bg-success tw-text-white tw-rounded-md hover:tw-bg-green-600"
          >
            <Edit />
          </button>
        </Link>
        <EditTooltip showEdit={showEdit} />
      </div>
      <div className="tw-relative">
        <button
          onClick={() => handleDelete(id)}
          onMouseEnter={() => setShowDelete(true)}
          onMouseLeave={() => setShowDelete(false)}
          className="tw-w-10 tw-h-10 tw-leading-[33px] tw-text-tiny tw-bg-white tw-border tw-border-gray tw-text-slate-600 tw-rounded-md hover:tw-bg-danger hover:tw-border-danger hover:tw-text-white"
        >
          <Delete />
        </button>
        <DeleteTooltip showDelete={showDelete} />
      </div>
    </>
  );
};

export default EditDeleteBtn; 