"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  Image as ImageIcon,
  Code2,
} from "lucide-react";
import {
  certificateService,
  type CertificateTemplate,
  type CertificateTemplateMode,
} from "@/lib/services/certificate.service";

const DEFAULT_FORM = {
  name: "",
  mode: "default" as CertificateTemplateMode,
  backgroundImageBase64: "",
  htmlTemplate: "",
};

const modeLabel: Record<CertificateTemplateMode, string> = {
  default: "Default SVG",
  image: "Image Background",
  html: "HTML Layout",
};

const modeBadgeClass: Record<CertificateTemplateMode, string> = {
  default: "bg-gray-100 text-gray-800 border-gray-200",
  image: "bg-blue-100 text-blue-800 border-blue-200",
  html: "bg-violet-100 text-violet-800 border-violet-200",
};

const safePreviewHtml = `
<div style="width:1200px;height:850px;position:relative;background:#0f172a;color:#fff;font-family:Arial,sans-serif;overflow:hidden;">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#0f172a,#1e293b);"></div>
  <div style="position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:80px;">
    <div style="font-size:22px;letter-spacing:.3em;text-transform:uppercase;color:#cbd5e1;margin-bottom:32px;">Certificate of Completion</div>
    <div style="font-size:72px;font-weight:700;line-height:1.1;margin-bottom:18px;">{{userName}}</div>
    <div style="font-size:30px;color:#bfdbfe;margin-bottom:24px;">{{courseName}}</div>
    <div style="font-size:18px;color:#cbd5e1;max-width:760px;line-height:1.6;">
      Awarded for successfully completing the program
    </div>
    <div style="margin-top:42px;font-size:16px;color:#94a3b8;">Certificate No: {{certificateNumber}}</div>
  </div>
</div>`;

export default function CertificateTemplatesPage() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const htmlTemplateHints = useMemo(
    () => [
      "Place {{userName}} in the main name block or centered title area.",
      "Place {{courseName}} under the name as the domain/course heading.",
      "Use {{certificateNumber}} and {{issuedDate}} in a footer or signature row.",
      "Keep the design at 1200x850 for best rendering results.",
    ],
    []
  );

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.listCertificateTemplates();
      setTemplates(data || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load templates"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTemplates();
  }, []);

  const resetForm = () => setForm(DEFAULT_FORM);

  const handleFileUpload = async (file?: File) => {
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(file.type)) {
      toast.error("Please upload a PNG, JPG, or WebP image");
      return;
    }

    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Unable to read image file"));
      reader.readAsDataURL(file);
    });

    setForm((prev) => ({ ...prev, backgroundImageBase64: base64 }));
  };

  const handleCreateTemplate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        mode: form.mode,
        backgroundImageBase64: form.mode === "image" ? form.backgroundImageBase64 : undefined,
        htmlTemplate: form.mode === "html" ? form.htmlTemplate : undefined,
      };

      await certificateService.createCertificateTemplate(payload);
      toast.success("Certificate template created");
      resetForm();
      await fetchTemplates();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create template"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      setPendingActionId(id);
      await certificateService.activateCertificateTemplate(id);
      toast.success("Template activated");
      await fetchTemplates();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to activate template"
      );
    } finally {
      setPendingActionId(null);
    }
  };

  const handleResetDefault = async () => {
    try {
      setPendingActionId("default");
      await certificateService.resetDefaultCertificateTemplate();
      toast.success("Built-in default template restored");
      await fetchTemplates();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset template"
      );
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template? Active templates cannot be deleted.")) {
      return;
    }

    try {
      setPendingActionId(id);
      await certificateService.deleteCertificateTemplate(id);
      toast.success("Template deleted");
      await fetchTemplates();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete template"
      );
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Certificate Templates</h1>
        <p className="text-gray-600 mt-1">
          Upload HTML or image-based certificate templates and control which design is active.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Template
              </CardTitle>
              <CardDescription>
                Use the HTML template to place <span className="font-medium">{"{{userName}}"}</span> and <span className="font-medium">{"{{courseName}}"}</span> in the exact positions you want on the certificate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateTemplate} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="font-medium">
                    Template Name
                  </Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="e.g. Premium Dark Certificate"
                    className="mt-2"
                    required
                  />
                </div>

                <Tabs
                  value={form.mode}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      mode: value as CertificateTemplateMode,
                    }))
                  }
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="default">Default</TabsTrigger>
                    <TabsTrigger value="image">Image</TabsTrigger>
                    <TabsTrigger value="html">HTML</TabsTrigger>
                  </TabsList>

                  <TabsContent value="default" className="pt-4 space-y-3">
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        <ShieldCheck className="h-4 w-4" />
                        Built-in Default Template
                      </div>
                      <p className="mt-2">
                        No upload is required. This uses the backend's default premium SVG.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="image" className="pt-4 space-y-3">
                    <div>
                      <Label htmlFor="templateImage" className="font-medium">
                        Background Image
                      </Label>
                      <div className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-4">
                        <ImageIcon className="h-5 w-5 text-blue-600 shrink-0" />
                        <Input
                          id="templateImage"
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={(event) => void handleFileUpload(event.target.files?.[0])}
                          className="border-0 p-0 shadow-none"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Recommended size: 1200x850 px. The certificate name should sit in the central hero area, and the domain/course should be just below it.
                      </p>
                    </div>
                    {form.backgroundImageBase64 ? (
                      <p className="text-xs text-green-700">Image loaded and ready to upload.</p>
                    ) : null}
                  </TabsContent>

                  <TabsContent value="html" className="pt-4 space-y-4">
                    <div>
                      <Label htmlFor="htmlTemplate" className="font-medium">
                        HTML Template
                      </Label>
                      <Textarea
                        id="htmlTemplate"
                        value={form.htmlTemplate}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, htmlTemplate: event.target.value }))
                        }
                        placeholder={safePreviewHtml.trim()}
                        className="mt-2 min-h-80 font-mono text-xs"
                        required={form.mode === "html"}
                      />
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Code2 className="h-4 w-4" />
                        Placement guidance
                      </h3>
                      <ul className="mt-3 space-y-2 text-sm text-gray-600">
                        {htmlTemplateHints.map((hint) => (
                          <li key={hint} className="flex gap-2">
                            <span className="text-blue-600 shrink-0">•</span>
                            <span>{hint}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-xs text-gray-500">
                        Use <span className="font-mono">{"{{userName}}"}</span> for the learner name and <span className="font-mono">{"{{courseName}}"}</span> for the domain label.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={saving} className="gap-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Save Template
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Clear Form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Saved Templates</CardTitle>
                  <CardDescription>
                    Activate one template to make it live for all future certificates.
                  </CardDescription>
                </div>
                <Button variant="outline" onClick={() => void fetchTemplates()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : templates.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No templates created yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template._id}>
                          <TableCell className="font-medium text-gray-900">
                            {template.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={modeBadgeClass[template.mode]}>
                              {modeLabel[template.mode]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {template.isActive ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-700">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {template.createdAt
                              ? new Date(template.createdAt).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {!template.isActive ? (
                                <Button
                                  size="sm"
                                  onClick={() => void handleActivate(template._id)}
                                  disabled={pendingActionId === template._id}
                                >
                                  {pendingActionId === template._id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <ShieldCheck className="h-3 w-3" />
                                  )}
                                  Activate
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => void handleDelete(template._id)}
                                disabled={pendingActionId === template._id}
                              >
                                {pendingActionId === template._id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                                Delete
                              </Button>
                            </div>
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Placement Guide</CardTitle>
              <CardDescription>
                Use these anchors so the certificate content lands in the correct visual area.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>Put the learner name in the largest centered headline area.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>Place the domain or course name directly below the name as a subtitle.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>Keep certificate number and issue date in a bottom footer band.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-600 font-bold shrink-0">•</span>
                  <span>For HTML mode, use the backend tokens exactly as shown.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Supported HTML Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2 text-sm font-mono text-gray-700">
                <span>{"{{userName}}"}</span>
                <span>{"{{courseName}}"}</span>
                <span>{"{{certificateNumber}}"}</span>
                <span>{"{{certificateId}}"}</span>
                <span>{"{{issuedDate}}"}</span>
                <span>{"{{startDate}}"}</span>
                <span>{"{{endDate}}"}</span>
                <span>{"{{qrDataUrl}}"}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Rendering Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-6">
                If you want the certificate to look balanced, keep the name near the visual center, the domain/course label below it, and the certificate number/date aligned near the bottom or signature area. That gives the backend a clear layout to render consistently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
