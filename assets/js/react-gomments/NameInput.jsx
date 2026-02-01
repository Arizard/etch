export default function NameInput({ value, onChange, error }) {
  return (
    <div className="field-group">
      <input
        type="text"
        id="gomments-input-name"
        name="name"
        placeholder="(optional) add your name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'validation-error' : undefined}
      />
    </div>
  );
}
