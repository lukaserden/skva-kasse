import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Artikel } from "@/types";

interface ArtikelFormProps {
  initialData?: Artikel;
  onSave: (data: Partial<Artikel>) => void;
  onClose: () => void;
}

export default function ArticleForm({ initialData, onSave, onClose }: ArtikelFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData ? initialData.price / 100 : 0,
    stock: initialData?.stock ?? null,
    unit: initialData?.unit || "",
    category_id: initialData?.category_id || 1,
    is_active: initialData?.is_active === 1,
  });

  const handleChange = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Math.round(Number(form.price) * 100),
      is_active: form.is_active ? 1 : 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Beschreibung</Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div>
        <Label>Preis (CHF)</Label>
        <Input
          type="number"
          step="0.05"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Einheit</Label>
        <Input
          value={form.unit}
          onChange={(e) => handleChange("unit", e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Kategorie-ID</Label>
        <Input
          type="number"
          value={form.category_id}
          onChange={(e) => handleChange("category_id", Number(e.target.value))}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={form.is_active}
          onCheckedChange={(checked) => handleChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Aktiv</Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
        <Button type="submit">Speichern</Button>
      </div>
    </form>
  );
}
