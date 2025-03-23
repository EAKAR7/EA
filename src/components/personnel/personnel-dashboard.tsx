import { useState, useEffect } from "react";
import { Personnel, defaultPersonnel } from "@/types/personnel";
import { PersonnelTable } from "./personnel-table";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PersonnelDashboard() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [databaseUrl, setDatabaseUrl] = useState("");

  // Load data and settings from localStorage on component mount
  useEffect(() => {
    const savedPersonnel = localStorage.getItem("personnel");
    if (savedPersonnel) {
      try {
        setPersonnel(JSON.parse(savedPersonnel));
      } catch (error) {
        console.error("Error parsing personnel data:", error);
      }
    }

    const savedDatabaseUrl = localStorage.getItem("databaseUrl");
    if (savedDatabaseUrl) {
      setDatabaseUrl(savedDatabaseUrl);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("personnel", JSON.stringify(personnel));
  }, [personnel]);

  // Save database URL to localStorage
  const saveDatabaseUrl = (url: string) => {
    localStorage.setItem("databaseUrl", url);
    setDatabaseUrl(url);
  };

  // Create template database
  const createTemplateDatabase = () => {
    try {
      // Download empty database file
      const emptyDatabase = [];
      const jsonString = JSON.stringify(emptyDatabase, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "personel-veritabani.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up by revoking the object URL

      setSettingsOpen(false);
    } catch (error) {
      console.error("Veritabanı şablonu oluşturulurken hata:", error);
    }
  };

  const handleAddPersonnel = (newPersonnel: Personnel) => {
    setPersonnel([...personnel, newPersonnel]);
  };

  const handleEditPersonnel = (updatedPersonnel: Personnel) => {
    setPersonnel(
      personnel.map((p) =>
        p.id === updatedPersonnel.id ? updatedPersonnel : p,
      ),
    );
  };

  const handleDeletePersonnel = (id: string) => {
    setPersonnel(personnel.filter((p) => p.id !== id));
  };

  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const filteredPersonnel = showOnlyActive
    ? personnel.filter((p) => p.durum === "Aktif")
    : personnel;

  return (
    <div className="container mx-auto py-6 bg-background">
      <div className="flex justify-between items-center mb-6">
        <div className="text-left">
          <h2 className="text-xl font-bold" style={{ color: "rgb(29,79,145)" }}>
            Vakıf Katılım Bankası
          </h2>
          <h3
            className="text-lg font-semibold"
            style={{ color: "rgb(29,79,145)" }}
          >
            Teftiş Kurulu Başkanlığı
          </h3>
          <h1 className="text-md font-normal mt-1 text-gray-700">
            Personel Yönetim Sistemi
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showOnlyActive ? "default" : "outline"}
            onClick={() => setShowOnlyActive(!showOnlyActive)}
          >
            {showOnlyActive
              ? "Tüm Personeli Göster"
              : "Sadece Aktif Personeli Göster"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <PersonnelTable
        data={filteredPersonnel}
        onAdd={handleAddPersonnel}
        onEdit={handleEditPersonnel}
        onDelete={handleDeletePersonnel}
      />

      <Dialog
        open={settingsOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Reset to saved value when closing without saving
            const savedUrl = localStorage.getItem("databaseUrl") || "";
            setDatabaseUrl(savedUrl);
          }
          setSettingsOpen(open);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Veritabanı Ayarları</DialogTitle>
            <DialogDescription>
              Veritabanı bağlantı ayarlarını yapılandırın.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="database-url" className="col-span-4">
                Veritabanı URL
              </Label>
              <Input
                id="database-url"
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                placeholder="https://example.com/api/db"
                className="col-span-4"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={createTemplateDatabase}
            >
              Şablon Veritabanı Oluştur
            </Button>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Reset to saved value
                  const savedUrl = localStorage.getItem("databaseUrl") || "";
                  setDatabaseUrl(savedUrl);
                  setSettingsOpen(false);
                }}
              >
                İptal
              </Button>
              <Button
                type="button"
                onClick={() => {
                  saveDatabaseUrl(databaseUrl);
                  setSettingsOpen(false);
                }}
              >
                Kaydet
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
