/**
 * @file Client Component for dynamic data entry form.
 */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createGenericDataLog } from "@/app/actions/data-entry-actions";
import { useFacilityStore } from "@/app/store/facility-store";
import { DataFieldTemplate, DataFieldType, EmissionFactor } from "@repo/db";

interface DynamicDataEntryFormProps {
  dataFields: (DataFieldTemplate & { emissionFactors: EmissionFactor[] })[];
  reportId: string;
}

export function DynamicDataEntryForm({
  dataFields,
  reportId,
}: DynamicDataEntryFormProps) {
  const { activeFacilityId } = useFacilityStore();
  const [selectedDataField, setSelectedDataField] = useState<string | null>(null);
  const [availableEmissionFactors, setAvailableEmissionFactors] = useState<EmissionFactor[]>([]);

  const handleDataFieldChange = (dataFieldId: string) => {
    setSelectedDataField(dataFieldId);
    const field = dataFields.find((df) => df.id === dataFieldId);
    setAvailableEmissionFactors(field?.emissionFactors || []);
  };

  return (
    <form action={async (formData) => {
      if (!activeFacilityId) {
        console.error("No active facility selected.");
        return;
      }
      formData.append("facilityId", activeFacilityId);
      formData.append("reportId", reportId);

      const result = await createGenericDataLog(formData);
      if (!result.success) {
        console.error(result.message);
      } else {
        console.log(result.message);
        // Optionally clear form or show success message
      }
    }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="dataFieldId">Data Field</Label>
        <Select name="dataFieldId" onValueChange={handleDataFieldChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a data field" />
          </SelectTrigger>
          <SelectContent>
            {dataFields.map((field) => (
              <SelectItem key={field.id} value={field.id}>
                {field.fieldName} ({field.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedDataField && (
        <>
          <div>
            <Label htmlFor="emissionFactorId">Emission Factor</Label>
            <Select name="emissionFactorId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select an emission factor" />
              </SelectTrigger>
              <SelectContent>
                {availableEmissionFactors.map((ef) => (
                  <SelectItem key={ef.id} value={ef.id}>
                    {ef.name} ({ef.value} {ef.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(() => {
            const field = dataFields.find((df) => df.id === selectedDataField);
            if (!field) return null;

            switch (field.fieldType) {
              case DataFieldType.TEXT:
                return (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input type="text" name="value" required />
                  </div>
                );
              case DataFieldType.NUMBER:
                return (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input type="number" step="any" name="value" required />
                  </div>
                );
              case DataFieldType.DATE:
                return (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input type="date" name="value" required />
                  </div>
                );
              case DataFieldType.BOOLEAN:
                return (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Select name="value" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select true/false" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              case DataFieldType.SELECT:
                return (
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Select name="value" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </>
      )}

      <div className="md:col-span-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea name="notes" />
      </div>

      <Button type="submit" className="md:col-span-2">Log Data</Button>
    </form>
  );
}
