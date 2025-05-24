"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import SimpleAdminLayout from "@/components/admin/SimpleAdminLayout";

// Define the exhibition type
interface Exhibition {
  id: number;
  title: string;
  artist: string;
  status: "Active" | "Upcoming" | "Completed";
  visitors: number;
  endDate: string;
}

// Mock data for exhibitions
const exhibitions: Exhibition[] = [
  { id: 1, title: "Modern Perspectives", artist: "Various Artists", status: "Active", visitors: 245, endDate: "2023-12-30" },
  { id: 2, title: "Abstract Visions", artist: "Jane Smith", status: "Active", visitors: 187, endDate: "2023-11-15" },
  { id: 3, title: "Urban Landscapes", artist: "John Doe", status: "Upcoming", visitors: 0, endDate: "2024-01-20" },
  { id: 4, title: "Classical Reimagined", artist: "Emily Johnson", status: "Completed", visitors: 523, endDate: "2023-09-10" },
  { id: 5, title: "Digital Frontiers", artist: "Michael Chen", status: "Active", visitors: 156, endDate: "2023-12-05" },
];

export default function ExhibitionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredExhibitions = exhibitions.filter(exhibition =>
    exhibition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibition.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-bg-white tw-p-6 tw-shadow-sm">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl tw-font-bold">Exhibitions</h1>
        <Link
          href="/admin/exhibitions/add"
          className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors"
        >
          Add New Exhibition
        </Link>
      </div>

      <div className="tw-mb-6">
        <input
          type="text"
          placeholder="Search exhibitions..."
          className="tw-w-full md:tw-w-[300px] tw-px-4 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className="tw-overflow-x-auto">
        <table className="tw-min-w-full tw-divide-y tw-divide-gray-200">
          <thead className="tw-bg-gray-50">
            <tr>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Exhibition Title
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Artist
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Status
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Visitors
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                End Date
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {filteredExhibitions.map((exhibition) => (
              <tr key={exhibition.id}>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                  <div className="tw-text-sm tw-font-medium tw-text-gray-900">{exhibition.title}</div>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                  <div className="tw-text-sm tw-text-gray-500">{exhibition.artist}</div>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                  <span className={`tw-px-2 tw-inline-flex tw-text-xs tw-leading-5 tw-font-semibold tw-rounded-full
                    ${exhibition.status === 'Active' ? 'tw-bg-green-100 tw-text-green-800' :
                      exhibition.status === 'Upcoming' ? 'tw-bg-blue-100 tw-text-blue-800' :
                      'tw-bg-gray-100 tw-text-gray-800'}`}>
                    {exhibition.status}
                  </span>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  {exhibition.visitors}
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  {exhibition.endDate}
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium">
                  <Link href={`/admin/exhibitions/${exhibition.id}`} className="tw-text-blue-600 hover:tw-text-blue-900 tw-mr-4">
                    View
                  </Link>
                  <Link href={`/admin/exhibitions/${exhibition.id}/edit`} className="tw-text-indigo-600 hover:tw-text-indigo-900 tw-mr-4">
                    Edit
                  </Link>
                  <button className="tw-text-red-600 hover:tw-text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      </div>
    </SimpleAdminLayout>
  );
}