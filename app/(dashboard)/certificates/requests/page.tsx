"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import {
  certificateService,
  type CertificateRequest,
} from "@/lib/services/certificate.service";

const domainNames: Record<string, string> = {
  "web-dev": "Web Development",
  "app-dev": "App Development",
  cloud: "Cloud Computing",
  devops: "DevOps Engineering",
  "machine-learning": "Machine Learning",
  "data-science": "Data Science",
};

export default function CertificateRequestsPage() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  useEffect(() => {
    void fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const status = statusFilter !== "all" ? statusFilter : undefined;
      const data = await certificateService.getAllCertificateRequests(status);
      setRequests(data || []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setApproving(requestId);
      await certificateService.approveCertificateRequest(requestId);

      setRequests((prev) =>
        prev.map((req) => (req._id === requestId ? { ...req, status: "approved" } : req))
      );
      toast.success("Certificate request approved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return;

    try {
      setRejecting(requestId);
      await certificateService.rejectCertificateRequest(requestId, reason);

      setRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: "rejected", rejectionReason: reason } : req
        )
      );
      toast.success("Certificate request rejected");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setRejecting(null);
    }
  };

  const getStatusBadgeClass = (status: CertificateRequest["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Certificate Requests</h1>
        <p className="text-gray-600 mt-1">Manage and approve certificate requests from users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Request Queue</CardTitle>
              <CardDescription>Review and process certificate requests</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No certificate requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{request.userId.name}</p>
                          <p className="text-xs text-gray-500">{request.userId.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{domainNames[request.domain]}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => void handleApprove(request._id)}
                              disabled={approving === request._id}
                              className="flex items-center gap-1"
                            >
                              {approving === request._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3 w-3" />
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void handleReject(request._id)}
                              disabled={rejecting === request._id}
                              className="flex items-center gap-1"
                            >
                              {rejecting === request._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              Reject
                            </Button>
                          </div>
                        ) : request.status === "rejected" ? (
                          <p className="text-xs text-gray-500">
                            Reason: {request.rejectionReason || "No reason"}
                          </p>
                        ) : (
                          <p className="text-xs text-green-600 font-medium">Approved</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
