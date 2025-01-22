import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    setLoading(true);
    try {
      // Navigate to search results page with query parameter
      const searchQuery = query.trim();
      console.log("Searching for:", searchQuery);
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setQuery(""); // Clear the search input after navigation
    } catch (error) {
      console.error("Search navigation error:", error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-64">
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-blue pr-10"
          disabled={loading}
        />
        <button
          type="submit"
          className="absolute right-2 text-gray-400 hover:text-primary-blue focus:outline-none disabled:opacity-50"
          disabled={loading}
        >
          <FaSearch className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export default HeaderSearch;
