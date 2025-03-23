import { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Personnel, defaultPersonnel } from "@/types/personnel";
import { PersonnelForm } from "./personnel-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Download, Edit, Filter, Search, Trash2, UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

interface PersonnelTableProps {
  data: Personnel[];
  onAdd: (personnel: Personnel) => void;
  onEdit: (personnel: Personnel) => void;
  onDelete: (id: string) => void;
}

type ColumnVisibility = {
  [key in keyof Personnel]?: boolean;
};

export function PersonnelTable({
  data,
  onAdd,
  onEdit,
  onDelete,
}: PersonnelTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentPersonnel, setCurrentPersonnel] = useState<Personnel | null>(
    null,
  );
  const [sortColumn, setSortColumn] = useState<keyof Personnel | null>("unvan");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [secondarySortColumn, setSecondarySortColumn] =
    useState<keyof Personnel>("denetimKidemi");
  const [secondarySortDirection, setSecondarySortDirection] = useState<
    "asc" | "desc"
  >("desc");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    sicilNo: true,
    adSoyad: true,
    unvan: true,
    muhurNo: true,
    birim: true,
    servis: true,
    iseGirisTarihi: true,
    bankacilikKidemiBaslangicTarihi: true,
    ayriKalinanSureBankacilik: true,
    denetimKidemiBaslangicTarihi: true,
    ayriKalinanSureDenetim: true,
    terfiyeEklenecekSure: true,
    bankacilikKidemi: true,
    denetimKidemi: true,
    sonrakiTerfiTarihi: true,
    terfiyeUygun: true,
    istenCikisTarihi: true,
    durum: true,
  });

  const handleSort = (column: keyof Personnel) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // If changing from unvan to another column, store unvan as secondary sort
      if (sortColumn === "unvan") {
        setSecondarySortColumn("unvan");
        setSecondarySortDirection("desc");
      }
      // If changing from denetimKidemi to another column, store denetimKidemi as secondary sort
      else if (sortColumn === "denetimKidemi") {
        setSecondarySortColumn("denetimKidemi");
        setSecondarySortDirection("desc");
      }
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString || dateString === "-") return "-";
    try {
      return format(new Date(dateString), "dd.MM.yyyy", { locale: tr });
    } catch (error) {
      return dateString;
    }
  };

  const filteredData = data.filter((personnel) => {
    if (searchTerm === "") return true;

    const searchLower = searchTerm.toLowerCase();
    // Search in all string fields
    return Object.entries(personnel).some(([key, value]) => {
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchLower);
      } else if (typeof value === "number") {
        return value.toString().includes(searchLower);
      }
      return false;
    });
  });

  const compareSecondarySort = (a: Personnel, b: Personnel) => {
    const aValue = a[secondarySortColumn];
    const bValue = b[secondarySortColumn];

    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return secondarySortDirection === "asc" ? 1 : -1;
    if (bValue === null) return secondarySortDirection === "asc" ? -1 : 1;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return secondarySortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return secondarySortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  };

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === null && bValue === null) {
      // If primary sort values are equal, use secondary sort
      return compareSecondarySort(a, b);
    }
    if (aValue === null) return sortDirection === "asc" ? 1 : -1;
    if (bValue === null) return sortDirection === "asc" ? -1 : 1;

    let result = 0;
    if (typeof aValue === "string" && typeof bValue === "string") {
      result =
        sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      result = sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // If primary sort values are equal, use secondary sort
    return result === 0 ? compareSecondarySort(a, b) : result;
  });

  const handleEdit = (personnel: Personnel) => {
    setCurrentPersonnel(personnel);
    setEditDialogOpen(true);
  };

  const handleDelete = (personnel: Personnel) => {
    setCurrentPersonnel(personnel);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentPersonnel) {
      onDelete(currentPersonnel.id);
      setDeleteDialogOpen(false);
    }
  };

  const toggleStatus = (personnel: Personnel) => {
    const newStatus = personnel.durum === "Aktif" ? "Pasif" : "Aktif";
    const updatedPersonnel = { ...personnel, durum: newStatus };

    if (newStatus === "Pasif" && !personnel.istenCikisTarihi) {
      updatedPersonnel.istenCikisTarihi = format(new Date(), "yyyy-MM-dd");
    } else if (newStatus === "Aktif") {
      updatedPersonnel.istenCikisTarihi = null;
    }

    onEdit(updatedPersonnel);
  };

  const exportToExcel = async (format: "excel" | "html") => {
    const visibleColumns = Object.entries(columnVisibility)
      .filter(([_, visible]) => visible)
      .map(([key]) => key as keyof Personnel);

    const headers = visibleColumns.map((column) => {
      switch (column) {
        case "sicilNo":
          return "Sicil No";
        case "adSoyad":
          return "Ad Soyad";
        case "unvan":
          return "Unvan";
        case "muhurNo":
          return "Mühür No";
        case "birim":
          return "Birim";
        case "servis":
          return "Servis";
        case "iseGirisTarihi":
          return "İşe Giriş\nTarihi";
        case "bankacilikKidemiBaslangicTarihi":
          return "Bankacılık Kıdemi\nBaşlangıç Tarihi";
        case "ayriKalinanSureBankacilik":
          return "Ayrı Kalınan Süre\n(Bankacılık, Gün)";
        case "denetimKidemiBaslangicTarihi":
          return "Denetim Kıdemi\nBaşlangıç Tarihi";
        case "ayriKalinanSureDenetim":
          return "Ayrı Kalınan Süre\n(Denetim, Gün)";
        case "terfiyeEklenecekSure":
          return "Terfiye Eklenecek\nSüre (Gün)";
        case "bankacilikKidemi":
          return "Bankacılık Kıdemi\n(Yıl)";
        case "denetimKidemi":
          return "Denetim Kıdemi\n(Yıl)";
        case "sonrakiTerfiTarihi":
          return "Sonraki Terfi\nTarihi";
        case "terfiyeUygun":
          return "Terfiye\nUygun";
        case "istenCikisTarihi":
          return "İşten Çıkış\nTarihi";
        case "durum":
          return "Durum";
        default:
          return column;
      }
    });

    if (format === "excel") {
      try {
        // Use XLSX library for proper Excel export
        const XLSX = await import("xlsx");
        // Prepare data for Excel
        const excelData = sortedData.map((p) => {
          const row: Record<string, any> = {};

          visibleColumns.forEach((column) => {
            const headerText = headers[visibleColumns.indexOf(column)];
            const value = p[column];

            if (
              column === "iseGirisTarihi" ||
              column === "bankacilikKidemiBaslangicTarihi" ||
              column === "denetimKidemiBaslangicTarihi" ||
              column === "sonrakiTerfiTarihi" ||
              column === "istenCikisTarihi"
            ) {
              row[headerText] = formatDate(value as string);
            } else if (
              column === "bankacilikKidemi" ||
              column === "denetimKidemi"
            ) {
              row[headerText] =
                typeof value === "number" ? Number(value.toFixed(2)) : value;
            } else {
              row[headerText] = value;
            }
          });

          return row;
        });

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Personel Listesi");

        // Generate Excel file
        XLSX.writeFile(workbook, "personel-listesi.xlsx");
      } catch (error) {
        console.error("Excel dosyası oluşturulurken hata:", error);
      }
    } else if (format === "html") {
      // HTML export with improved styling
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Personel Listesi</title>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.4;
              color: #333;
              margin: 0 auto;
              padding: 15px;
              background-color: #f9fafb;
            }
            
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            
            .header h2 {
              color: rgb(29,79,145);
              margin-bottom: 2px;
              margin-top: 10px;
              font-weight: 700;
              font-size: 22px;
            }
            
            .header h3 {
              color: rgb(29,79,145);
              margin-top: 0;
              margin-bottom: 2px;
              font-weight: 700;
              font-size: 18px;
            }
            
            .header h1 {
              color: #444444;
              margin-top: 0;
              font-weight: 400;
              font-size: 16px;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              background-color: white;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
              border-radius: 4px;
              overflow: hidden;
              font-size: 12px;
              table-layout: auto;
            }
            
            th, td {
              border: 1px solid #e5e7eb;
              padding: 6px 8px;
              text-align: left;
              white-space: nowrap;
            }
            
            td.center {
              text-align: center;
            }
            
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              color: #374151;
              text-transform: capitalize;
              font-size: 12px;
              text-align: center;
            }
            
            td {
              font-size: 11px;
            }
            
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            
            tr:hover {
              background-color: #f3f4f6;
            }
            
            .footer {
              margin-top: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Vakıf Katılım Bankası</h2>
            <h3>Teftiş Kurulu Başkanlığı</h3>
            <h1>Personel Listesi</h1>
          </div>
          
          <table>
            <thead>
              <tr>
                ${headers
                  .map(
                    (header) =>
                      `<th>${header
                        .split("\n")
                        .map(
                          (line) =>
                            line.charAt(0).toUpperCase() +
                            line.slice(1).toLowerCase(),
                        )
                        .join("<br/>")}</th>`,
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
      `;

      sortedData.forEach((p) => {
        htmlContent += "<tr>";
        visibleColumns.forEach((column) => {
          const value = p[column];
          let displayValue;

          if (
            column === "iseGirisTarihi" ||
            column === "bankacilikKidemiBaslangicTarihi" ||
            column === "denetimKidemiBaslangicTarihi" ||
            column === "sonrakiTerfiTarihi" ||
            column === "istenCikisTarihi"
          ) {
            displayValue = formatDate(value as string);
          } else if (
            column === "bankacilikKidemi" ||
            column === "denetimKidemi"
          ) {
            displayValue = typeof value === "number" ? value.toFixed(2) : value;
          } else {
            displayValue = value;
          }

          // Center align specific columns
          const shouldCenter = [
            "sicilNo",
            "muhurNo",
            "iseGirisTarihi",
            "bankacilikKidemiBaslangicTarihi",
            "ayriKalinanSureBankacilik",
            "denetimKidemiBaslangicTarihi",
            "ayriKalinanSureDenetim",
            "terfiyeEklenecekSure",
            "bankacilikKidemi",
            "denetimKidemi",
            "sonrakiTerfiTarihi",
            "terfiyeUygun",
            "istenCikisTarihi",
          ].includes(column);

          htmlContent += `<td${shouldCenter ? ' class="center"' : ""}>${displayValue}</td>`;
        });
        htmlContent += "</tr>";
      });

      htmlContent += `
            </tbody>
          </table>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} Vakıf Katılım Bankası - Teftiş Kurulu Başkanlığı</p>
          </div>
        </body>
        </html>
      `;

      try {
        const blob = new Blob([htmlContent], {
          type: "text/html;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "personel-listesi.html");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up by revoking the object URL
      } catch (error) {
        console.error("HTML dosyası oluşturulurken hata:", error);
      }
    }

    setExportDialogOpen(false);
  };

  const toggleColumnVisibility = (column: keyof Personnel) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const visibleColumns = Object.entries(columnVisibility)
    .filter(([_, visible]) => visible)
    .map(([key]) => key as keyof Personnel);

  return (
    <div className="space-y-4 bg-background p-4 rounded-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Personel ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setAddDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Personel Ekle
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Sütunlar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Görünür Sütunlar</h4>
                  <p className="text-sm text-muted-foreground">
                    Tabloda görmek istediğiniz sütunları seçin
                  </p>
                </div>
                <div className="grid gap-2">
                  {Object.keys(columnVisibility).map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={column}
                        checked={columnVisibility[column as keyof Personnel]}
                        onCheckedChange={() =>
                          toggleColumnVisibility(column as keyof Personnel)
                        }
                      />
                      <Label htmlFor={column}>
                        {column === "sicilNo"
                          ? "Sicil No"
                          : column === "adSoyad"
                            ? "Ad Soyad"
                            : column === "unvan"
                              ? "Unvan"
                              : column === "muhurNo"
                                ? "Mühür No"
                                : column === "birim"
                                  ? "Birim"
                                  : column === "servis"
                                    ? "Servis"
                                    : column === "iseGirisTarihi"
                                      ? "İşe Giriş Tarihi"
                                      : column ===
                                          "bankacilikKidemiBaslangicTarihi"
                                        ? "Bankacılık Kıdemi Başlangıç Tarihi"
                                        : column === "ayriKalinanSureBankacilik"
                                          ? "Ayrı Kalınan Süre (Bankacılık)"
                                          : column ===
                                              "denetimKidemiBaslangicTarihi"
                                            ? "Denetim Kıdemi Başlangıç Tarihi"
                                            : column ===
                                                "ayriKalinanSureDenetim"
                                              ? "Ayrı Kalınan Süre (Denetim)"
                                              : column ===
                                                  "terfiyeEklenecekSure"
                                                ? "Terfiye Eklenecek Süre"
                                                : column === "bankacilikKidemi"
                                                  ? "Bankacılık Kıdemi (Yıl)"
                                                  : column === "denetimKidemi"
                                                    ? "Denetim Kıdemi (Yıl)"
                                                    : column ===
                                                        "sonrakiTerfiTarihi"
                                                      ? "Sonraki Terfi Tarihi"
                                                      : column ===
                                                          "terfiyeUygun"
                                                        ? "Terfiye Uygun"
                                                        : column ===
                                                            "istenCikisTarihi"
                                                          ? "İşten Çıkış Tarihi"
                                                          : column === "durum"
                                                            ? "Durum"
                                                            : column}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>Personel Listesi</TableCaption>
            <TableHeader>
              <TableRow>
                {visibleColumns.includes("sicilNo") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("sicilNo")}
                  >
                    Sicil No{" "}
                    {sortColumn === "sicilNo" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("adSoyad") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("adSoyad")}
                  >
                    Ad Soyad{" "}
                    {sortColumn === "adSoyad" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("unvan") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("unvan")}
                  >
                    Unvan{" "}
                    {sortColumn === "unvan" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("muhurNo") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("muhurNo")}
                  >
                    Mühür No{" "}
                    {sortColumn === "muhurNo" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("birim") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("birim")}
                  >
                    Birim{" "}
                    {sortColumn === "birim" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("servis") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("servis")}
                  >
                    Servis{" "}
                    {sortColumn === "servis" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("iseGirisTarihi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("iseGirisTarihi")}
                  >
                    İşe Giriş Tarihi{" "}
                    {sortColumn === "iseGirisTarihi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("bankacilikKidemiBaslangicTarihi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() =>
                      handleSort("bankacilikKidemiBaslangicTarihi")
                    }
                  >
                    Bankacılık Kıdemi Başlangıç{" "}
                    {sortColumn === "bankacilikKidemiBaslangicTarihi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("ayriKalinanSureBankacilik") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("ayriKalinanSureBankacilik")}
                  >
                    Ayrı Kalınan Süre (Bankacılık){" "}
                    {sortColumn === "ayriKalinanSureBankacilik" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("denetimKidemiBaslangicTarihi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("denetimKidemiBaslangicTarihi")}
                  >
                    Denetim Kıdemi Başlangıç{" "}
                    {sortColumn === "denetimKidemiBaslangicTarihi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("ayriKalinanSureDenetim") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("ayriKalinanSureDenetim")}
                  >
                    Ayrı Kalınan Süre (Denetim){" "}
                    {sortColumn === "ayriKalinanSureDenetim" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("terfiyeEklenecekSure") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("terfiyeEklenecekSure")}
                  >
                    Terfiye Eklenecek Süre{" "}
                    {sortColumn === "terfiyeEklenecekSure" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("bankacilikKidemi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("bankacilikKidemi")}
                  >
                    Bankacılık Kıdemi (Yıl){" "}
                    {sortColumn === "bankacilikKidemi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("denetimKidemi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("denetimKidemi")}
                  >
                    Denetim Kıdemi (Yıl){" "}
                    {sortColumn === "denetimKidemi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("sonrakiTerfiTarihi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("sonrakiTerfiTarihi")}
                  >
                    Sonraki Terfi Tarihi{" "}
                    {sortColumn === "sonrakiTerfiTarihi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("terfiyeUygun") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("terfiyeUygun")}
                  >
                    Terfiye Uygun{" "}
                    {sortColumn === "terfiyeUygun" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("istenCikisTarihi") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("istenCikisTarihi")}
                  >
                    İşten Çıkış Tarihi{" "}
                    {sortColumn === "istenCikisTarihi" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                {visibleColumns.includes("durum") && (
                  <TableHead
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => handleSort("durum")}
                  >
                    Durum{" "}
                    {sortColumn === "durum" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                )}
                <TableHead className="whitespace-nowrap">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    className="text-center"
                  >
                    Kayıt bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                sortedData.map((personnel) => (
                  <TableRow key={personnel.id}>
                    {visibleColumns.includes("sicilNo") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {personnel.sicilNo}
                      </TableCell>
                    )}
                    {visibleColumns.includes("adSoyad") && (
                      <TableCell className="whitespace-nowrap">
                        {personnel.adSoyad}
                      </TableCell>
                    )}
                    {visibleColumns.includes("unvan") && (
                      <TableCell className="whitespace-nowrap">
                        {personnel.unvan}
                      </TableCell>
                    )}
                    {visibleColumns.includes("muhurNo") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {personnel.muhurNo}
                      </TableCell>
                    )}
                    {visibleColumns.includes("birim") && (
                      <TableCell className="whitespace-nowrap">
                        {personnel.birim}
                      </TableCell>
                    )}
                    {visibleColumns.includes("servis") && (
                      <TableCell className="whitespace-nowrap">
                        {personnel.servis || "-"}
                      </TableCell>
                    )}
                    {visibleColumns.includes("iseGirisTarihi") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {formatDate(personnel.iseGirisTarihi)}
                      </TableCell>
                    )}
                    {visibleColumns.includes(
                      "bankacilikKidemiBaslangicTarihi",
                    ) && (
                      <TableCell className="whitespace-nowrap text-center">
                        {formatDate(personnel.bankacilikKidemiBaslangicTarihi)}
                      </TableCell>
                    )}
                    {visibleColumns.includes("ayriKalinanSureBankacilik") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {personnel.ayriKalinanSureBankacilik}
                      </TableCell>
                    )}
                    {visibleColumns.includes(
                      "denetimKidemiBaslangicTarihi",
                    ) && (
                      <TableCell className="whitespace-nowrap text-center">
                        {formatDate(personnel.denetimKidemiBaslangicTarihi)}
                      </TableCell>
                    )}
                    {visibleColumns.includes("ayriKalinanSureDenetim") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {personnel.ayriKalinanSureDenetim}
                      </TableCell>
                    )}
                    {visibleColumns.includes("terfiyeEklenecekSure") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {personnel.terfiyeEklenecekSure}
                      </TableCell>
                    )}
                    {visibleColumns.includes("bankacilikKidemi") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {typeof personnel.bankacilikKidemi === "number"
                          ? personnel.bankacilikKidemi.toFixed(2)
                          : personnel.bankacilikKidemi}
                      </TableCell>
                    )}
                    {visibleColumns.includes("denetimKidemi") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {typeof personnel.denetimKidemi === "number"
                          ? personnel.denetimKidemi.toFixed(2)
                          : personnel.denetimKidemi}
                      </TableCell>
                    )}
                    {visibleColumns.includes("sonrakiTerfiTarihi") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {formatDate(personnel.sonrakiTerfiTarihi)}
                      </TableCell>
                    )}
                    {visibleColumns.includes("terfiyeUygun") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {personnel.terfiyeUygun}
                      </TableCell>
                    )}
                    {visibleColumns.includes("istenCikisTarihi") && (
                      <TableCell className="whitespace-nowrap text-center">
                        {formatDate(personnel.istenCikisTarihi)}
                      </TableCell>
                    )}
                    {visibleColumns.includes("durum") && (
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`status-${personnel.id}`}
                            checked={personnel.durum === "Aktif"}
                            onCheckedChange={() => toggleStatus(personnel)}
                          />
                          <Label htmlFor={`status-${personnel.id}`}>
                            {personnel.durum}
                          </Label>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(personnel)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(personnel)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {addDialogOpen && (
        <PersonnelForm
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          title="Yeni Personel Ekle"
          initialData={defaultPersonnel}
          allPersonnel={data}
          onSubmit={(personnel) => {
            onAdd(personnel);
            setAddDialogOpen(false);
          }}
        />
      )}

      {editDialogOpen && currentPersonnel && (
        <PersonnelForm
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          initialData={currentPersonnel}
          title="Personel Düzenle"
          allPersonnel={data}
          onSubmit={(personnel) => {
            onEdit(personnel);
            setEditDialogOpen(false);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Personel Kaydını Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu personel kaydını silmek istediğinizden
              emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dışa Aktarma Formatı Seçin</DialogTitle>
            <DialogDescription>
              Personel listesini hangi formatta dışa aktarmak istiyorsunuz?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 pt-4">
            <Button onClick={() => exportToExcel("excel")}>
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button onClick={() => exportToExcel("html")}>
              <Download className="mr-2 h-4 w-4" />
              HTML
            </Button>
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                İptal
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
