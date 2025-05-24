'use client';


// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import SimpleAdminLayout from "@/components/admin/SimpleAdminLayout";

// Define the artist type
interface Artist {
  id: number;
  name: string;
  email: string;
  exhibitions: number;
  artworks: number;
  rating: number;
}

// Mock data for artists
const artists: Artist[] = [
  { id: 1, name: "Jane Smith", email: "jane.smith@example.com", exhibitions: 3, artworks: 12, rating: 4.8 },
  { id: 2, name: "John Doe", email: "john.doe@example.com", exhibitions: 5, artworks: 24, rating: 4.5 },
  { id: 3, name: "Emily Johnson", email: "emily.johnson@example.com", exhibitions: 2, artworks: 8, rating: 4.9 },
  { id: 4, name: "Michael Chen", email: "michael.chen@example.com", exhibitions: 4, artworks: 18, rating: 4.6 },
  { id: 5, name: "Sarah Wilson", email: "sarah.wilson@example.com", exhibitions: 1, artworks: 5, rating: 4.3 },
];

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SimpleAdminLayout>
      <div className="tw-container tw-mx-auto tw-px-4 tw-py-8">
        <div className="tw-bg-white tw-p-6 tw-shadow-sm">
      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <h1 className="tw-text-2xl tw-font-bold">Artists</h1>
        <Link
          href="/admin/artists/add"
          className="tw-bg-black tw-text-white tw-px-4 tw-py-2 hover:tw-bg-gray-800 tw-transition-colors"
        >
          Add New Artist
        </Link>
      </div>

      <div className="tw-mb-6">
        <input
          type="text"
          placeholder="Search artists..."
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
                Artist Name
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Email
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Exhibitions
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Artworks
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Rating
              </th>
              <th scope="col" className="tw-px-6 tw-py-3 tw-text-left tw-text-xs tw-font-medium tw-text-gray-500 tw-uppercase tw-tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="tw-bg-white tw-divide-y tw-divide-gray-200">
            {filteredArtists.map((artist) => (
              <tr key={artist.id}>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                  <div className="tw-flex tw-items-center">
                    <div className="tw-h-10 tw-w-10 tw-rounded-full tw-bg-gray-200 tw-flex tw-items-center tw-justify-center tw-mr-3">
                      <span className="tw-text-gray-500">👤</span>
                    </div>
                    <div className="tw-text-sm tw-font-medium tw-text-gray-900">{artist.name}</div>
                  </div>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                  <div className="tw-text-sm tw-text-gray-500">{artist.email}</div>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  {artist.exhibitions}
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-text-gray-500">
                  {artist.artworks}
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap">
                  <div className="tw-flex tw-items-center">
                    <span className="tw-text-sm tw-text-gray-900 tw-mr-2">{artist.rating}</span>
                    <div className="tw-flex tw-items-center">
                      {"★".repeat(Math.floor(artist.rating))}
                      {"☆".repeat(5 - Math.floor(artist.rating))}
                    </div>
                  </div>
                </td>
                <td className="tw-px-6 tw-py-4 tw-whitespace-nowrap tw-text-sm tw-font-medium">
                  <Link href={`/admin/artists/${artist.id}`} className="tw-text-blue-600 hover:tw-text-blue-900 tw-mr-4">
                    View
                  </Link>
                  <Link href={`/admin/artists/${artist.id}/edit`} className="tw-text-indigo-600 hover:tw-text-indigo-900 tw-mr-4">
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
