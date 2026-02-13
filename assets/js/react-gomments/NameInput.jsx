export default function NameInput({ value, onChange, error }) {
  return (
    <div className="field-group">
      <input
        type="text"
        autoComplete="username"
        id="gomments-input-name"
        name="name"
        placeholder="Anonymous"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? 'validation-error' : undefined}
      />
    </div>
  );
}
