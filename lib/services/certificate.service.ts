import  api  from "./api.client";

export interface CertificateRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    identifier: string;
  };
  domain: "web-dev" | "app-dev" | "cloud" | "devops"| 'machine-learning' | 'data-science';
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  adminId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  userId: string;
  domain: "web-dev" | "app-dev" | "cloud" | "devops" | 'machine-learning' | 'data-science';
  domainCode: string;
  certificateId: string;
  certificateNumber: string;
  fileUrl: string;
  qrUrl: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface IssueDirectDto {
  email: string;
  domain: "web-dev" | "app-dev" | "cloud" | "devops" | 'machine-learning' | 'data-science';
  overrideName?: string;
}

export type CertificateTemplateMode = "default" | "image" | "html";

export interface CertificateTemplate {
  _id: string;
  name: string;
  mode: CertificateTemplateMode;
  backgroundImageUrl?: string | null;
  htmlTemplate?: string | null;
  isActive: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCertificateTemplateDto {
  name: string;
  mode: CertificateTemplateMode;
  backgroundImageBase64?: string;
  htmlTemplate?: string;
}

class CertificateService {
  /**
   * User: Submit a certificate request
   */
  async requestCertificate(domain: string) {
    try {
      const response = await api.post("/certificates/request", { domain });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * User: Get my issued certificates
   */
  async getMyCertificates() {
    try {
      const response = await api.get("/certificates/my");
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * User: Get my certificate requests
   */
  async getMyCertificateRequests() {
    try {
      const response = await api.get("/certificates/my/requests");
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Get all certificate requests (filterable by status)
   */
  async getAllCertificateRequests(status?: string) {
    try {
      const params = status ? { status } : {};
      const response = await api.get("/admin/certificates/requests", { params });
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Approve a certificate request
   */
  async approveCertificateRequest(requestId: string) {
    try {
      const response = await api.post(
        `/admin/certificates/${requestId}/approve`
      );
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Reject a certificate request
   */
  async rejectCertificateRequest(
    requestId: string,
    rejectionReason?: string
  ) {
    try {
      const response = await api.post(
        `/admin/certificates/${requestId}/reject`,
        { rejectionReason }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Directly issue a certificate for a user
   */
  async issueDirectCertificate(dto: IssueDirectDto) {
    try {
      const response = await api.post("/admin/certificates/issue-direct", dto);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Public: Verify a certificate by its public ID
   */
  async verifyCertificate(certificateId: string) {
    try {
      const response = await api.get(`/archive/${certificateId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Get all issued certificates
   */
  async getAllIssuedCertificates() {
    try {
      const response = await api.get("/admin/certificates/issued");
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Create a certificate template
   */
  async createCertificateTemplate(dto: CreateCertificateTemplateDto) {
    try {
      const response = await api.post("/admin/certificate-templates", dto);
      return response.data.data as CertificateTemplate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: List certificate templates
   */
  async listCertificateTemplates() {
    try {
      const response = await api.get("/admin/certificate-templates");
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Get a certificate template by id
   */
  async getCertificateTemplateById(id: string) {
    try {
      const response = await api.get(`/admin/certificate-templates/${id}`);
      return response.data.data as CertificateTemplate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Activate a certificate template
   */
  async activateCertificateTemplate(id: string) {
    try {
      const response = await api.put(`/admin/certificate-templates/${id}/activate`);
      return response.data.data as CertificateTemplate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Reset all templates to built-in default SVG
   */
  async resetDefaultCertificateTemplate() {
    try {
      const response = await api.put("/admin/certificate-templates/reset-default");
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Admin: Delete a certificate template
   */
  async deleteCertificateTemplate(id: string) {
    try {
      const response = await api.delete(`/admin/certificate-templates/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export const certificateService = new CertificateService();
