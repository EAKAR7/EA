import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Personnel,
  defaultPersonnel,
  unvanOptions,
  birimOptions,
  servisOptions,
  terfiyeUygunOptions,
} from "@/types/personnel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { addYears, differenceInDays, format } from "date-fns";

const formSchema = z.object({
  sicilNo: z.string().min(1, { message: "Sicil numarası zorunludur" }),
  adSoyad: z.string().min(1, { message: "Ad Soyad zorunludur" }),
  unvan: z.string().min(1, { message: "Unvan zorunludur" }),
  muhurNo: z.string(),
  birim: z.string().min(1, { message: "Birim zorunludur" }),
  servis: z.string().optional(),
  iseGirisTarihi: z.string().min(1, { message: "İşe giriş tarihi zorunludur" }),
  bankacilikKidemiBaslangicTarihi: z
    .string()
    .min(1, { message: "Bankacılık kıdemi başlangıç tarihi zorunludur" }),
  ayriKalinanSureBankacilik: z.coerce.number(),
  denetimKidemiBaslangicTarihi: z
    .string()
    .min(1, { message: "Denetim kıdemi başlangıç tarihi zorunludur" }),
  ayriKalinanSureDenetim: z.coerce.number(),
  terfiyeEklenecekSure: z.coerce.number().default(0),
  bankacilikKidemi: z.coerce.number(),
  denetimKidemi: z.coerce.number(),
  sonrakiTerfiTarihi: z.string(),
  terfiyeUygun: z.string(),
  istenCikisTarihi: z.string().optional().nullable(),
  durum: z.string().default("Aktif"),
});

interface PersonnelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Personnel) => void;
  initialData?: Personnel;
  title: string;
  allPersonnel: Personnel[];
}

export function PersonnelForm({
  open = true,
  onOpenChange,
  onSubmit,
  initialData = defaultPersonnel,
  title,
  allPersonnel,
}: PersonnelFormProps) {
  const [sicilNoExists, setSicilNoExists] = useState(false);
  const isEditing = !!initialData.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const unvan = useWatch({ control: form.control, name: "unvan" });
  const birim = useWatch({ control: form.control, name: "birim" });
  const denetimKidemiBaslangicTarihi = useWatch({
    control: form.control,
    name: "denetimKidemiBaslangicTarihi",
  });
  const bankacilikKidemiBaslangicTarihi = useWatch({
    control: form.control,
    name: "bankacilikKidemiBaslangicTarihi",
  });
  const ayriKalinanSureDenetim = useWatch({
    control: form.control,
    name: "ayriKalinanSureDenetim",
  });
  const ayriKalinanSureBankacilik = useWatch({
    control: form.control,
    name: "ayriKalinanSureBankacilik",
  });
  const istenCikisTarihi = useWatch({
    control: form.control,
    name: "istenCikisTarihi",
  });
  const terfiyeEklenecekSure = useWatch({
    control: form.control,
    name: "terfiyeEklenecekSure",
  });

  // Check if sicil no exists
  const checkSicilNoExists = (sicilNo: string) => {
    if (!isEditing && sicilNo) {
      const exists = allPersonnel.some((p) => p.sicilNo === sicilNo);
      setSicilNoExists(exists);
      return exists;
    }
    return false;
  };

  // Calculate kıdem values
  useEffect(() => {
    if (bankacilikKidemiBaslangicTarihi) {
      try {
        const today = new Date();
        const startDate = new Date(bankacilikKidemiBaslangicTarihi);
        const daysApart =
          differenceInDays(today, startDate) - (ayriKalinanSureBankacilik || 0);
        const years = daysApart / 365.25;
        form.setValue("bankacilikKidemi", parseFloat(years.toFixed(2)));
      } catch (error) {
        console.error("Bankacılık kıdemi hesaplanırken hata:", error);
        form.setValue("bankacilikKidemi", 0);
      }
    }
  }, [bankacilikKidemiBaslangicTarihi, ayriKalinanSureBankacilik, form]);

  useEffect(() => {
    if (denetimKidemiBaslangicTarihi) {
      try {
        const today = new Date();
        const startDate = new Date(denetimKidemiBaslangicTarihi);
        const daysApart =
          differenceInDays(today, startDate) - (ayriKalinanSureDenetim || 0);
        const years = daysApart / 365.25;
        form.setValue("denetimKidemi", parseFloat(years.toFixed(2)));
      } catch (error) {
        console.error("Denetim kıdemi hesaplanırken hata:", error);
        form.setValue("denetimKidemi", 0);
      }
    }
  }, [denetimKidemiBaslangicTarihi, ayriKalinanSureDenetim, form]);

  // Set mühür no based on unvan
  useEffect(() => {
    if (unvan === "Müfettiş Yardımcısı") {
      form.setValue("muhurNo", "-");
    } else if (form.getValues("muhurNo") === "-") {
      form.setValue("muhurNo", "");
    }

    // Set birim automatically when unvan is Başkan
    if (unvan === "Başkan") {
      form.setValue("birim", "Teftiş Kurulu Başkanlığı");
      form.setValue("servis", "-");
    }
  }, [unvan, form]);

  // Set terfiye uygun based on unvan
  useEffect(() => {
    if (
      unvan === "Başmüfettiş" ||
      unvan === "Başkan Yardımcısı" ||
      unvan === "Başkan"
    ) {
      form.setValue("terfiyeUygun", "-");
    } else if (form.getValues("terfiyeUygun") === "-") {
      form.setValue("terfiyeUygun", "Evet");
    }
  }, [unvan, form]);

  // Calculate sonraki terfi tarihi
  useEffect(() => {
    if (denetimKidemiBaslangicTarihi && unvan) {
      let years = 0;
      if (unvan === "Müfettiş Yardımcısı") {
        years = 2;
      } else if (unvan === "Yetkili Müfettiş Yardımcısı") {
        years = 3;
      } else if (unvan === "Müfettiş") {
        years = 5;
      } else if (unvan === "Kıdemli Müfettiş") {
        years = 7;
      } else {
        form.setValue("sonrakiTerfiTarihi", "-");
        return;
      }

      try {
        // Parse the date string to ensure correct format
        const startDate = new Date(denetimKidemiBaslangicTarihi);
        // Use addYears from date-fns to correctly add years
        const terfiyeDate = addYears(startDate, years);

        // Add terfiyeEklenecekSure - ensure it's a number
        const ekSure = Number(terfiyeEklenecekSure) || 0;

        // Create a new date to avoid mutation issues
        const finalDate = new Date(terfiyeDate);
        finalDate.setDate(finalDate.getDate() + ekSure);

        form.setValue("sonrakiTerfiTarihi", format(finalDate, "yyyy-MM-dd"));
      } catch (error) {
        console.error("Error calculating terfi tarihi:", error);
        form.setValue("sonrakiTerfiTarihi", "");
      }
    }
  }, [denetimKidemiBaslangicTarihi, unvan, form, terfiyeEklenecekSure]);

  // Set durum based on istenCikisTarihi
  useEffect(() => {
    if (istenCikisTarihi) {
      form.setValue("durum", "Pasif");
    } else {
      form.setValue("durum", "Aktif");
    }
  }, [istenCikisTarihi, form]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    // Don't submit if sicil no exists and we're not editing
    if (checkSicilNoExists(values.sicilNo)) {
      return;
    }

    try {
      const submitData = {
        ...values,
        id: initialData.id || crypto.randomUUID(),
        bankacilikKidemi: parseFloat((values.bankacilikKidemi || 0).toFixed(2)),
        denetimKidemi: parseFloat((values.denetimKidemi || 0).toFixed(2)),
      };

      onSubmit(submitData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Form gönderilirken hata:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sicilNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sicil No</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Sicil No"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          checkSicilNoExists(e.target.value);
                        }}
                      />
                    </FormControl>
                    {sicilNoExists && !isEditing && (
                      <p className="text-sm font-medium text-destructive">
                        Personel kaydı bulunmaktadır.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adSoyad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad Soyad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unvan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unvan</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unvan seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unvanOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="muhurNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mühür No</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mühür No"
                        {...field}
                        disabled={unvan === "Müfettiş Yardımcısı"}
                        type={
                          unvan === "Müfettiş Yardımcısı" ? "text" : "number"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birim</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("servis", "");
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Birim seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {birimOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="servis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servis</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={
                        unvan === "Başkan Yardımcısı" || unvan === "Başkan"
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Servis seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {birim &&
                          (unvan === "Başkan" ||
                          unvan === "Başkan Yardımcısı" ? (
                            <SelectItem value="-">-</SelectItem>
                          ) : (
                            servisOptions[
                              birim as keyof typeof servisOptions
                            ]?.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iseGirisTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşe Giriş Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="istenCikisTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İşten Çıkış Tarihi</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>Boş bırakılabilir</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankacilikKidemiBaslangicTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bankacılık Kıdemi Başlangıç Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ayriKalinanSureBankacilik"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ayrı Kalınan Süre (Bankacılık, Gün)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="-99999"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.value,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="denetimKidemiBaslangicTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Denetim Kıdemi Başlangıç Tarihi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ayriKalinanSureDenetim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ayrı Kalınan Süre (Denetim, Gün)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="-99999"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.value,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bankacilikKidemi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bankacılık Kıdemi (Yıl)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="denetimKidemi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Denetim Kıdemi (Yıl)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terfiyeEklenecekSure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terfiye Eklenecek Süre (Gün)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="-99999"
                        {...field}
                        value={field.value || 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? 0 : e.target.value,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sonrakiTerfiTarihi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sonraki Terfi Tarihi</FormLabel>
                    <FormControl>
                      {unvan === "Başmüfettiş" ||
                      unvan === "Başkan Yardımcısı" ||
                      unvan === "Başkan" ? (
                        <Input value="-" disabled />
                      ) : (
                        <Input type="date" {...field} disabled />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="terfiyeUygun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terfiye Uygun</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={
                        unvan === "Başmüfettiş" ||
                        unvan === "Başkan Yardımcısı" ||
                        unvan === "Başkan"
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {terfiyeUygunOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durum</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (
                          value === "Pasif" &&
                          !form.getValues("istenCikisTarihi")
                        ) {
                          form.setValue(
                            "istenCikisTarihi",
                            format(new Date(), "yyyy-MM-dd"),
                          );
                        } else if (value === "Aktif") {
                          form.setValue("istenCikisTarihi", null);
                        }
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Durum seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Pasif">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={sicilNoExists && !isEditing}>
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
