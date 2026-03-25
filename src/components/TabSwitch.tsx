interface TabSwitchProps {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
}

const TabSwitch = ({ tabs, active, onChange }: TabSwitchProps) => (
  <div className="flex rounded-lg overflow-hidden border border-border mb-4">
    {tabs.map((label, i) => (
      <button
        key={label}
        onClick={() => onChange(i)}
        className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
          active === i ? "tab-active" : "tab-inactive"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default TabSwitch;
