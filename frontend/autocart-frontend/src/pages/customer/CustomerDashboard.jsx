import { useLocation } from "react-router-dom";
import Hero from "../../components/dashboard/Hero";
import BrandSection from "../../components/dashboard/BrandSection";
import FeaturedVehicles from "../../components/dashboard/FeaturedVehicles";
import SearchResults from "../../components/dashboard/SearchResults";
import useDebounce from "../../hooks/useDebounce";

function CustomerDashboard({ searchTerm }) {
  const location = useLocation();
  const debouncedSearch = useDebounce(searchTerm, 300);
  const isSearching = debouncedSearch.trim() !== "";

  return (
    <>
      {location.state?.message && (
        <div className="container mt-3">
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {location.state.message}
          </div>
        </div>
      )}
      {isSearching ? (
        <SearchResults searchTerm={debouncedSearch} />
      ) : (
        <>
          <Hero />

          <BrandSection />

          <FeaturedVehicles />
        </>
      )}
    </>
  );
}

export default CustomerDashboard;
