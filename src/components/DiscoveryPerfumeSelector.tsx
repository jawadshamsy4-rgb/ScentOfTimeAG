import { useProducts } from "@/hooks/useProducts";

interface DiscoveryPerfumeSelectorProps {
  count: number;
  sourceCategory: string;
  perfumeSize?: string;
  selections: string[];
  onSelectionsChange: (selections: string[]) => void;
}

const DiscoveryPerfumeSelector = ({
  count,
  sourceCategory,
  perfumeSize = "6ML",
  selections,
  onSelectionsChange,
}: DiscoveryPerfumeSelectorProps) => {
  const { data: allProducts = [] } = useProducts();

  const target = (sourceCategory || "").toLowerCase().trim();
  const availablePerfumes = allProducts.filter(
    (p) =>
      p.category.toLowerCase() === target &&
      p.category.toLowerCase() !== "discovery"
  );

  const handleChange = (index: number, value: string) => {
    const updated = [...selections];
    updated[index] = value;
    onSelectionsChange(updated);
  };

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-4 py-2.5 font-body text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer";

  return (
    <div className="mb-8">
      <p className="font-body text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
        Select Your Perfumes
      </p>
      {availablePerfumes.length === 0 && (
        <p className="font-body text-[12px] text-muted-foreground mb-3">
          No perfumes available in the selected source category.
        </p>
      )}
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => {
          const otherSelections = selections.filter((_, idx) => idx !== i && _ !== "");

          return (
            <div key={i}>
              <label className="font-body text-[11px] font-medium text-muted-foreground mb-1 block">
                Perfume No. {i + 1} *
              </label>
              <select
                value={selections[i] || ""}
                onChange={(e) => handleChange(i, e.target.value)}
                className={inputClass}
              >
                <option value="">Select a perfume</option>
                {availablePerfumes.map((p) => {
                  const isSelectedElsewhere = otherSelections.includes(p.name);
                  return (
                    <option
                      key={p.id}
                      value={p.name}
                      disabled={isSelectedElsewhere}
                    >
                      {p.name} — {perfumeSize}
                      {isSelectedElsewhere ? " (already selected)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DiscoveryPerfumeSelector;
