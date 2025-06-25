import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import React, { useState } from "react";

interface SalaryFilterProps {
  onApply?: (min: number, max: number) => void;
}

const SalaryFilter = ({ onApply }: SalaryFilterProps) => {
  const [range, setRange] = useState<[number, number]>([50000, 150000]);
  const [minValue, setMinValue] = useState(range[0].toString());
  const [maxValue, setMaxValue] = useState(range[1].toString());

  const handleRangeChange = (values: number[]) => {
    const [min, max] = values as [number, number];
    setRange([min, max]);
    setMinValue(min.toString());
    setMaxValue(max.toString());
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    if (type === "min") {
      setMinValue(value);
      if (value && parseInt(value) <= range[1]) {
        setRange([parseInt(value), range[1]]);
      }
    } else {
      setMaxValue(value);
      if (value && parseInt(value) >= range[0]) {
        setRange([range[0], parseInt(value)]);
      }
    }
  };

  const handleApply = () => {
    if (onApply) {
      onApply(range[0], range[1]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Salary Range</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Slider
            defaultValue={[50000, 150000]}
            min={0}
            max={250000}
            step={1000}
            value={range}
            onValueChange={handleRangeChange}
            className="py-4"
          />

          <div className="flex items-center gap-4">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="min">Min</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="min"
                  type="text"
                  className="pl-6"
                  value={minValue}
                  onChange={(e) => handleInputChange(e, "min")}
                />
              </div>
            </div>
            <div className="grid gap-2 flex-1">
              <Label htmlFor="max">Max</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="max"
                  type="text"
                  className="pl-6"
                  value={maxValue}
                  onChange={(e) => handleInputChange(e, "max")}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Popular Ranges</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRange([30000, 50000]);
                setMinValue("30000");
                setMaxValue("50000");
              }}
            >
              $30k - $50k
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRange([50000, 80000]);
                setMinValue("50000");
                setMaxValue("80000");
              }}
            >
              $50k - $80k
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRange([80000, 120000]);
                setMinValue("80000");
                setMaxValue("120000");
              }}
            >
              $80k - $120k
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRange([120000, 200000]);
                setMinValue("120000");
                setMaxValue("200000");
              }}
            >
              $120k+
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleApply}>
          Apply Filter
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SalaryFilter; 