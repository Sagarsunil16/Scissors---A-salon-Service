import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import ReusableTable, { Column } from "../../Components/ReusableTable";
import { Button } from "../../Components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../Components/ui/dialog";
import { Input } from "../../Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../Components/ui/select";
import { Card, CardContent } from "../../Components/ui/card";
import { createOffer, getOffers, deactivateOffer, deleteOffer } from "../../Services/salonAPI";

interface Offer {
  _id: string;
  title: string;
  description: string;
  discount: number;
  serviceIds: { _id: string; name: string }[];
  expiryDate: string;
  isActive: boolean;
}

interface Service {
  _id: string;
  name: string;
}

interface TableOffer {
  _id: string;
  title: string;
  description: string;
  discount: string;
  services: string;
  expiryDate: string;
  status: string;
  is_Active: boolean;
}

const SalonOffers = () => {
  const { salon } = useSelector((state: any) => state.salon);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services] = useState<Service[]>(salon.services.map((s: any) => s.service));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all");
  const [filterService, setFilterService] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showModal, setShowModal] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: "",
    description: "",
    discount: 0,
    serviceIds: [] as string[],
    expiryDate: "",
  });
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = { id: salon._id };
        setLoading(true);
        const offersResponse = await getOffers(data);
        setOffers(offersResponse.data.offers);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    if (salon.role === "Salon") {
      fetchData();
    }
  }, [salon]);

  const getFilteredOffers = useCallback(
    (offers: Offer[]): TableOffer[] => {
      return offers
        .filter((offer) => {
          const isActive = offer.isActive && new Date(offer.expiryDate) >= new Date();
          const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "active" && isActive) ||
            (filterStatus === "expired" && !isActive);
          const matchesService =
            filterService === "all" ||
            offer.serviceIds.some((s) => s._id === filterService);
          return matchesStatus && matchesService;
        })
        .map((offer) => ({
          _id: offer._id,
          title: offer.title,
          description: offer.description,
          discount: `${offer.discount}%`,
          services:
            offer.serviceIds.length > 0
              ? offer.serviceIds.map((s) => s.name).join(", ")
              : "All Services",
          expiryDate: new Date(offer.expiryDate).toLocaleDateString(),
          status: offer.isActive && new Date(offer.expiryDate) >= new Date() ? "Active" : "Expired",
          is_Active: offer.isActive && new Date(offer.expiryDate) >= new Date(),
        }));
    },
    [filterStatus, filterService]
  );

  const filteredOffers = getFilteredOffers(offers);

  const handleServiceToggle = (serviceId: string) => {
    setNewOffer((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      const data = {
        salonId: salon._id,
        title: newOffer.title,
        description: newOffer.description,
        discount: newOffer.discount,
        serviceIds: newOffer.serviceIds,
        expiryDate: newOffer.expiryDate,
      };
      await createOffer(data);
      toast.success("Offer created successfully!");
      const offersResponse = await getOffers({ id: salon._id });
      setOffers(offersResponse.data.offers);
      setShowModal(false);
      setNewOffer({ title: "", description: "", discount: 0, serviceIds: [], expiryDate: "" });
      setCurrentPage(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create offer");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeactivateOffer = async (offer: TableOffer) => {
    const result = await Swal.fire({
      title: "Deactivate Offer",
      text: `Are you sure you want to deactivate "${offer.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Deactivate",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        confirmButton: "bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm mr-2",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm",
        title: "text-lg sm:text-xl text-gray-800",
        popup: "rounded-lg p-6",
      },
    });

    if (result.isConfirmed) {
      try {
        await deactivateOffer(offer._id);
        toast.success("Offer deactivated successfully!");
        const offersResponse = await getOffers({ id: salon._id });
        setOffers(offersResponse.data.offers);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to deactivate offer");
      }
    }
  };

  const handleDeleteOffer = async (offer: TableOffer) => {
    const result = await Swal.fire({
      title: "Delete Offer",
      text: `Are you sure you want to delete "${offer.title}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        confirmButton: "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm mr-2",
        cancelButton: "bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm",
        title: "text-lg sm:text-xl text-gray-800",
        popup: "rounded-lg p-6",
      },
    });

    if (result.isConfirmed) {
      try {
        await deleteOffer(offer._id);
        toast.success("Offer deleted successfully!");
        const offersResponse = await getOffers({ id: salon._id });
        setOffers(offersResponse.data.offers);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete offer");
      }
    }
  };

  const columns: Column<TableOffer>[] = [
    { header: "Title", accessor: "title", minWidth: "120px" },
    { header: "Description", accessor: "description", minWidth: "150px" },
    { header: "Discount", accessor: "discount", minWidth: "100px" },
    { header: "Services", accessor: "services", minWidth: "150px" },
    { header: "Expiry Date", accessor: "expiryDate", minWidth: "120px" },
    { header: "Status", accessor: "status", minWidth: "100px" },
  ];

  const actions = [
    {
      label: "Deactivate",
      onClick: handleDeactivateOffer,
      className:
        "w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed",
      disabled: (offer: TableOffer) => !offer.is_Active,
    },
    {
      label: "Delete",
      onClick: handleDeleteOffer,
      className:
        "w-full sm:w-auto px-2 py-1 text-xs sm:text-sm rounded font-medium text-red-600 hover:text-red-900",
      disabled: () => false,
    },
  ];

  if (salon.role !== "Salon") {
    return <div className="text-center py-8 text-gray-600 text-sm sm:text-base">Unauthorized</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:flex-row">
      <SalonSidebar />
      <div className="flex-1 flex flex-col w-full">
        <SalonHeader />
        <div className="p-4 sm:p-6">
          <Card className="p-4 shadow-sm border-gray-200">
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Salon Offers</h2>
                <Button
                  onClick={() => setShowModal(true)}
                  className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm"
                >
                  Add Offer
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-4 mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-44">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                  <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as "all" | "active" | "expired")}
                  >
                    <SelectTrigger className="w-full border-gray-200 rounded-md text-xs sm:text-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:w-44">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Filter by Service</label>
                  <Select value={filterService} onValueChange={setFilterService}>
                    <SelectTrigger className="w-full border-gray-200 rounded-md text-xs sm:text-sm">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Services</SelectItem>
                      {services.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-4 text-xs sm:text-sm">{error}</div>
              ) : filteredOffers.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-xs sm:text-sm bg-gray-50 rounded-md">No offers found</div>
              ) : (
                <>
                  <div className="hidden sm:block">
                    <ReusableTable<TableOffer>
                      columns={columns}
                      data={filteredOffers}
                      totalItems={filteredOffers.length}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      loading={loading}
                      searchQuery=""
                      editingId={null}
                      editForm={{}}
                      onSearchChange={() => {}} // No search input for offers
                      onPageChange={(page) => {
                        console.log('SalonOffers onPageChange:', page);
                        setCurrentPage(page);
                      }}
                      actions={actions}
                      getRowId={(offer: TableOffer) => offer._id}
                    />
                  </div>
                  <div className="sm:hidden space-y-4 mt-4">
                    {filteredOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((offer) => (
                      <div key={offer._id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                        <div className="space-y-2">
                          <div>
                            <span className="font-semibold text-xs">Title:</span> {offer.title}
                          </div>
                          <div>
                            <span className="font-semibold text-xs">Description:</span> {offer.description}
                          </div>
                          <div>
                            <span className="font-semibold text-xs">Discount:</span> {offer.discount}
                          </div>
                          <div>
                            <span className="font-semibold text-xs">Services:</span> {offer.services}
                          </div>
                          <div>
                            <span className="font-semibold text-xs">Expiry Date:</span> {offer.expiryDate}
                          </div>
                          <div>
                            <span className="font-semibold text-xs">Status:</span> {offer.status}
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button
                              onClick={() => handleDeactivateOffer(offer)}
                              disabled={!offer.is_Active}
                              className={`px-2 py-1 rounded-md text-xs text-indigo-600 hover:text-indigo-900 ${
                                !offer.is_Active ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              Deactivate
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer)}
                              className="px-2 py-1 rounded-md text-xs text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl text-gray-800">Create New Offer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOffer}>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                required
                minLength={5}
                maxLength={50}
                className="text-xs sm:text-sm border-gray-200 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
              <Input
                type="text"
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                required
                minLength={10}
                maxLength={200}
                className="text-xs sm:text-sm border-gray-200 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
              <Input
                type="number"
                value={newOffer.discount}
                onChange={(e) => setNewOffer({ ...newOffer, discount: Number(e.target.value) })}
                required
                min={1}
                max={100}
                className="text-xs sm:text-sm border-gray-200 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Services (Optional)</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {services.map((service) => (
                  <div key={service._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newOffer.serviceIds.includes(service._id)}
                      onChange={() => handleServiceToggle(service._id)}
                      className="mr-2 h-4 w-4 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <Input
                type="date"
                value={newOffer.expiryDate}
                onChange={(e) => setNewOffer({ ...newOffer, expiryDate: e.target.value })}
                required
                min={new Date().toISOString().split("T")[0]}
                className="text-xs sm:text-sm border-gray-200 rounded-md"
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={modalLoading}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {modalLoading ? "Creating..." : "Create Offer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalonOffers;