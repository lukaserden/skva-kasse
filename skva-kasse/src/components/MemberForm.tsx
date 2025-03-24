import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Member, NewMember } from "@/types";

interface MemberState {
  id: number;
  name: string;
}

interface MemberFormProps {
  memberStates: MemberState[];
  onSave: (data: NewMember | Member) => void;
  onClose?: () => void;
  initialData?: Partial<Member>; // optional, für Bearbeiten
}

// Hilfstyp für das Formular: erlaubt unvollständige Member-Daten + optional id + created_at
type MemberFormData = Omit<Partial<Member>, "id" | "created_at"> & {
  id?: number;
  created_at?: string;
};

export default function MemberForm({
  memberStates,
  onSave,
  initialData,
}: MemberFormProps) {
  const defaultValues: MemberFormData = {
    first_name: "",
    last_name: "",
    birthdate: "",
    email: "",
    phone: "",
    membership_number: "",
    member_state_id: 1,
    discount: 0,
    is_active: 1,
    is_service_required: 1,
  };

  const [formData, setFormData] = useState<MemberFormData>({
    ...defaultValues,
    ...(initialData || {}),
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData]);

  const handleChange = (
    field: keyof MemberFormData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Member | NewMember); // jetzt sicher, alle Pflichtfelder vorhanden
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vorname</label>
          <Input
            value={formData.first_name}
            onChange={(e) => handleChange("first_name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nachname</label>
          <Input
            value={formData.last_name}
            onChange={(e) => handleChange("last_name", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Geburtsdatum</label>
        <Input
          type="date"
          value={formData.birthdate?.substring(0, 10)}
          onChange={(e) => handleChange("birthdate", e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Mitgliedsnummer
        </label>
        <Input
          value={formData.membership_number}
          onChange={(e) => handleChange("membership_number", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            E-Mail (optional)
          </label>
          <Input
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Telefon (optional)
          </label>
          <Input
            value={formData.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Rabatt (%)</label>
        <Input
          type="number"
          value={formData.discount ?? 0}
          onChange={(e) => handleChange("discount", Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select
          value={formData.member_state_id?.toString() || "1"}
          onValueChange={(val) => handleChange("member_state_id", Number(val))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status auswählen" />
          </SelectTrigger>
          <SelectContent>
            {memberStates.map((state) => (
              <SelectItem key={state.id} value={state.id.toString()}>
                {state.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <label className="flex items-center gap-2">
          <Switch
            checked={!!formData.is_active}
            onCheckedChange={(val) => handleChange("is_active", val)}
          />
          Aktiv
        </label>
        <label className="flex items-center gap-2">
          <Switch
            checked={!!formData.is_service_required}
            onCheckedChange={(val) => handleChange("is_service_required", val)}
          />
          Dienstpflicht
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Speichern</Button>
      </div>
    </form>
  );
}
