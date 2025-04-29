import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-hot-toast";
import SalonHeader from "../../Components/SalonHeader";
import SalonSidebar from "../../Components/SalonSidebar";
import Table from "../../Components/Table"; 
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
import { createOffer, getOffers } from "../../Services/salonAPI";

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
}

const SalonOffers = () => {
  const { salon } = useSelector((state: any) => state.salon);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [services, setServices] = useState<Service[]>(salon.services.map((s:any)=>s.service));
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
        const data = {id:salon._id}
        setLoading(true);
        const offersResponse = await getOffers(data)
        setOffers(offersResponse.data.offers);
        // setServices(servicesResponse.data.salon.services);
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
        }));
    },
    [filterStatus, filterService]
  );

  const filteredOffers = getFilteredOffers(offers);


  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOffers = filteredOffers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
        const  data = {
            salonId: salon._id,
            title: newOffer.title,
            description: newOffer.description,
            discount: newOffer.discount,
            serviceIds: newOffer.serviceIds,
            expiryDate: newOffer.expiryDate,
          }
        const response = await createOffer(data)
        console.log(response,"response from create offer api")
      toast.success("Offer created successfully!");
      const offersResponse = await axios.get(`http://localhost:3000/api/salons/${salon._id}/offers`);
      setOffers(offersResponse.data.offers);
      setShowModal(false);
      setNewOffer({ title: "", description: "", discount: 0, serviceIds: [], expiryDate: "" });
      setCurrentPage(1); // Reset to first page
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create offer");
    } finally {
      setModalLoading(false);
    }
  };

  const tableColumns = [
    { header: "Title", accessor: "title" },
    { header: "Description", accessor: "description" },
    { header: "Discount", accessor: "discount" },
    { header: "Services", accessor: "services" },
    { header: "Expiry Date", accessor: "expiryDate" },
    { header: "Status", accessor: "status" },
  ];

  if (salon.role !== "Salon") {
    return <div className="text-center py-8">Unauthorized</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="p-6">
          <Card className="p-4">
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Salon Offers</h2>
                <Button onClick={() => setShowModal(true)}>Add Offer</Button>
              </div>
              <div className="flex space-x-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Status</label>
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as "all" | "active" | "expired")}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Filter by Service</label>
                  <Select value={filterService} onValueChange={setFilterService}>
                    <SelectTrigger className="w-[180px]">
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
                <div className="text-center py-4">Loading...</div>
              ) : error ? (
                <div className="text-red-500 text-center py-4">{error}</div>
              ) : filteredOffers.length === 0 ? (
                <div className="text-center py-4">No offers found</div>
              ) : (
                <>
                  <div className="text-sm text-gray-600 mb-2">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredOffers.length)} of {filteredOffers.length} offers
                  </div>
                  <Table columns={tableColumns} data={currentOffers} />
                  <div className="flex justify-center space-x-2 mt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateOffer}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                value={newOffer.title}
                onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                required
                minLength={5}
                maxLength={50}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Description</label>
              <Input
                type="text"
                value={newOffer.description}
                onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                required
                minLength={10}
                maxLength={200}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Discount (%)</label>
              <Input
                type="number"
                value={newOffer.discount}
                onChange={(e) => setNewOffer({ ...newOffer, discount: Number(e.target.value) })}
                required
                min={1}
                max={100}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Services (Optional)</label>
              <div className="space-y-2">
                {services.map((service) => (
                  <div key={service._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newOffer.serviceIds.includes(service._id)}
                      onChange={() => handleServiceToggle(service._id)}
                      className="mr-2"
                    />
                    <span>{service.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <Input
                type="date"
                value={newOffer.expiryDate}
                onChange={(e) => setNewOffer({ ...newOffer, expiryDate: e.target.value })}
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={modalLoading}>
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